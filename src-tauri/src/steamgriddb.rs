use serde::{Deserialize, Serialize};
use reqwest::header::{HeaderMap, HeaderValue, AUTHORIZATION};

const API_BASE: &str = "https://www.steamgriddb.com/api/v2";

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SGDBGame {
    pub id: u32,
    pub name: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SGDBArtwork {
    pub id: u32,
    pub url: String,
    pub thumb: String,
    #[serde(default)]
    pub width: u32,
    #[serde(default)]
    pub height: u32,
    #[serde(rename = "type", default)]
    pub art_type: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct SGDBResponse<T> {
    success: bool,
    data: T,
    errors: Option<Vec<String>>,
}

fn get_headers(api_key: &str) -> Result<HeaderMap, String> {
    let mut headers = HeaderMap::new();
    let auth_value = format!("Bearer {}", api_key);
    headers.insert(AUTHORIZATION, HeaderValue::from_str(&auth_value).map_err(|e: reqwest::header::InvalidHeaderValue| e.to_string())?);
    Ok(headers)
}

pub async fn search_game(api_key: &str, query: &str) -> Result<Vec<SGDBGame>, String> {
    let client = reqwest::Client::new();
    let url = format!("{}/search/autocomplete/{}", API_BASE, urlencoding::encode(query));
    
    let response = client.get(url)
        .headers(get_headers(api_key)?)
        .send()
        .await
        .map_err(|e: reqwest::Error| e.to_string())?;
        
    let res: SGDBResponse<Vec<SGDBGame>> = response.json().await.map_err(|e: reqwest::Error| e.to_string())?;
    
    if res.success {
        Ok(res.data)
    } else {
        Err(res.errors.unwrap_or_default().join(", "))
    }
}

pub async fn get_artworks(
    api_key: &str,
    game_id: u32,
    art_type: &str,
    dimensions: Option<&str>,
    types: Option<&str>,
    styles: Option<&str>,
    mimes: Option<&str>,
    nsfw: Option<bool>,
    humor: Option<bool>,
    epilepsy: Option<bool>,
    page: Option<u32>,
    languages: Option<&str>,
    sort: Option<&str>,
) -> Result<Vec<SGDBArtwork>, String> {
    let client = reqwest::Client::new();
    let mut url = format!("{}/{}/game/{}", API_BASE, art_type, game_id);

    let mut query_params = Vec::new();
    if let Some(d) = dimensions {
        query_params.push(format!("dimensions={}", d));
    }
    if let Some(t) = types {
        query_params.push(format!("types={}", t));
    }
    if let Some(s) = styles {
        query_params.push(format!("styles={}", s));
    }
    if let Some(m) = mimes {
        query_params.push(format!("mimes={}", m));
    }
    if let Some(n) = nsfw {
        query_params.push(format!("nsfw={}", n));
    }
    if let Some(h) = humor {
        query_params.push(format!("humor={}", h));
    }
    if let Some(e) = epilepsy {
        query_params.push(format!("epilepsy={}", e));
    }
    if let Some(p) = page {
        query_params.push(format!("page={}", p));
    }
    if let Some(l) = languages {
        query_params.push(format!("languages={}", l));
    }
    if let Some(srt) = sort {
        query_params.push(format!("sort={}", srt));
    }

    if !query_params.is_empty() {
        url.push_str("?");
        url.push_str(&query_params.join("&"));
    }

    let response = client
        .get(&url)
        .headers(get_headers(api_key)?)
        .send()
        .await
        .map_err(|e: reqwest::Error| e.to_string())?;

    if response.status().is_success() {
        let body: SGDBResponse<Vec<SGDBArtwork>> = response.json().await.map_err(|e: reqwest::Error| e.to_string())?;
        if body.success {
            Ok(body.data)
        } else {
            Err(body.errors.unwrap_or_default().join(", "))
        }
    } else {
        Err(format!("SGDB API error: {}", response.status()))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_fetch_all_types() {
        let api_key = "f66d29915ba18e571f169e9dc6bd04c4";
        let game_id = 4265; // Witcher 3

        let types = ["grids", "heroes", "logos", "icons"];
        for t in types {
            let res = get_artworks(api_key, game_id, t, None, Some("static,animated"), None, None, Some(false), None, None, Some(1), None, Some("score")).await;
            assert!(res.is_ok(), "Failed to fetch {}: {:?}", t, res.err());
            let data = res.unwrap();
            assert!(!data.is_empty(), "Fetched 0 items for {}", t);
            println!("Fetched {} items for {}", data.len(), t);
        }
    }
}
