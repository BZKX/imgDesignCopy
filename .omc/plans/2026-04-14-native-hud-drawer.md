# 原生 HUD 抽屉：Tauri + NSPanel / HWND 深度改造

**Plan date:** 2026-04-14
**Target:** `apps/desktop/` Tauri app
**Scope:** 通过平台原生代码把 Tauri 的 `drawer` 窗口改造成 Raycast 风格的 HUD 浮动面板；保留现有前端与业务代码 99%
**Estimated effort:** 1.5–2 天

---

## 1. Requirements Summary

当前症状：`tauri.conf.json` 里 `transparent: true + decorations: false` 的标准 NSWindow 在 macOS 上渲染白色背板，导致"右侧抽屉 + 左侧透明 dismiss 区"方案崩盘。

目标：
- macOS：把 Tauri 创建的 NSWindow 替换/改造为 **NSPanel**（`NSNonactivatingPanelMask`），覆盖所有 Space + 全屏 App，不进入 Cmd-Tab；左侧透明区真正透出桌面；焦点不被抢。
- Windows：对 HWND 追加 `WS_EX_NOACTIVATE | WS_EX_TOOLWINDOW | WS_EX_LAYERED`，并用 `DwmEnableBlurBehindWindow` 提供毛玻璃；确保抽屉不抢焦点、不进任务栏。
- 前端抽屉 UI、业务 state machine、vision pipeline、SQLite 历史 **零改动**。
- 可降级：关闭原生特性后回退到当前行为（feature flag 控制）。

---

## 2. Acceptance Criteria

- **AC-1** `pnpm --filter @promptlens/desktop tauri dev` 启动后，主 App 不在 Dock / Cmd-Tab 出现（已满足 via `ActivationPolicy::Accessory`）。
- **AC-2** 快捷键唤出抽屉时，**不把 PromptLens 切换为当前前台 App**（前台 App 的标题栏不改变）；测试方式：从 Safari 唤出抽屉，Safari 仍是前台。
- **AC-3** 抽屉窗口的左侧透明 dismiss 区 **真实透出背后桌面/应用**，不再渲染白色；截屏对比必须能看到背后内容。
- **AC-4** 抽屉在**全屏应用之上**可见（NSWindowCollectionBehavior::FullScreenAuxiliary），macOS 跨 Space 跟随（`CanJoinAllSpaces`）。
- **AC-5** 点击抽屉外的透明 dismiss 区 → 抽屉收起；Esc → 收起；抽屉失焦（切到别的 App 窗口）→ 收起；三者都测过。
- **AC-6** Windows：HWND `GetWindowLongPtrW(GWL_EXSTYLE) & WS_EX_NOACTIVATE != 0`，任务栏不出现抽屉条目；关闭别的窗口时抽屉仍在最上层。
- **AC-7** 区域截图 overlay 窗口在抽屉隐藏后接管，仍正常工作（不能被 NSPanel 改造波及）。
- **AC-8** 全局快捷键 `Cmd/Ctrl+Shift+Y` 仍然 toggle 抽屉（零回归）。
- **AC-9** Rust 侧 `cargo check` + `cargo test` 双平台模拟（mac 实机 + 通过 cfg 编译测 windows path）全绿；`pnpm --filter @promptlens/desktop build:web` 绿。
- **AC-10** 降级开关：env var `PROMPTLENS_NATIVE_HUD=0` 或 build-time feature flag `native-hud` 关闭时，行为回到当前 NSWindow 路径，不 crash。

---

## 3. Architecture

```
apps/desktop/src-tauri/
├── Cargo.toml
│   ├── [dependencies]
│   │   ├── objc2 = "0.5"                      (新增，macOS)
│   │   ├── objc2-app-kit = "0.2"              (新增，macOS)
│   │   ├── objc2-foundation = "0.2"           (新增，macOS)
│   │   └── windows = { version = "0.58",      (新增，Windows)
│   │       features = [
│   │         "Win32_UI_WindowsAndMessaging",
│   │         "Win32_Graphics_Dwm",
│   │         "Win32_Foundation"
│   │       ]}
│   └── [features]
│       └── native-hud = []                     (默认启用)
├── src/
│   ├── lib.rs                                  (调用 native::install_drawer_style)
│   ├── capture.rs                              (不变)
│   └── native/
│       ├── mod.rs                              (新建，trait + platform 分派)
│       ├── macos.rs                            (新建，NSPanel 改造)
│       └── windows.rs                          (新建，HWND 扩展样式)
```

前端：
- `apps/desktop/src/main.tsx` — 恢复全屏透明布局（之前改为 440px 是因为透明没生效；NSPanel 路径下透明会生效）。
- `apps/desktop/src/App.tsx` — 恢复 `.drawer-dismiss` 点击层。

