## Context

The application needs to bridge the gap between local executable files and the Steam client's proprietary configuration formats. It requires a cross-platform (initially Linux/Windows) desktop interface that can interact with the filesystem, make network requests, and modify Steam's internal data structures.

## Goals / Non-Goals

**Goals:**
- Provide a simple, Steam-themed UI for importing games.
- Automate the discovery of high-quality artwork via SteamGridDB.
- Safely modify `shortcuts.vdf` without corrupting existing entries.
- Manage local artwork storage in Steam's user directory.

**Non-Goals:**
- Adding games from other launchers (Epic, GOG) automatically (only manual file selection).
- Managing Steam account settings or cloud saves.
- Supporting multiple Steam accounts simultaneously (will use the current logged-in user).

## Decisions

### 1. Architecture: Tauri + SolidJS
- **Rationale**: Tauri provides a lightweight bridge to Rust for filesystem and VDF manipulation, while SolidJS offers high-performance UI rendering with a reactive model that fits well with the "instant transition" requirement.
- **Alternatives**: Electron (too heavy), Native Rust UI (e.g., Iced - less flexible for styling).

### 2. VDF Manipulation in Rust
- **Rationale**: Use the `keyvalues-parser` or similar Rust crate to handle VDF files. Rust's type safety is critical here to avoid corrupting the `shortcuts.vdf` file.
- **Alternatives**: Parsing VDF in JavaScript (riskier and requires more data passing between backend and frontend).

### 3. API Security
- **Rationale**: The SteamGridDB API key will be injected at build time using the `env!` macro in Rust. This prevents the key from being exposed in the frontend source code.
- **Alternatives**: Requiring users to provide their own API key (worse UX).

### 4. Artwork Persistence
- **Rationale**: Images will be downloaded to a temporary directory first, then moved to the Steam `grid` folder once the user confirms. This ensures atomic updates.

## Risks / Trade-offs

- **Steam Paths** [Risk] → Different installations of Steam use different paths. [Mitigation] Use standard path discovery (e.g., `~/.steam/steam/` on Linux, Registry on Windows).
- **VDF Corruption** [Risk] → Manual writing to `shortcuts.vdf` can break the library. [Mitigation] Create backups before each modification and use a battle-tested VDF library.
- **Network Latency** [Risk] → Fetching artwork might feel slow. [Mitigation] Use optimistic UI rendering and pre-fetch first results automatically.
