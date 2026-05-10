use serde::{Deserialize, Serialize};
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};

const API_BASE: &str = "https://www.steamgriddb.com/api/v2";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SGDBGame {
    pub id: u32,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SGDBArtwork {
    pub id: u32,
    pub url: String,
    pub thumb: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct SGDBResponse<T> {
    success: bool,
    data: T,
}

fn get_headers(api_key: &str) -> Result<HeaderMap, String> {
    let mut headers = HeaderMap::new();
    let auth_value = format!("Bearer {}", api_key);
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&auth_value).map_err(|e| e.to_string())?);
    Ok(headers)
}

pub async fn search_game(api_key: &str, query: &str) -> Result<Vec<SGDBGame>, String> {
    let client = reqwest::Client::new();
    let url = format!("{}/search/autocomplete/{}", API_BASE, urlencoding::encode(query));
    
    let response = client.get(url)
        .headers(get_headers(api_key)?)
        .send()
        .await
        .map_err(|e| e.to_string())?;
        
    let res: SGDBResponse<Vec<SGDBGame>> = response.json().await.map_err(|e| e.to_string())?;
    
    if res.success {
        Ok(res.data)
    } else {
        Err("API request failed".to_string())
    }
}

pub async fn get_artworks(api_key: &str, game_id: u32, art_type: &str) -> Result<Vec<SGDBArtwork>, String> {
    // art_type: grids, heroes, logos, icons
    let client = reqwest::Client::new();
    let url = format!("{}/{}/game/{}", API_BASE, art_type, game_id);
    
    let response = client.get(url)
        .headers(get_headers(api_key)?)
        .send()
        .await
        .map_err(|e| e.to_string())?;
        
    let res: SGDBResponse<Vec<SGDBArtwork>> = response.json().await.map_err(|e| e.to_string())?;
    
    if res.success {
        Ok(res.data)
    } else {
        Err("API request failed".to_string())
    }
}