---

## 4. Implementation Steps

### Phase A — Rust native 模块（macOS）

**A1** `Cargo.toml`：添加依赖
```toml
[target.'cfg(target_os = "macos")'.dependencies]
objc2 = "0.5"
objc2-app-kit = "0.2"
objc2-foundation = "0.2"

[target.'cfg(target_os = "windows")'.dependencies]
windows = { version = "0.58", features = ["Win32_UI_WindowsAndMessaging", "Win32_Graphics_Dwm", "Win32_Foundation"] }

[features]
default = ["native-hud"]
native-hud = []
```

**A2** `src/native/mod.rs`（新建）
```rust
use tauri::WebviewWindow;

#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "windows")]
mod windows;

pub fn install_drawer_style(window: &WebviewWindow) -> Result<(), String> {
    if std::env::var("PROMPTLENS_NATIVE_HUD").ok().as_deref() == Some("0") {
        return Ok(()); // 降级：保持 Tauri 默认窗口
    }
    #[cfg(target_os = "macos")]
    return macos::install(window);
    #[cfg(target_os = "windows")]
    return windows::install(window);
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    Ok(())
}
```

**A3** `src/native/macos.rs`（新建，~80 行）

要做的事：
1. 通过 `window.ns_window()` 拿到 `*mut NSWindow` 裸指针（Tauri 暴露的 API）。
2. 设置 `styleMask` 追加 `NSWindowStyleMask::NonactivatingPanel`（关键）。
3. 设置 `isOpaque = NO`, `backgroundColor = [NSColor clearColor]`, `hasShadow = YES`。
4. 设置 `level = NSFloatingWindowLevel`（或 `NSStatusWindowLevel` 压 Dock）。
5. 设置 `collectionBehavior = CanJoinAllSpaces | FullScreenAuxiliary | Stationary`。
6. 可选：添加 `NSVisualEffectView` 作为 contentView 的兄弟层（但前端已经用 `backdrop-filter`，这步可跳过）。
7. 关键修复：**强制 webview 的 `NSView layer` 设为 `isOpaque = false`**，否则 WKWebView 自己还是会渲染白背。

```rust
use objc2::runtime::{AnyObject, NSObjectProtocol};
use objc2::msg_send;
use objc2_app_kit::{NSColor, NSView, NSWindow, NSWindowCollectionBehavior, NSWindowStyleMask, NSWindowLevel};
use tauri::WebviewWindow;

pub fn install(window: &WebviewWindow) -> Result<(), String> {
    let ns_window_ptr = window.ns_window().map_err(|e| e.to_string())? as *mut NSWindow;
    if ns_window_ptr.is_null() { return Err("null NSWindow".into()); }
    unsafe {
        let ns_window: &NSWindow = &*ns_window_ptr;

        // 1. Non-activating panel style — 不抢焦点
        let mut mask = ns_window.styleMask();
        mask |= NSWindowStyleMask::NonactivatingPanel;
        mask |= NSWindowStyleMask::Borderless;
        ns_window.setStyleMask(mask);

        // 2. 透明背板
        ns_window.setOpaque(false);
        let clear: Option<&NSColor> = Some(&NSColor::clearColor());
        ns_window.setBackgroundColor(clear);
        ns_window.setHasShadow(false);

        // 3. 浮在顶层
        ns_window.setLevel(NSWindowLevel::FloatingWindow);

        // 4. 跨 Space + 全屏辅助
        ns_window.setCollectionBehavior(
            NSWindowCollectionBehavior::CanJoinAllSpaces
                | NSWindowCollectionBehavior::FullScreenAuxiliary
                | NSWindowCollectionBehavior::Stationary,
        );

        // 5. 强制 contentView 透明（WKWebView 默认白背板的根因）
        let content_view: *mut NSView = msg_send![ns_window, contentView];
        if !content_view.is_null() {
            let _: () = msg_send![content_view, setWantsLayer: true];
            let layer: *mut AnyObject = msg_send![content_view, layer];
            if !layer.is_null() {
                let _: () = msg_send![layer, setOpaque: false];
                let _: () = msg_send![layer, setBackgroundColor: std::ptr::null::<AnyObject>()];
            }
        }
    }
    Ok(())
}
```

**关键点**：最后那段 `contentView.layer.setOpaque(NO) + backgroundColor=nil` 就是 macOS 下 Tauri transparent 窗口白背的根因，Tauri issue 里广泛讨论。

