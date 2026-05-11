import { Component, createSignal, createEffect, Show } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { SGDBArtwork } from "../App";
import ArtGalleryModal from "./ArtGalleryModal";

interface ManagementScreenProps {
  gameTitle: string;
  filePath: string;
  sgdbId: number | null;
  onBack: () => void;
}

const ManagementScreen: Component<ManagementScreenProps> = (props) => {
  const [searchTitle, setSearchTitle] = createSignal(props.gameTitle);
  const [currentSgdbId, setCurrentSgdbId] = createSignal<number | null>(props.sgdbId);
  
  const [grid, setGrid] = createSignal<SGDBArtwork | null>(null);
  const [wide, setWide] = createSignal<SGDBArtwork | null>(null);
  const [hero, setHero] = createSignal<SGDBArtwork | null>(null);
  const [logo, setLogo] = createSignal<SGDBArtwork | null>(null);
  const [icon, setIcon] = createSignal<SGDBArtwork | null>(null);
  
  const [loading, setLoading] = createSignal({
    search: false,
    grid: false,
    wide: false,
    hero: false,
    logo: false,
    icon: false
  });

  const [isSyncing, setIsSyncing] = createSignal(false);
  const [showSuccess, setShowSuccess] = createSignal(false);
  const [isRestarting, setIsRestarting] = createSignal(false);
  
  const [galleryOpen, setGalleryOpen] = createSignal(false);
  const [activeArtType, setActiveArtType] = createSignal<string>("");

  // Step 1: Search for Game ID when title changes
  createEffect(async () => {
    const title = searchTitle();
    if (title) {
      setLoading(prev => ({ ...prev, search: true }));
      try {
        const games = await invoke<any[]>("search_sgdb_games", { query: title });
        if (games && games.length > 0) {
          setCurrentSgdbId(games[0].id);
        } else {
          setCurrentSgdbId(null);
        }
      } catch (e) {
        console.error("Search failed:", e);
      } finally {
        setLoading(prev => ({ ...prev, search: false }));
      }
    }
  });

  // Step 2: Fetch artworks progressively when ID is available
  createEffect(() => {
    const id = currentSgdbId();
    if (id) {
      // Fetch Grids (Covers and Capsules)
      setLoading(prev => ({ ...prev, grid: true, wide: true }));
      invoke<SGDBArtwork[]>("get_sgdb_artworks", { gameId: id, artType: "grids" })
        .then(grids => {
          // Filter for Vertical (Portrait) - standard is 600x900 or 342x482
          const portraitArt = grids.filter(g => 
            (g.width && g.height && g.width < g.height) ||
            g.url.includes("600x900") || 
            g.url.includes("342x482")
          );
          setGrid(portraitArt[0] || grids[0] || null);

          // Filter for Wide (Landscape) - standard is 460x215 or 920x430
          const wideArt = grids.filter(g => 
            (g.width && g.height && g.width > g.height) ||
            g.url.includes("460x215") || 
            g.url.includes("920x430") || 
            g.url.includes("horizontal")
          );
          setWide(wideArt[0] || grids[0] || null);
        })
        .finally(() => setLoading(prev => ({ ...prev, grid: false, wide: false })));

      // Fetch Heroes
      setLoading(prev => ({ ...prev, hero: true }));
      invoke<SGDBArtwork[]>("get_sgdb_artworks", { gameId: id, artType: "heroes" })
        .then(heroes => setHero(heroes[0] || null))
        .finally(() => setLoading(prev => ({ ...prev, hero: false })));

      // Fetch Logos
      setLoading(prev => ({ ...prev, logo: true }));
      invoke<SGDBArtwork[]>("get_sgdb_artworks", { gameId: id, artType: "logos" })
        .then(logos => setLogo(logos[0] || null))
        .finally(() => setLoading(prev => ({ ...prev, logo: false })));

      // Fetch Icons
      setLoading(prev => ({ ...prev, icon: true }));
      invoke<SGDBArtwork[]>("get_sgdb_artworks", { gameId: id, artType: "icons" })
        .then(icons => setIcon(icons[0] || null))
        .finally(() => setLoading(prev => ({ ...prev, icon: false })));
    } else {
      // Clear artworks if no game found
      setGrid(null);
      setWide(null);
      setHero(null);
      setLogo(null);
      setIcon(null);
    }
  });

  const openGallery = (type: string) => {
    setActiveArtType(type);
    setGalleryOpen(true);
  };

  const handleSelectArt = (art: SGDBArtwork) => {
    if (activeArtType() === "grids") setGrid(art);
    if (activeArtType() === "wide") setWide(art);
    if (activeArtType() === "heroes") setHero(art);
    if (activeArtType() === "logos") setLogo(art);
    if (activeArtType() === "icons") setIcon(art);
    setGalleryOpen(false);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await invoke("add_game_to_steam", {
        gameTitle: searchTitle(),
        exePath: props.filePath,
        gridUrl: grid()?.url,
        wideUrl: wide()?.url,
        heroUrl: hero()?.url,
        logoUrl: logo()?.url,
        iconUrl: icon()?.url,
      });
      setShowSuccess(true);
    } catch (e) {
      console.error(e);
      alert(`Error syncing to Steam: ${e}`);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleRestartSteam = async () => {
    setIsRestarting(true);
    try {
      await invoke("restart_steam");
      props.onBack();
    } catch (e) {
      alert(`Failed to restart Steam: ${e}`);
    } finally {
      setIsRestarting(false);
    }
  };

  const isAnythingLoading = () => Object.values(loading()).some(v => v);

  return (
    <div class="flex-1 flex flex-col items-center w-full max-w-6xl mx-auto px-6 py-8 min-h-[720px] animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
      <Show when={!showSuccess()} fallback={
        <div class="flex flex-col items-center justify-center text-center py-20 flex-1 animate-in zoom-in slide-in-from-bottom-12 duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]">
          <div class="relative mb-12 group">
            <div class="absolute inset-0 bg-green-500/20 blur-[60px] rounded-full animate-steam-pulse"></div>
            <div class="w-32 h-32 rounded-3xl bg-gradient-to-br from-green-400/20 to-green-600/20 flex items-center justify-center relative z-10 border border-green-400/30 shadow-[0_0_50px_rgba(34,197,94,0.2)] transform rotate-12 group-hover:rotate-0 transition-transform duration-700">
              <div class="text-7xl text-green-400 drop-shadow-[0_0_20px_rgba(34,197,94,0.5)] animate-in zoom-in duration-500 delay-300 fill-mode-backwards">✓</div>
            </div>
            
            {/* Achievement Sparkles */}
            <div class="absolute -top-4 -right-4 w-6 h-6 bg-white/20 rounded-full blur-xl animate-ping"></div>
            <div class="absolute -bottom-2 -left-2 w-4 h-4 bg-green-400/20 rounded-full blur-lg animate-ping duration-1000"></div>
          </div>

          <div class="animate-steam-slide-up animate-stagger-1 fill-mode-backwards">
            <h2 class="text-4xl font-black mb-3 text-white uppercase tracking-tight">Game Added!</h2>
            <p class="text-steam-text-muted text-lg max-w-md mb-10 leading-relaxed">
              <strong class="text-white">{searchTitle()}</strong> is ready in your library.
              <span class="block mt-2 text-xs opacity-50 uppercase tracking-[0.2em] font-bold text-steam-blue animate-steam-pulse">Restart Steam to see changes</span>
            </p>
          </div>
          
          <div class="flex flex-col gap-3 w-full max-w-xs animate-steam-slide-up animate-stagger-2 fill-mode-backwards">
            <button 
              class="w-full bg-gradient-to-r from-steam-blue to-steam-accent hover:brightness-110 active:scale-[0.97] disabled:bg-steam-gray text-white font-black py-4 rounded uppercase tracking-wider text-sm shadow-[0_15px_40px_rgba(102,192,244,0.2)] transition-all duration-200"
              onClick={handleRestartSteam}
              disabled={isRestarting()}
            >
              {isRestarting() ? (
                <div class="flex items-center justify-center gap-2">
                  <div class="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                  <span>Restarting...</span>
                </div>
              ) : "Restart Steam Now"}
            </button>
            <button 
              class="w-full bg-white/5 border border-white/5 hover:bg-white/10 active:scale-[0.97] text-white font-bold py-3 rounded uppercase tracking-wider text-xs transition-all duration-200"
              onClick={props.onBack}
            >
              Add Another
            </button>
          </div>
        </div>
      }>
        <div class="relative w-full">
          <Show when={isSyncing()}>
            <div class="absolute inset-0 z-50 flex flex-col items-center justify-center bg-steam-bg-dark/60 backdrop-blur-xl rounded-2xl border border-steam-blue/30 animate-steam-fade-in overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]">
              <div class="relative w-72 h-1.5 bg-white/5 rounded-full overflow-hidden mb-6">
                <div class="absolute inset-0 bg-steam-blue animate-steam-shimmer shadow-[0_0_20px_rgba(102,192,244,0.5)]"></div>
              </div>
              <span class="text-steam-blue font-black uppercase tracking-[0.4em] text-xs animate-steam-pulse drop-shadow-[0_0_10px_rgba(102,192,244,0.5)]">Injecting Assets...</span>
              
              {/* Scanline effect during sync */}
              <div class="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-steam-blue/5 to-transparent h-20 w-full animate-[steam-scan_2s_infinite] opacity-30"></div>
            </div>
          </Show>

          <div class="management-grid w-full transition-all duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ 
              opacity: isSyncing() ? 0.2 : 1,
              transform: isSyncing() ? 'scale(0.96)' : 'scale(1)',
              filter: isSyncing() ? 'grayscale(0.8)' : 'none'
            }}
          >
          {/* Header Area */}
          <div 
            style={{ "grid-area": "header" }} 
            class="text-center mb-6 w-full flex flex-col items-center cursor-default"
          >
            <h1 class="text-3xl font-black mb-4 tracking-tighter text-white uppercase drop-shadow-xl bg-gradient-to-b from-white to-white/40 bg-clip-text text-transparent">
              Sync Artwork
            </h1>
            
            <div class="relative w-full max-w-lg mb-2 group">
              <input 
                type="text" 
                value={searchTitle()} 
                onInput={(e) => setSearchTitle(e.currentTarget.value)}
                placeholder="Game Title"
                class="w-full bg-steam-bg-dark/60 border border-white/5 focus:border-steam-blue focus:bg-steam-panel-light/20 text-white px-6 py-3 rounded-xl text-center font-black text-xl outline-none transition-all group-hover:border-white/10 shadow-xl tracking-tight"
              />
              <div class="absolute right-4 top-1/2 -translate-y-1/2">
                <Show when={loading().search}>
                  <div class="w-4 h-4 border-2 border-steam-blue/20 border-t-steam-blue rounded-full animate-spin" />
                </Show>
              </div>
            </div>
            
            <div class="inline-block px-3 py-1.5 rounded bg-black/30 border border-white/5 text-[9px] font-mono text-steam-blue/50 break-all max-w-lg mx-auto">
              <span class="text-white/10 mr-2 font-bold uppercase">EXE:</span>{props.filePath}
            </div>
          </div>

          {/* Hero Area - Wide Strip at Top */}
          <div style={{ "grid-area": "hero" }} class="animate-steam-slide-up animate-stagger-1 fill-mode-backwards">
            <ArtSlot 
              label="Hero Background" 
              art={hero()} 
              loading={loading().hero}
              class="h-full w-full shadow-2xl rounded-lg"
              placeholder="Background Hero"
              onClick={() => openGallery("heroes")}
            />
          </div>

          {/* Vertical Cover Area - Tall Left Side */}
          <div style={{ "grid-area": "vertical" }} class="animate-steam-slide-up animate-stagger-2 fill-mode-backwards h-full">
            <ArtSlot 
              label="Library Cover" 
              art={grid()} 
              loading={loading().grid}
              class="h-full w-full shadow-2xl rounded-lg"
              placeholder="Vertical Cover"
              onClick={() => openGallery("grids")}
            />
          </div>

          {/* Wide Capsule Area - Middle Right */}
          <div style={{ "grid-area": "wide" }} class="animate-steam-slide-up animate-stagger-3 fill-mode-backwards h-full">
            <ArtSlot 
              label="Wide Capsule" 
              art={wide()} 
              loading={loading().wide}
              class="h-full w-full shadow-2xl rounded-lg"
              placeholder="Wide Capsule"
              onClick={() => openGallery("wide")}
            />
          </div>

          {/* Logo Area - Bottom Middle */}
          <div style={{ "grid-area": "logo" }} class="animate-steam-slide-up animate-stagger-4 fill-mode-backwards h-full">
            <ArtSlot 
              label="Logo" 
              art={logo()} 
              loading={loading().logo}
              class="h-full w-full bg-gradient-to-tl from-white/5 to-transparent border border-white/5 shadow-xl rounded-lg"
              placeholder="Logo"
              isLogo
              onClick={() => openGallery("logos")}
            />
          </div>

          {/* Icon Area - Bottom Right */}
          <div style={{ "grid-area": "icon" }} class="animate-steam-slide-up animate-stagger-5 fill-mode-backwards h-full">
            <ArtSlot 
              label="Sidebar Icon" 
              art={icon()} 
              loading={loading().icon}
              class="h-full w-full bg-gradient-to-br from-white/5 to-transparent border border-white/5 shadow-xl rounded-lg"
              placeholder="Icon"
              isLogo
              onClick={() => openGallery("icons")}
            />
          </div>

          {/* Footer Area - Bottom Spanning */}
          <div style={{ "grid-area": "footer" }} class="flex gap-4 w-full mt-2 items-center justify-center">
            <button 
              class="w-full max-w-[160px] bg-white/5 border border-steam-border hover:bg-white/10 active:scale-[0.97] text-white font-bold py-2.5 rounded-lg uppercase tracking-wider text-[10px] transition-all duration-200"
              onClick={props.onBack} 
              disabled={isSyncing()}
            >
              Cancel
            </button>
            <button 
              class="w-full max-w-[320px] bg-gradient-to-r from-steam-blue to-steam-accent hover:brightness-110 active:scale-[0.97] disabled:grayscale disabled:opacity-20 text-white font-black py-2.5 rounded-lg uppercase tracking-[0.1em] text-[10px] shadow-[0_10px_25px_rgba(102,192,244,0.15)] transition-all duration-200"
              disabled={isAnythingLoading() || isSyncing() || !currentSgdbId()} 
              onClick={handleSync}
            >
              {isSyncing() ? "Syncing..." : isAnythingLoading() ? "Searching..." : "Add to Steam Library"}
            </button>
          </div>
        </div>
      </div>
      </Show>

      <Show when={galleryOpen() && currentSgdbId()}>
        <ArtGalleryModal 
          sgdbId={currentSgdbId()!} 
          artType={activeArtType() === "wide" ? "grids" : activeArtType()} 
          orientation={activeArtType() === "wide" ? "landscape" : activeArtType() === "grids" ? "portrait" : undefined}
          onSelect={handleSelectArt} 
          onClose={() => setGalleryOpen(false)} 
        />
      </Show>
    </div>
  );
};

