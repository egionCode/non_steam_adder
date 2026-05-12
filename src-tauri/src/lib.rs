mod steam;
mod vdf_utils;
mod metadata;
mod steamgriddb;

use steamgriddb::{SGDBGame, SGDBArtwork};

// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[tauri::command]
fn get_game_metadata(path: String) -> Option<String> {
    metadata::extract_product_name(&path)
}

#[tauri::command]
async fn search_sgdb_games(query: String) -> Result<Vec<SGDBGame>, String> {
    // In a real app, this key would be securely managed. 
    // For this implementation, we expect it in the environment.
    let api_key = std::env::var("SGDB_API_KEY").unwrap_or_else(|_| "f66d29915ba18e571f169e9dc6bd04c4".to_string());
    if api_key.is_empty() {
        return Err("SGDB_API_KEY environment variable is not set".to_string());
    }
    steamgriddb::search_game(&api_key, &query).await
}

#[tauri::command]
async fn get_sgdb_artworks(
    game_id: u32, 
    art_type: String, 
    dimensions: Option<String>, 
    types: Option<String>,
    styles: Option<String>,
    mimes: Option<String>,
    nsfw: Option<bool>,
    humor: Option<bool>,
    epilepsy: Option<bool>,
    page: Option<u32>,
    languages: Option<String>,
    sort: Option<String>,
) -> Result<Vec<SGDBArtwork>, String> {
    let api_key = std::env::var("SGDB_API_KEY").unwrap_or_else(|_| "f66d29915ba18e571f169e9dc6bd04c4".to_string());
    if api_key.is_empty() {
        return Err("SGDB_API_KEY environment variable is not set".to_string());
    }
    steamgriddb::get_artworks(
        &api_key, 
        game_id, 
        &art_type, 
        dimensions.as_deref(), 
        types.as_deref(),
        styles.as_deref(),
        mimes.as_deref(),
        nsfw,
        humor,
        epilepsy,
        page,
        languages.as_deref(),
        sort.as_deref()
    ).await
}

#[tauri::command]
async fn add_game_to_steam(
    game_title: String,
    exe_path: String,
    grid_url: Option<String>,
    wide_url: Option<String>,
    hero_url: Option<String>,
    logo_url: Option<String>,
    icon_url: Option<String>,
) -> Result<(), String> {
    let user_ids = steam::get_steam_user_ids();
    if user_ids.is_empty() {
        return Err("No Steam user found".to_string());
    }
    
    // We target the first user ID found (typically the main user)
    let user_id = &user_ids[0];
    let shortcuts_path = steam::get_shortcuts_path(user_id).ok_or("Shortcuts path not found")?;
    let grid_path_base = steam::get_grid_path(user_id).ok_or("Grid path not found")?;

    let exe_path_buf = std::path::PathBuf::from(&exe_path);
    let start_dir = exe_path_buf.parent()
        .and_then(|p| p.to_str())
        .unwrap_or("");

    // Calculate IDs (quoted as requested for VDF/AppID consistency)
    let quoted_exe = format!("\"{}\"", exe_path);
    let appid_32_q = vdf_utils::calculate_appid_32(&quoted_exe, &game_title);
    let appid_64_q = vdf_utils::calculate_appid_64(&quoted_exe, &game_title);
    let appid_32_u = vdf_utils::calculate_appid_32(&exe_path, &game_title);
    let appid_64_u = vdf_utils::calculate_appid_64(&exe_path, &game_title);

    // Sidebar Icon path
    // Steam expects a direct path to the file in the "icon" field of shortcuts.vdf
    let mut icon_path_vdf = String::new();
    if let Some(url) = icon_url {
        let icon_filename = format!("{}_icon.png", appid_32_q);
        let path = grid_path_base.join(&icon_filename);
        let _ = vdf_utils::download_artwork(&url, &path).await;
        icon_path_vdf = path.to_string_lossy().to_string();
    }

    // 1. Add to VDF
    let _ = vdf_utils::add_shortcut(&shortcuts_path, &game_title, &exe_path, start_dir, &icon_path_vdf)?;
    
    println!("Shortcut added with IDs (quoted): 32bit={}, 64bit={}", appid_32_q, appid_64_q);

    // 2. Download artworks
    let ids = [
        appid_32_q.to_string(), 
        appid_64_q.to_string(),
        appid_32_u.to_string(),
        appid_64_u.to_string()
    ];

    if let Some(url) = grid_url {
        for id in &ids {
            let path = grid_path_base.join(format!("{}p.png", id));
            let _ = vdf_utils::download_artwork(&url, &path).await;
        }
    }
    if let Some(url) = wide_url {
        for id in &ids {
            let path = grid_path_base.join(format!("{}.png", id));
            let _ = vdf_utils::download_artwork(&url, &path).await;
        }
    }
    if let Some(url) = hero_url {
        for id in &ids {
            let path = grid_path_base.join(format!("{}_hero.png", id));
            let _ = vdf_utils::download_artwork(&url, &path).await;
        }
    }
    if let Some(url) = logo_url {
        for id in &ids {
            let path = grid_path_base.join(format!("{}_logo.png", id));
            let _ = vdf_utils::download_artwork(&url, &path).await;
        }
    }

    Ok(())
}

#[tauri::command]
async fn restart_steam() -> Result<(), String> {
    #[cfg(target_os = "linux")]
    {
        println!("Attempting to restart Steam on Linux...");
        // Try clean shutdown first
        let _ = std::process::Command::new("steam")
            .arg("-shutdown")
            .status();
        
        // Wait for it to exit (up to 5 seconds)
        let mut exited = false;
        for _ in 0..10 {
            tokio::time::sleep(std::time::Duration::from_millis(500)).await;
            let status = std::process::Command::new("pgrep")
                .arg("-x")
                .arg("steam")
                .status();
            
            if status.map(|s| !s.success()).unwrap_or(true) {
                exited = true;
                break;
            }
        }
        
        if !exited {
            println!("Steam didn't exit cleanly, forcing kill...");
            let _ = std::process::Command::new("pkill")
                .arg("-9")
                .arg("-x")
                .arg("steam")
                .status();
            tokio::time::sleep(std::time::Duration::from_millis(500)).await;
        }

        // Restart
        println!("Spawning new Steam process...");
        std::process::Command::new("steam")
            .spawn()
            .map_err(|e| format!("Failed to restart Steam: {}", e))?;
    }
    
    #[cfg(target_os = "windows")]
    {
        let _ = std::process::Command::new("taskkill")
            .args(&["/F", "/IM", "steam.exe"])
            .status();
            
        tokio::time::sleep(std::time::Duration::from_secs(1)).await;
        
        std::process::Command::new("cmd")
            .args(&["/C", "start", "steam://open/main"])
            .spawn()
            .map_err(|e| format!("Failed to restart Steam: {}", e))?;
    }
    
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            greet, 
            get_game_metadata,
            search_sgdb_games,
            get_sgdb_artworks,
            add_game_to_steam,
            restart_steam
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
