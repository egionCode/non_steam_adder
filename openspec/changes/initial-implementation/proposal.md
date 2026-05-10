## Why

Adding non-Steam games to the Steam library manually is a tedious process, especially when it comes to finding and applying the correct artwork (Cover, Background, Logo). This project aims to automate this workflow, providing a seamless experience for users to manage their DRM-free games within Steam with official-looking assets.

## What Changes

- **Project Initialization**: Setup of the Tauri (Rust) + SolidJS (TypeScript) foundation.
- **Game Import System**: Drag-and-drop or file selector to import executable files.
- **Metadata Extraction**: Backend logic to extract game titles from binary metadata.
- **SteamGridDB Integration**: Service to fetch high-quality game artwork via API.
- **Artwork Gallery**: UI for selecting specific images for Cover, Wide Cover, Background, and Logo.
- **VDF Injection**: Logic to read and update Steam's `shortcuts.vdf` file.
- **Asset Management**: Automatic download and naming of artwork in Steam's grid folder.

## Capabilities

### New Capabilities
- `game-import`: Handles executable selection and automatic metadata extraction.
- `artwork-management`: Integration with SteamGridDB API and gallery selection UI.
- `steam-library-integration`: Backend logic for modifying VDF files and managing local asset storage.

### Modified Capabilities
<!-- No existing capabilities to modify -->

## Impact

- **New Application**: A standalone desktop tool using Tauri.
- **Steam Filesystem**: Direct modification of `shortcuts.vdf` and the `grid` directory in `userdata`.
- **External Dependencies**: Integration with SteamGridDB API.
