use tauri::WebviewWindow;
use windows::Win32::Foundation::{BOOL, HWND};
use windows::Win32::Graphics::Dwm::{DwmEnableBlurBehindWindow, DWM_BB_ENABLE, DWM_BLURBEHIND};
use windows::Win32::Graphics::Gdi::HRGN;
use windows::Win32::UI::WindowsAndMessaging::{
    GetWindowLongPtrW, SetWindowLongPtrW, GWL_EXSTYLE, WS_EX_LAYERED, WS_EX_NOACTIVATE,
    WS_EX_TOOLWINDOW, WS_EX_TOPMOST,
};

pub fn install(window: &WebviewWindow) -> Result<(), String> {
    let raw = window.hwnd().map_err(|e| e.to_string())?;
    let hwnd = HWND(raw.0);
    if hwnd.0.is_null() {
        return Err("hwnd returned null".into());
    }
    unsafe {
        let existing = GetWindowLongPtrW(hwnd, GWL_EXSTYLE);
        let extra = (WS_EX_NOACTIVATE.0 as isize)
            | (WS_EX_TOOLWINDOW.0 as isize)
            | (WS_EX_LAYERED.0 as isize)
            | (WS_EX_TOPMOST.0 as isize);
        let new = existing | extra;
        SetWindowLongPtrW(hwnd, GWL_EXSTYLE, new);

        let bb = DWM_BLURBEHIND {
            dwFlags: DWM_BB_ENABLE,
            fEnable: BOOL::from(true),
            hRgnBlur: HRGN::default(),
            fTransitionOnMaximized: BOOL::from(false),
        };
        let _ = DwmEnableBlurBehindWindow(hwnd, &bb);
    }
    Ok(())
}