**A4** `src/native/windows.rs`（新建，~40 行）
```rust
use tauri::WebviewWindow;
use windows::Win32::Foundation::HWND;
use windows::Win32::Graphics::Dwm::{DwmEnableBlurBehindWindow, DWM_BLURBEHIND, DWM_BB_ENABLE};
use windows::Win32::UI::WindowsAndMessaging::{
    GetWindowLongPtrW, SetWindowLongPtrW, GWL_EXSTYLE,
    WS_EX_LAYERED, WS_EX_NOACTIVATE, WS_EX_TOOLWINDOW, WS_EX_TOPMOST,
};

pub fn install(window: &WebviewWindow) -> Result<(), String> {
    let hwnd = HWND(window.hwnd().map_err(|e| e.to_string())?.0);
    unsafe {
        let existing = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
        let new = existing
            | WS_EX_NOACTIVATE.0 as isize
            | WS_EX_TOOLWINDOW.0 as isize
            | WS_EX_LAYERED.0 as isize
            | WS_EX_TOPMOST.0 as isize;
        SetWindowLongPtrW(hwnd, GWL_EXSTYLE, new);

        // 毛玻璃 blur
        let bb = DWM_BLURBEHIND {
            dwFlags: DWM_BB_ENABLE,
            fEnable: true.into(),
            hRgnBlur: windows::Win32::Graphics::Gdi::HRGN::default(),
            fTransitionOnMaximized: false.into(),
        };
        let _ = DwmEnableBlurBehindWindow(hwnd, &bb);
    }
    Ok(())
}
```

Windows 11 的 Mica/Acrylic 进一步增强可作为 follow-up。

**A5** `src/lib.rs` 改造
- 导入 `mod native;`
- `run()` 的 setup hook 里，在 `if let Some(drawer) = app.get_webview_window("drawer")` 分支中，添加 `native::install_drawer_style(&drawer).ok();` 调用。
- 保持现有 `ActivationPolicy::Accessory` 设置。
- 保持现有 `on_window_event Focused(false) → hide_drawer` 自动收起逻辑。
- overlay 窗口**不要**调用 `install_drawer_style`（它是全屏截图选区，不是 HUD）。

---

### Phase B — 前端恢复全屏透明布局

**B1** `apps/desktop/src-tauri/tauri.conf.json`
- 保持 `drawer` 窗口 `transparent: true, decorations: false, alwaysOnTop: true, skipTaskbar: true, shadow: false, focus: false`（新增 `focus: false` 防止初次聚焦）。

**B2** `apps/desktop/src-tauri/src/lib.rs` 的 `position_drawer`
- 改回全屏尺寸：`set_size(monitor.width, monitor.height)`, `set_position(0, 0)`。
- 前端 `.panel` 用 440px right-anchored 的老方案（之前 main.tsx 里的版本）。

**B3** `apps/desktop/src/main.tsx`
- 恢复：
  ```ts
  if (!isOverlay) {
    const reset = document.createElement('style');
    reset.textContent = `
      html, body, #root { margin:0; padding:0; height:100%; width:100%; background:transparent !important; overflow:hidden; }
      .drawer-shell.panel { position:absolute; top:16px; right:16px; bottom:16px; left:auto; width:440px; max-width:calc(100vw - 32px); }
      .drawer-dismiss { position:fixed; inset:0; background:transparent; z-index:2147483645; }
    `;
    document.head.appendChild(reset);
  }
  ```

**B4** `apps/desktop/src/App.tsx`
- 恢复 `<div className="drawer-dismiss" onClick={closeDrawer} aria-hidden />` + 外层 Fragment（与第一次实现相同）。

**B5** `apps/desktop/src/styles.ts`
- 删掉 `:host, :root { all: initial; }` 注释占位行（已删过），保持现状。

---

### Phase C — 验证

**C1** `cargo check --manifest-path apps/desktop/src-tauri/Cargo.toml` — 三态（mac 默认、`--no-default-features`、`--features native-hud`）全绿。

**C2** `pnpm --filter @promptlens/desktop build:web` — 前端 tsc 零错误。

**C3** 手测脚本（README 附录）：
1. `pnpm --filter @promptlens/desktop tauri dev`
2. 打开 Safari 覆盖屏幕
3. 按 `Cmd+Shift+Y` 唤出抽屉
4. 观察 Safari 标题栏**未变灰**（NSPanel 不抢焦点）
5. 左侧透明区能看到 Safari 内容（AC-3）
6. 点击左侧透明区 → 抽屉收起（AC-5）
7. 进入全屏 YouTube，再按快捷键 → 抽屉出现在全屏之上（AC-4）
8. 按 `Cmd+Tab` → PromptLens **不在切换列表**（AC-1）

**C4** 在 Tauri dev console 查看 `window.__TAURI_INTERNALS__` 事件日志，验证 `drawer-shown` / `drawer-closing` 事件按预期 fire。

