mod capture;
mod native;

use tauri::{Emitter, Manager, PhysicalPosition, PhysicalSize};
use tauri_plugin_sql::{Migration, MigrationKind};

const DB_URL: &str = "sqlite:promptlens.db";

fn position_drawer(app: &tauri::AppHandle) -> Result<(), String> {
    let w = app
        .get_webview_window("drawer")
        .ok_or_else(|| "drawer window missing".to_string())?;
    // Prefer the monitor under the cursor so multi-display setups open the
    // drawer on whichever screen the user is currently working on.
    // monitor_from_point has been flaky across Tauri versions, so we do a
    // manual hit test across available_monitors.
    let cursor = app.cursor_position().ok();
    let monitor = cursor
        .and_then(|p| {
            w.available_monitors().ok().and_then(|mons| {
                mons.into_iter().find(|m| {
                    let pos = m.position();
                    let size = m.size();
                    let x = p.x as i32;
                    let y = p.y as i32;
                    x >= pos.x
                        && x < pos.x + size.width as i32
                        && y >= pos.y
                        && y < pos.y + size.height as i32
                })
            })
        })
        .or_else(|| w.primary_monitor().ok().flatten())
        .ok_or_else(|| "no monitor available".to_string())?;
    eprintln!(
        "[promptlens] drawer -> monitor at ({}, {}) size {}x{} (cursor={:?})",
        monitor.position().x,
        monitor.position().y,
        monitor.size().width,
        monitor.size().height,
        cursor
    );
    let mon_pos = monitor.position();
    let mon_size = monitor.size();
    w.set_size(PhysicalSize::new(mon_size.width, mon_size.height))
        .map_err(|e| e.to_string())?;
    w.set_position(PhysicalPosition::new(mon_pos.x, mon_pos.y))
        .map_err(|e| e.to_string())?;
    Ok(())
}

fn show_drawer_at_right(app: &tauri::AppHandle) -> Result<(), String> {
    position_drawer(app)?;
    let w = app
        .get_webview_window("drawer")
        .ok_or_else(|| "drawer window missing".to_string())?;
    w.show().map_err(|e| e.to_string())?;
    w.set_always_on_top(true).ok();
    w.set_focus().map_err(|e| e.to_string())?;
    let _ = app.emit("drawer-shown", ());
    Ok(())
}

#[tauri::command]
async fn toggle_drawer(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("drawer") {
        let is_visible = w.is_visible().unwrap_or(false);
        if is_visible {
            let _ = app.emit("drawer-closing", ());
            // Give the frontend a moment to animate out, then hide.
            tauri::async_runtime::spawn({
                let app = app.clone();
                async move {
                    tokio::time::sleep(std::time::Duration::from_millis(180)).await;
                    if let Some(w) = app.get_webview_window("drawer") {
                        let _ = w.hide();
                    }
                }
            });
        } else {
            show_drawer_at_right(&app)?;
        }
    }
    Ok(())
}

#[tauri::command]
async fn show_drawer(app: tauri::AppHandle) -> Result<(), String> {
    show_drawer_at_right(&app)
}