interface ArtSlotProps {
  label: string;
  art: SGDBArtwork | null;
  loading: boolean;
  class: string;
  placeholder: string;
  isLogo?: boolean;
  onClick: () => void;
}

const ArtSlot: Component<ArtSlotProps> = (props) => {
  return (
    <div 
      class={`
        bg-steam-panel border border-steam-border rounded flex items-center justify-center cursor-pointer relative overflow-hidden shadow-2xl transition-all duration-300 hover:border-steam-blue hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(102,192,244,0.2)] group
        ${props.class}
      `}
      onClick={props.onClick}
    >
      <Show when={!props.loading} fallback={
        <div class="flex flex-col items-center gap-2 relative z-10">
          <div class="w-6 h-6 border-2 border-steam-blue border-t-transparent rounded-full animate-spin" />
          <span class="text-[10px] text-steam-text-muted uppercase font-bold animate-pulse">Scanning...</span>
        </div>
      }>
        <Show when={props.art} fallback={<div class="text-steam-text-muted text-xs text-center p-5 opacity-50 relative z-10">{props.placeholder}</div>}>
          <img 
            src={props.art?.thumb} 
            alt={props.label} 
            class={`w-full h-full max-h-full relative z-0 ${props.isLogo ? 'object-contain p-4' : 'object-cover animate-steam-fade-in'}`}
          />
        </Show>
      </Show>

      {/* Loading/Shimmer overlay */}
      <Show when={props.loading}>
        <div class="absolute inset-0 steam-shimmer pointer-events-none"></div>
      </Show>

      {/* Hover Highlight Overlay */}
      <div class="absolute inset-0 bg-gradient-to-tr from-steam-blue/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

      <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-steam-bg-dark/95 to-transparent pt-8 pb-1.5 px-2 text-center pointer-events-none z-10">
        <span class="text-[9px] font-black text-white uppercase tracking-wider">{props.label}</span>
      </div>
    </div>
  );
};

export default ManagementScreen;