**C5** Windows 端若无实机：在 macOS 上通过 `cargo check --target x86_64-pc-windows-msvc`（需要先 `rustup target add`）验证 Windows path 编译通过。不要求运行。

---

## 5. Risks & Mitigations

| # | 风险 | 影响 | 缓解 |
|---|---|---|---|
| R1 | `objc2` vs `cocoa` crate 选型踩坑：`objc2` 更现代但 API 变动快，版本间不兼容 | Rust 编译失败 | 锁死 `objc2 = "=0.5.2"` + `objc2-app-kit = "=0.2.2"`，写死版本；若 API 变动另选老 `cocoa = "0.26"`。 |
| R2 | `WebviewWindow::ns_window()` 返回 `*mut c_void`，类型擦除后 msg_send 传错类 | SIGSEGV | 在 `install` 入口 assert NSWindow class 非空；首次运行在 DEBUG build 打日志记录 class 名。 |
| R3 | 改 `styleMask` 后 Tauri 自己的事件循环错乱（resize/move/close 事件丢失） | 抽屉关不掉、快捷键失灵 | 只追加 `NonactivatingPanel` 位，**不**移除 Tauri 原有 mask；保留 `Borderless`。 |
| R4 | macOS 13 之前 NSVisualEffectView 有兼容问题 | 毛玻璃失效 | 仅依赖 CSS `backdrop-filter`，不引入原生 vibrancy；minimumSystemVersion 保持 "11.0"。 |
| R5 | Windows `WS_EX_NOACTIVATE` + 键盘输入冲突（输入框无法聚焦） | 设置页 API Key 输入不了 | 用户点击输入框时手动调用 `SetForegroundWindow` OR 只在闲置态设 NOACTIVATE，输入时临时移除。参考 Raycast Windows 实现。 |
| R6 | `PROMPTLENS_NATIVE_HUD=0` 降级路径回归测试缺失 | 降级实际坏掉 | 在 `lib.rs` 加 `#[cfg(debug_assertions)]` 下打印"native hud: enabled/disabled"，CI 跑两种模式 `cargo check`。 |
| R7 | overlay 窗口也被 NSPanel 改造污染 | 区域截图不工作 | 只对 `label == "drawer"` 的窗口调用 install_drawer_style；overlay 保持 Tauri 默认 NSWindow。 |

---

## 6. Verification Checklist

- [ ] `cargo check` 三态绿
- [ ] `pnpm --filter @promptlens/desktop build:web` 绿
- [ ] `pnpm -r test` 75+ 测试零回归
- [ ] AC-1 ~ AC-10 手测逐条通过
- [ ] README 添加：原生 HUD 特性说明 + macOS 权限提醒 + Windows 限制注记
- [ ] git commit 单独一笔 `feat(desktop): native NSPanel/HWND HUD drawer`

---

## 7. ADR

- **Decision**：Tauri + 平台原生代码（macOS NSPanel via objc2；Windows HWND extended style + DWM blur），保留 99% 现有前端。
- **Drivers**：
  1. 现有前端 + 业务逻辑不能扔（沉没成本 + 已通过测试）。
  2. Raycast 风 HUD 需要非激活面板语义，Tauri 标配 NSWindow 给不了。
  3. Electron 切换成本 >> 写 200 行原生代码。
- **Alternatives considered**：
  - Electron：bundle 10x、内存 3-5x，拒绝。
  - 改 UX 回传统有边框窗口：失去 HUD 体验，用户已表态要原生方案。
  - `NSWindow` hack 继续挣扎：透明白背是 WKWebView 底层 bug，没办法从 Tauri 层绕过。
- **Why chosen**：**最小改动拿到最大体验提升**。原生代码只 ~150 行（macOS）+ 40 行（Windows），边界清晰，feature flag 可降级。
- **Consequences**：
  - 新增 4 个 Rust crate 依赖（objc2 系列 + windows）。
  - 需要处理 Windows 输入框聚焦 edge case（R5）。
  - macOS 13 以下用户可能失去部分原生质感（毛玻璃由 CSS 承担）。
  - Rust unsafe 代码量 +1 个模块，需要 code review。
- **Follow-ups**：
  - Windows 11 Mica/Acrylic 集成（DWM_SYSTEMBACKDROP_TYPE）
  - 原生侧 slide-in 动画（`setFrame:display:animate:`）替代 CSS slide
  - Linux 端：暂不支持 HUD 语义，回退到 tauri 默认行为

---

## 8. Out of Scope

- 代码签名 / 公证（Developer ID、EV 证书）
- Windows 11 Mica 主题
- 自动更新 (`tauri-plugin-updater`)
- Linux HUD 实现
