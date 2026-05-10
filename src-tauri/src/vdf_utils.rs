use std::fs;
use std::path::Path;
use steam_shortcuts_util::{parse_shortcuts, shortcuts_to_bytes, Shortcut};
use crc32fast::Hasher;

pub fn calculate_appid_32(exe: &str, name: &str) -> u32 {
    let mut hasher = Hasher::new();
    let key = format!("{}{}", exe, name);
    hasher.update(key.as_bytes());
    let checksum = hasher.finalize();
    checksum | 0x80000000
}

pub fn calculate_appid_64(exe: &str, name: &str) -> u64 {
    let appid_32 = calculate_appid_32(exe, name);
    ((appid_32 as u64) << 32) | 0x02000000
}

pub fn backup_shortcuts(path: &Path) -> std::io::Result<()> {
    if path.exists() {
        let mut backup_path = path.to_path_buf();
        backup_path.set_extension("vdf.bak");
        fs::copy(path, backup_path)?;
    }
    Ok(())
}

pub fn add_shortcut(
    vdf_path: &Path,
    app_name: &str,
    exe_path: &str,
    start_dir: &str,
    icon_path: &str,
) -> Result<(u32, u64), String> {
    
    let content = if vdf_path.exists() {
        fs::read(vdf_path).map_err(|e| e.to_string())?
    } else {
        Vec::new()
    };

    let mut shortcuts = if !content.is_empty() {
        parse_shortcuts(&content).map_err(|e| e.to_string())?
    } else {
        Vec::new()
    };

    // Remove existing with same name to perform an overwrite
    shortcuts.retain(|s| s.app_name != app_name);

    let quoted_exe = format!("\"{}\"", exe_path);
    let quoted_start = format!("\"{}\"", start_dir);

    // Note: User requested quotes in the VDF target field.
    // We must calculate the AppID using the exact string that goes into the VDF.
    let appid_32 = calculate_appid_32(&quoted_exe, app_name);
    let appid_64 = calculate_appid_64(&quoted_exe, app_name);

    let new_shortcut = Shortcut::new(
        "0",
        app_name,
        &quoted_exe,
        &quoted_start,
        icon_path,
        "",
        "",
    );
    
    // We can also set tags or other properties if needed later
    
    shortcuts.push(new_shortcut);

    let bytes = shortcuts_to_bytes(&shortcuts);
    
    if vdf_path.exists() {
        backup_shortcuts(vdf_path).map_err(|e| e.to_string())?;
    } else {
        // Ensure directory exists
        if let Some(parent) = vdf_path.parent() {
            fs::create_dir_all(parent).map_err(|e| e.to_string())?;
        }
    }
    
    fs::write(vdf_path, bytes).map_err(|e| e.to_string())?;

    Ok((appid_32, appid_64))
}

pub async fn download_artwork(url: &str, target_path: &Path) -> Result<(), String> {
    // Ensure parent directory exists
    if let Some(parent) = target_path.parent() {
        fs::create_dir_all(parent).map_err(|e| e.to_string())?;
    }
    
    let client = reqwest::Client::new();
    let response = client.get(url).send().await.map_err(|e| e.to_string())?;
    let bytes = response.bytes().await.map_err(|e| e.to_string())?;
    fs::write(target_path, bytes).map_err(|e| e.to_string())?;
    Ok(())
}