#[tauri::command]
async fn hide_drawer(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("drawer") {
        w.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
async fn show_overlay(app: tauri::AppHandle) -> Result<(), String> {
    let w = app
        .get_webview_window("overlay")
        .ok_or_else(|| "overlay window missing".to_string())?;
    // Cover the UNION of all displays so the user can drag a selection across
    // monitor boundaries (matches CleanShot / Shottr behavior).
    w.set_fullscreen(false).ok();
    if let Ok(mons) = w.available_monitors() {
        if !mons.is_empty() {
            let mut min_x = i32::MAX;
            let mut min_y = i32::MAX;
            let mut max_x = i32::MIN;
            let mut max_y = i32::MIN;
            for m in &mons {
                let p = m.position();
                let s = m.size();
                min_x = min_x.min(p.x);
                min_y = min_y.min(p.y);
                max_x = max_x.max(p.x + s.width as i32);
                max_y = max_y.max(p.y + s.height as i32);
            }
            let w_total = (max_x - min_x).max(1) as u32;
            let h_total = (max_y - min_y).max(1) as u32;
            let _ = w.set_size(PhysicalSize::new(w_total, h_total));
            let _ = w.set_position(PhysicalPosition::new(min_x, min_y));
        }
    }
    w.set_always_on_top(true).ok();
    w.show().map_err(|e| e.to_string())?;
    w.set_focus().map_err(|e| e.to_string())?;
    #[cfg(target_os = "macos")]
    {
        native::raise_overlay_above_menu_bar(&w).ok();
        // Hide menu bar + Dock while selecting so overlay covers 100% of the
        // display. Restored inside capture_screen before screencapture runs,
        // and inside hide_overlay on the cancel path.
        native::hide_menu_bar_and_dock().ok();
    }
    Ok(())
}

#[tauri::command]
async fn hide_overlay(app: tauri::AppHandle) -> Result<(), String> {
    if let Some(w) = app.get_webview_window("overlay") {
        w.hide().map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    native::restore_presentation_defaults().ok();
    Ok(())
}

fn history_migrations() -> Vec<Migration> {
    vec![Migration {
        version: 1,
        description: "create history table",
        sql: "CREATE TABLE IF NOT EXISTS history (
                id TEXT PRIMARY KEY,
                created_at INTEGER NOT NULL,
                page_url TEXT,
                mode TEXT NOT NULL,
                insight TEXT NOT NULL,
                thumbnail TEXT NOT NULL
              );
              CREATE INDEX IF NOT EXISTS idx_history_created_at ON history(created_at DESC);",
        kind: MigrationKind::Up,
    }]
}

fn trigger_capture(app: &tauri::AppHandle) {
    let _ = show_drawer_at_right(app);
    let _ = app.emit("capture-shortcut", ());
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(desktop)]
    use tauri_plugin_global_shortcut::{
        Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState,
    };

    let mut builder = tauri::Builder::default()
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(
            tauri_plugin_sql::Builder::default()
                .add_migrations(DB_URL, history_migrations())
                .build(),
        );

    #[cfg(desktop)]
    {
        builder = builder.plugin(
            tauri_plugin_global_shortcut::Builder::new()
                .with_handler(|app, _shortcut, event| {
                    if event.state() == ShortcutState::Pressed {
                        // Toggle drawer; if already open, tapping the shortcut
                        // again dismisses it.
                        let app_clone = app.clone();
                        tauri::async_runtime::spawn(async move {
                            let _ = toggle_drawer(app_clone).await;
                        });
                    }
                })
                .build(),
        );
    }

    builder
        .invoke_handler(tauri::generate_handler![
            capture::capture_screen,
            show_overlay,
            hide_overlay,
            show_drawer,
            hide_drawer,
            toggle_drawer,
        ])
        .setup(|app| {
            // Menu-bar-only on macOS: hide from Dock + app switcher.
            #[cfg(target_os = "macos")]
            {
                app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            }

            #[cfg(desktop)]
            {
                use tauri::menu::{Menu, MenuItem};
                use tauri::tray::{MouseButton, MouseButtonState, TrayIconBuilder, TrayIconEvent};

                let handle = app.handle();
                let toggle_i =
                    MenuItem::with_id(handle, "toggle", "Open PromptLens", true, None::<&str>)?;
                let capture_i =
                    MenuItem::with_id(handle, "capture", "Capture region…", true, None::<&str>)?;
                let quit_i = MenuItem::with_id(handle, "quit", "Quit", true, None::<&str>)?;
                let menu =
                    Menu::with_items(handle, &[&toggle_i, &capture_i, &quit_i])?;

                let _tray = TrayIconBuilder::with_id("promptlens-tray")
                    .tooltip("PromptLens")
                    .icon(app.default_window_icon().unwrap().clone())
                    .menu(&menu)
                    .show_menu_on_left_click(false)
                    .on_menu_event(|app, event| match event.id.as_ref() {
                        "toggle" => {
                            let app_clone = app.clone();
                            tauri::async_runtime::spawn(async move {
                                let _ = toggle_drawer(app_clone).await;
                            });
                        }
                        "capture" => trigger_capture(app),
                        "quit" => app.exit(0),
                        _ => {}
                    })
                    .on_tray_icon_event(|tray, event| {
                        if let TrayIconEvent::Click {
                            button: MouseButton::Left,
                            button_state: MouseButtonState::Up,
                            ..
                        } = event
                        {
                            let app = tray.app_handle().clone();
                            tauri::async_runtime::spawn(async move {
                                let _ = toggle_drawer(app).await;
                            });
                        }
                    })
                    .build(app)?;

                // Global shortcut: toggle drawer (Cmd/Ctrl+Shift+Y)
                #[cfg(target_os = "macos")]
                let shortcut =
                    Shortcut::new(Some(Modifiers::SHIFT | Modifiers::SUPER), Code::KeyY);
                #[cfg(not(target_os = "macos"))]
                let shortcut =
                    Shortcut::new(Some(Modifiers::SHIFT | Modifiers::CONTROL), Code::KeyY);

                if let Err(err) = app.global_shortcut().register(shortcut) {
                    eprintln!("global shortcut register failed: {err}");
                }

                // Auto-hide drawer when it loses focus, so clicking outside dismisses it.
                // We attach the listener after the window is ready.
                if let Some(drawer) = app.get_webview_window("drawer") {
                    if let Err(e) = native::install_drawer_style(&drawer) {
                        eprintln!("[promptlens] install_drawer_style failed: {e}");
                    }
                    let app_handle = app.handle().clone();
                    drawer.on_window_event(move |event| {
                        if let tauri::WindowEvent::Focused(false) = event {
                            // Debounce via async spawn so programmatic hide doesn't loop.
                            let app = app_handle.clone();
                            tauri::async_runtime::spawn(async move {
                                // Tiny settle delay to ignore transient focus loss during
                                // show_overlay (we explicitly want to stay open while the
                                // region overlay takes focus).
                                tokio::time::sleep(std::time::Duration::from_millis(40)).await;
                                if let Some(overlay) = app.get_webview_window("overlay") {
                                    if overlay.is_visible().unwrap_or(false) {
                                        return;
                                    }
                                }
                                let _ = hide_drawer(app).await;
                            });
                        }
                    });
                }
            }
            Ok(())
        })
        .build(tauri::generate_context!())
        .expect("error while building tauri application")
        .run(|_app, event| {
            // Never exit on "last window closed" — this is a menu-bar-resident
            // app. Only the explicit tray "Quit" item (`app.exit(0)`) ends it.
            if let tauri::RunEvent::ExitRequested { code, api, .. } = event {
                if code.is_none() {
                    api.prevent_exit();
                }
            }
        });
}
