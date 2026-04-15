use objc2::msg_send;
use objc2::runtime::AnyObject;
use tauri::WebviewWindow;

// AppKit constants (values taken from <AppKit/NSWindow.h>).
const NS_WINDOW_STYLE_MASK_NONACTIVATING_PANEL: usize = 1 << 7;
const NS_FLOATING_WINDOW_LEVEL: isize = 3;
// NSScreenSaverWindowLevel — sits above the menu bar (NSMainMenuWindowLevel=24).
const NS_SCREEN_SAVER_WINDOW_LEVEL: isize = 1000;
// NSWindowCollectionBehavior bits.
const NS_COLLECTION_CAN_JOIN_ALL_SPACES: usize = 1 << 0;
const NS_COLLECTION_STATIONARY: usize = 1 << 4;
const NS_COLLECTION_FULL_SCREEN_AUXILIARY: usize = 1 << 8;

pub fn install(window: &WebviewWindow) -> Result<(), String> {
    let ns_window_ptr = window.ns_window().map_err(|e| e.to_string())? as *mut AnyObject;
    if ns_window_ptr.is_null() {
        return Err("ns_window returned null".into());
    }
    unsafe {
        let ns_window: &AnyObject = &*ns_window_ptr;

        // Append NonactivatingPanel to styleMask — don't strip existing bits.
        let current: usize = msg_send![ns_window, styleMask];
        let new_mask: usize = current | NS_WINDOW_STYLE_MASK_NONACTIVATING_PANEL;
        let _: () = msg_send![ns_window, setStyleMask: new_mask];

        let _: () = msg_send![ns_window, setOpaque: false];

        let ns_color_cls = objc2::class!(NSColor);
        let clear_color: *mut AnyObject = msg_send![ns_color_cls, clearColor];
        if !clear_color.is_null() {
            let _: () = msg_send![ns_window, setBackgroundColor: clear_color];
        }

        let _: () = msg_send![ns_window, setHasShadow: false];
        let _: () = msg_send![ns_window, setLevel: NS_FLOATING_WINDOW_LEVEL];

        let collection: usize = NS_COLLECTION_CAN_JOIN_ALL_SPACES
            | NS_COLLECTION_FULL_SCREEN_AUXILIARY
            | NS_COLLECTION_STATIONARY;
        let _: () = msg_send![ns_window, setCollectionBehavior: collection];

        // Fix WKWebView's opaque white backing layer — main root cause of
        // Tauri's transparent-window-renders-white bug on macOS.
        // NOTE: CALayer.setBackgroundColor: expects CGColorRef (C struct),
        // not an Objective-C id. Skipping it here — setOpaque:NO on both the
        // layer and parent NSView is enough in practice once the window is
        // non-opaque with clearColor background.
        let content_view: *mut AnyObject = msg_send![ns_window, contentView];
        if !content_view.is_null() {
            let _: () = msg_send![content_view, setWantsLayer: true];
            let _: () = msg_send![content_view, setOpaque: false];
            let layer: *mut AnyObject = msg_send![content_view, layer];
            if !layer.is_null() {
                let _: () = msg_send![layer, setOpaque: false];
            }
        }
    }
    Ok(())
}

/// Raise the overlay window above the macOS menu bar and cover all Spaces.
/// The overlay VISUALLY covers menu bar + Dock via NSScreenSaverWindowLevel,
/// but we never touch setPresentationOptions — the system menu bar and Dock
/// remain in place so that xcap's screen capture (after overlay is hidden)
/// still captures them.
pub fn raise_overlay_above_menu_bar(window: &WebviewWindow) -> Result<(), String> {
    let ns_window_ptr = window.ns_window().map_err(|e| e.to_string())? as *mut AnyObject;
    if ns_window_ptr.is_null() {
        return Err("ns_window returned null".into());
    }
    unsafe {
        // Activate the app FIRST so that subsequent window ordering picks up
        // the new active state and menu bar clicks route to us.
        let ns_app_cls = objc2::class!(NSApplication);
        let ns_app: *mut AnyObject = msg_send![ns_app_cls, sharedApplication];
        if !ns_app.is_null() {
            let _: () = msg_send![ns_app, activateIgnoringOtherApps: true];
        }

        let ns_window: &AnyObject = &*ns_window_ptr;
        let _: () = msg_send![ns_window, setLevel: NS_SCREEN_SAVER_WINDOW_LEVEL];
        let collection: usize = NS_COLLECTION_CAN_JOIN_ALL_SPACES
            | NS_COLLECTION_FULL_SCREEN_AUXILIARY
            | NS_COLLECTION_STATIONARY;
        let _: () = msg_send![ns_window, setCollectionBehavior: collection];
        // Synchronously take key + front — stronger than Tauri's show + set_focus.
        let _: () = msg_send![ns_window, makeKeyAndOrderFront: std::ptr::null::<AnyObject>()];
    }
    Ok(())
}

// NSApplicationPresentationOptions bits.
// NOTE: macOS requires menu bar and Dock auto-hide to be set TOGETHER —
// setting one without the other raises NSInvalidArgumentException.
#[allow(dead_code)]
const NS_APP_PRES_AUTO_HIDE_DOCK: usize = 1 << 0;
#[allow(dead_code)]
const NS_APP_PRES_HIDE_DOCK: usize = 1 << 1;
const NS_APP_PRES_AUTO_HIDE_MENU_BAR: usize = 1 << 2;
#[allow(dead_code)]
const NS_APP_PRES_HIDE_MENU_BAR: usize = 1 << 3;
const NS_APP_PRES_DEFAULT: usize = 0;

/// Hide the system menu bar so the overlay owns the top 24pt of the screen
/// during selection. Dock is left visible per product requirement. Used only
/// during region selection; restored before capture.
pub fn hide_menu_bar_and_dock() -> Result<(), String> {
    unsafe {
        let ns_app_cls = objc2::class!(NSApplication);
        let ns_app: *mut AnyObject = msg_send![ns_app_cls, sharedApplication];
        if ns_app.is_null() {
            return Err("NSApplication unavailable".into());
        }
        // AutoHide on both — required pair per AppKit. Menu bar retreats so
        // overlay clicks hit the overlay; Dock pops back on hover, giving the
        // visual impression that the Dock "stays visible".
        let opts: usize = NS_APP_PRES_AUTO_HIDE_MENU_BAR | NS_APP_PRES_AUTO_HIDE_DOCK;
        let _: () = msg_send![ns_app, setPresentationOptions: opts];
    }
    Ok(())
}

/// Restore normal menu bar + Dock presentation. Call before screencapture so
/// the captured screenshot includes them, and on overlay cancel.
pub fn restore_presentation_defaults() -> Result<(), String> {
    unsafe {
        let ns_app_cls = objc2::class!(NSApplication);
        let ns_app: *mut AnyObject = msg_send![ns_app_cls, sharedApplication];
        if !ns_app.is_null() {
            let _: () = msg_send![ns_app, setPresentationOptions: NS_APP_PRES_DEFAULT];
        }
    }
    Ok(())
}
