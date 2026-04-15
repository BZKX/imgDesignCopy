use tauri::WebviewWindow;

#[cfg(target_os = "macos")]
mod macos;
#[cfg(target_os = "windows")]
mod windows;

#[cfg(target_os = "macos")]
pub use macos::{
    hide_menu_bar_and_dock, raise_overlay_above_menu_bar, restore_presentation_defaults,
};

pub fn install_drawer_style(window: &WebviewWindow) -> Result<(), String> {
    if std::env::var("PROMPTLENS_NATIVE_HUD").ok().as_deref() == Some("0") {
        return Ok(());
    }
    #[cfg(target_os = "macos")]
    {
        return macos::install(window);
    }
    #[cfg(target_os = "windows")]
    {
        return windows::install(window);
    }
    #[cfg(not(any(target_os = "macos", target_os = "windows")))]
    {
        let _ = window;
        Ok(())
    }
}
