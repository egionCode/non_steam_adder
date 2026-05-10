use pelite::FileMap;
use pelite::pe64::{Pe as Pe64, PeFile as PeFile64};
use pelite::pe32::{Pe as Pe32, PeFile as PeFile32};

pub fn extract_product_name(path: &str) -> Option<String> {
    let map = FileMap::open(path).ok()?;
    
    if let Ok(pe) = PeFile64::from_bytes(&map) {
        if let Ok(resources) = pe.resources() {
            if let Ok(version_info) = resources.version_info() {
                if let Some(lang) = version_info.translation().first() {
                    if let Some(name) = version_info.value(*lang, "ProductName") {
                        return Some(name);
                    }
                    if let Some(name) = version_info.value(*lang, "FileDescription") {
                        return Some(name);
                    }
                }
            }
        }
    }
    
    if let Ok(pe) = PeFile32::from_bytes(&map) {
        if let Ok(resources) = pe.resources() {
            if let Ok(version_info) = resources.version_info() {
                if let Some(lang) = version_info.translation().first() {
                    if let Some(name) = version_info.value(*lang, "ProductName") {
                        return Some(name);
                    }
                    if let Some(name) = version_info.value(*lang, "FileDescription") {
                        return Some(name);
                    }
                }
            }
        }
    }

    None
}
