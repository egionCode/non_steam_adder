use std::path::PathBuf;
use std::fs;

pub fn get_steam_path() -> Option<PathBuf> {
    #[cfg(target_os = "linux")]
    {
        let home = home::home_dir()?;
        let steam_path = home.join(".steam/steam");
        if steam_path.exists() {
            Some(steam_path)
        } else {
            // Alternative path for flatpak or other installs
            let flatpak_path = home.join(".var/app/com.valvesoftware.Steam/.steam/steam");
            if flatpak_path.exists() {
                Some(flatpak_path)
            } else {
                None
            }
        }
    }
    #[cfg(target_os = "windows")]
    {
        // Try to get from registry if possible, but for MVP check common locations
        let common_paths = [
            "C:\\Program Files (x86)\\Steam",
            "C:\\Program Files\\Steam",
        ];
        for path in common_paths {
            let p = PathBuf::from(path);
            if p.exists() {
                return Some(p);
            }
        }
        None
    }
    #[cfg(not(any(target_os = "linux", target_os = "windows")))]
    {
        None
    }
}

pub fn get_steam_user_ids() -> Vec<String> {
    let mut ids = Vec::new();
    if let Some(userdata_path) = get_steam_path().map(|p| p.join("userdata")) {
        if let Ok(entries) = fs::read_dir(userdata_path) {
            for entry in entries.flatten() {
                if entry.file_type().map(|t| t.is_dir()).unwrap_or(false) {
                    if let Some(name) = entry.file_name().to_str() {
                        // User IDs are numbers, skip "0" (anonymous) or others
                        if name.chars().all(|c| c.is_ascii_digit()) && name != "0" {
                            ids.push(name.to_string());
                        }
                    }
                }
            }
        }
    }
    ids
}

pub fn get_shortcuts_path(user_id: &str) -> Option<PathBuf> {
    get_steam_path()
        .map(|p| p.join("userdata").join(user_id).join("config/shortcuts.vdf"))
}

pub fn get_grid_path(user_id: &str) -> Option<PathBuf> {
    get_steam_path()
        .map(|p| p.join("userdata").join(user_id).join("config/grid"))
}
