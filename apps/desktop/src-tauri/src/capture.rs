use base64::Engine;
use image::ImageFormat;
use serde::{Deserialize, Serialize};
use std::io::Cursor;

#[derive(Serialize)]
pub struct CaptureResult {
    pub base64: String,
    pub width: u32,
    pub height: u32,
    pub mime: String,
}

#[derive(Deserialize)]
pub struct Region {
    pub x: i32,
    pub y: i32,
    pub w: u32,
    pub h: u32,
    #[serde(default = "default_dpr")]
    pub dpr: f32,
}

fn default_dpr() -> f32 {
    1.0
}

#[tauri::command]
pub async fn capture_screen(
    app: tauri::AppHandle,
    region: Option<Region>,
) -> Result<CaptureResult, String> {
    let raw_png = capture_raw_png(&app, region.as_ref()).await?;
    encode_scaled_jpeg(&raw_png)
}

#[cfg(target_os = "macos")]
async fn capture_raw_png(
    app: &tauri::AppHandle,
    region: Option<&Region>,
) -> Result<Vec<u8>, String> {
    use image::{DynamicImage, ImageFormat};
    use tauri::Manager;
    use xcap::Monitor;

    let overlay = app.get_webview_window("overlay");
    let overlay_origin_phys = overlay
        .as_ref()
        .and_then(|w| w.outer_position().ok())
        .map(|p| (p.x, p.y))
        .unwrap_or((0, 0));
    let cursor_phys = app.cursor_position().ok().map(|p| (p.x as i32, p.y as i32));

    let anchor = cursor_phys.or_else(|| {
        region.map(|r| {
            let dpr = if r.dpr > 0.0 { r.dpr as i32 } else { 1 };
            (
                overlay_origin_phys.0 + (r.x + r.w as i32 / 2) * dpr,
                overlay_origin_phys.1 + (r.y + r.h as i32 / 2) * dpr,
            )
        })
    });

    // Restore menu bar + Dock before snapshot.
    crate::native::restore_presentation_defaults().ok();
    std::thread::sleep(std::time::Duration::from_millis(160));

    // Pick the xcap Monitor containing the anchor.
    let monitors = Monitor::all().map_err(|e| format!("xcap all: {e}"))?;
    let picked = anchor.and_then(|(ax, ay)| {
        monitors.iter().find(|m| {
            let mx = m.x().unwrap_or(0);
            let my = m.y().unwrap_or(0);
            let mw = m.width().unwrap_or(0) as i32;
            let mh = m.height().unwrap_or(0) as i32;
            ax >= mx && ax < mx + mw && ay >= my && ay < my + mh
        })
    });
    let monitor = picked
        .cloned()
        .or_else(|| monitors.into_iter().next())
        .ok_or_else(|| "no monitor available".to_string())?;
    let mx = monitor.x().unwrap_or(0);
    let my = monitor.y().unwrap_or(0);
    eprintln!(
        "[promptlens] xcap capture monitor=({mx},{my},{}x{}) anchor={:?} overlay_origin={:?}",
        monitor.width().unwrap_or(0),
        monitor.height().unwrap_or(0),
        anchor,
        overlay_origin_phys
    );
    let raw_img = monitor
        .capture_image()
        .map_err(|e| format!("xcap capture_image: {e}"))?;
    let (iw, ih) = raw_img.dimensions();

    // Crop locally in physical pixels if a region was provided.
    let (final_img, _): (image::RgbaImage, ()) = if let Some(r) = region {
        let dpr = if r.dpr > 0.0 { r.dpr as f32 } else { 1.0 };
        let gx = overlay_origin_phys.0 + ((r.x as f32) * dpr).round() as i32;
        let gy = overlay_origin_phys.1 + ((r.y as f32) * dpr).round() as i32;
        let gw = ((r.w as f32) * dpr).round() as i32;
        let gh = ((r.h as f32) * dpr).round() as i32;
        let lx = (gx - mx).max(0);
        let ly = (gy - my).max(0);
        let lw = gw.min(iw as i32 - lx).max(1) as u32;
        let lh = gh.min(ih as i32 - ly).max(1) as u32;
        let lx = lx.min(iw as i32 - 1) as u32;
        let ly = ly.min(ih as i32 - 1) as u32;
        eprintln!(
            "[promptlens] crop local=({lx},{ly},{lw},{lh}) monitor={iw}x{ih}"
        );
        (
            image::imageops::crop_imm(&raw_img, lx, ly, lw, lh).to_image(),
            (),
        )
    } else {
        (raw_img, ())
    };

    let mut buf = Cursor::new(Vec::new());
    DynamicImage::ImageRgba8(final_img)
        .write_to(&mut buf, ImageFormat::Png)
        .map_err(|e| format!("encode png: {e}"))?;
    Ok(buf.into_inner())
}

#[cfg(not(target_os = "macos"))]
async fn capture_raw_png(
    _app: &tauri::AppHandle,
    region: Option<&Region>,
) -> Result<Vec<u8>, String> {
    use image::{DynamicImage, ImageBuffer, Rgba};
    use xcap::Monitor;

    let monitors = Monitor::all().map_err(|e| e.to_string())?;
    let monitor = monitors
        .into_iter()
        .next()
        .ok_or_else(|| "no monitor available".to_string())?;
    let raw = monitor.capture_image().map_err(|e| e.to_string())?;
    let mut image: ImageBuffer<Rgba<u8>, Vec<u8>> = raw;
    if let Some(r) = region {
        let (iw, ih) = image.dimensions();
        let dpr = if r.dpr > 0.0 { r.dpr } else { 1.0 };
        let px = ((r.x as f32) * dpr).max(0.0) as u32;
        let py = ((r.y as f32) * dpr).max(0.0) as u32;
        let pw = ((r.w as f32) * dpr).max(0.0) as u32;
        let ph = ((r.h as f32) * dpr).max(0.0) as u32;
        let x = px.min(iw);
        let y = py.min(ih);
        let w = pw.min(iw.saturating_sub(x));
        let h = ph.min(ih.saturating_sub(y));
        if w > 0 && h > 0 {
            image = image::imageops::crop_imm(&image, x, y, w, h).to_image();
        }
    }
    let mut buf = Cursor::new(Vec::new());
    DynamicImage::ImageRgba8(image)
        .write_to(&mut buf, ImageFormat::Png)
        .map_err(|e| e.to_string())?;
    Ok(buf.into_inner())
}

fn encode_scaled_jpeg(png_bytes: &[u8]) -> Result<CaptureResult, String> {
    let image = image::load_from_memory(png_bytes)
        .map_err(|e| format!("decode png: {e}"))?
        .to_rgba8();
    let (w, h) = image.dimensions();
    let max_edge: u32 = 1280;
    let long = w.max(h);
    let (tw, th) = if long > max_edge {
        let scale = max_edge as f32 / long as f32;
        ((w as f32 * scale) as u32, (h as f32 * scale) as u32)
    } else {
        (w, h)
    };
    let resized = if (tw, th) != (w, h) {
        image::imageops::resize(&image, tw, th, image::imageops::FilterType::Lanczos3)
    } else {
        image
    };
    let mut buf = Cursor::new(Vec::new());
    image::DynamicImage::ImageRgba8(resized)
        .to_rgb8()
        .write_to(&mut buf, ImageFormat::Jpeg)
        .map_err(|e| format!("encode jpeg: {e}"))?;
    let b64 = base64::engine::general_purpose::STANDARD.encode(buf.into_inner());
    Ok(CaptureResult {
        base64: b64,
        width: tw,
        height: th,
        mime: "image/jpeg".into(),
    })
}
