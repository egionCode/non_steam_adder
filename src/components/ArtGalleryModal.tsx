import { Component, createSignal, createEffect, For, Show, onMount, onCleanup } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { SGDBArtwork } from "../App";

interface ArtGalleryModalProps {
  sgdbId: number;
  artType: string;
  orientation?: 'portrait' | 'landscape' | 'square' | 'any';
  onSelect: (art: SGDBArtwork) => void;
  onClose: () => void;
}

const ArtGalleryModal: Component<ArtGalleryModalProps> = (props) => {
  const [artworks, setArtworks] = createSignal<SGDBArtwork[]>([]);
  const [loading, setLoading] = createSignal(true);
  const [selectedIndex, setSelectedIndex] = createSignal(0);

  createEffect(async () => {
    setLoading(true);
    try {
      const results = await invoke<SGDBArtwork[]>("get_sgdb_artworks", {
        gameId: props.sgdbId,
        artType: props.artType
      });
      
      let filtered = results || [];
      
      if (props.orientation === 'landscape') {
        filtered = filtered.filter(g => 
          g.url.includes("460x215") || 
          g.url.includes("920x430") || 
          g.url.includes("horizontal") ||
          g.url.includes("landscape")
        );
      } else if (props.orientation === 'portrait') {
        filtered = filtered.filter(g => 
          g.url.includes("600x900") || 
          g.url.includes("342x482") ||
          (!g.url.includes("460x215") && !g.url.includes("920x430") && !g.url.includes("horizontal"))
        );
      }
      
      setArtworks(filtered);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  });

  const handleKeyDown = (e: KeyboardEvent) => {
    const items = artworks();
    if (items.length === 0) return;

    if (e.key === "ArrowRight") {
      setSelectedIndex((prev) => (prev + 1) % items.length);
    } else if (e.key === "ArrowLeft") {
      setSelectedIndex((prev) => (prev - 1 + items.length) % items.length);
    } else if (e.key === "ArrowDown") {
      setSelectedIndex((prev) => (prev + 4 < items.length ? prev + 4 : prev));
    } else if (e.key === "ArrowUp") {
      setSelectedIndex((prev) => (prev - 4 >= 0 ? prev - 4 : prev));
    } else if (e.key === "Enter") {
      props.onSelect(items[selectedIndex()]);
    } else if (e.key === "Escape") {
      props.onClose();
    }
  };

  onMount(() => {
    window.addEventListener("keydown", handleKeyDown);
  });

  onCleanup(() => {
    window.removeEventListener("keydown", handleKeyDown);
  });

  const getAspectRatio = () => {
    if (props.orientation === 'landscape') return "aspect-[16/9]";
    if (props.orientation === 'portrait') return "aspect-[2/3]";
    if (props.orientation === 'square' || props.artType === "logos" || props.artType === "icons") return "aspect-square";
    
    if (props.artType === "grids") return "aspect-[2/3]";
    if (props.artType === "heroes") return "aspect-[32/9]";
    return "aspect-[16/9]"; 
  };

  const getGridCols = () => {
    if (props.orientation === 'landscape' || props.artType === "heroes") return "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
    if (props.orientation === 'portrait' || props.artType === "grids") return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5";
    return "grid-cols-2 sm:grid-cols-3 md:grid-cols-4";
  };

  return (
    <div 
      class="fixed inset-0 bg-steam-bg-dark/95 flex items-center justify-center z-[1000] backdrop-blur-md p-4 animate-in fade-in duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]" 
      onClick={props.onClose}
    >
      <div 
        class="bg-steam-panel-light/95 w-full max-w-6xl max-h-[90vh] rounded-2xl flex flex-col border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] overflow-hidden animate-in fade-in zoom-in-95 duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)]" 
        onClick={(e) => e.stopPropagation()}
      >
        <div class="p-8 border-b border-white/5 flex justify-between items-center bg-white/5">
          <div>
            <h2 class="text-3xl font-black capitalize tracking-tight text-white mb-1">Select {props.artType}</h2>
            <p class="text-steam-text-muted text-sm uppercase tracking-widest font-bold opacity-40">Masterpiece Selection</p>
          </div>
          <button 
            class="w-12 h-12 flex items-center justify-center rounded-full hover:bg-white/10 text-steam-text-muted hover:text-white transition-all duration-300 active:scale-90" 
            onClick={props.onClose}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        
        <div class="p-8 overflow-y-auto flex-1 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:bg-steam-gray [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-track]:bg-transparent">
          <Show when={!loading()} fallback={
            <div class="flex flex-col items-center justify-center py-32 gap-6">
              <div class="w-12 h-12 border-4 border-steam-blue/10 border-t-steam-blue rounded-full animate-spin shadow-[0_0_20px_rgba(102,192,244,0.2)]"></div>
              <p class="text-steam-text-muted animate-pulse font-black uppercase tracking-widest text-sm text-center">Curating Masterpieces...</p>
            </div>
          }>
            <Show when={artworks().length > 0} fallback={
              <div class="flex flex-col items-center justify-center py-32 text-center">
                <div class="text-steam-gray mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
                </div>
                <p class="text-white font-black text-xl mb-2">No masterpieces found.</p>
                <p class="text-steam-text-muted">Try a different search term in the management screen.</p>
              </div>
            }>
              <div class={`grid gap-6 ${getGridCols()}`}>
                <For each={artworks()}>
                  {(art, index) => (
                    <div 
                      class={`
                        group relative bg-steam-bg-dark rounded-xl overflow-hidden cursor-pointer border-2 transition-all duration-300 hover:scale-[1.02] shadow-2xl ${getAspectRatio()} animate-steam-slide-up fill-mode-backwards
                        ${selectedIndex() === index() ? 'border-steam-blue scale-[1.02] ring-4 ring-steam-blue/10' : 'border-transparent hover:border-steam-blue/40'}
                      `} 
                      style={{ "animation-delay": `${(index() % 10) * 50}ms` }}
                      onClick={() => props.onSelect(art)}
                    >
                      <img 
                        src={art.thumb} 
                        alt="Artwork" 
                        class={`w-full h-full group-hover:scale-110 transition-transform duration-500 ${props.artType === 'logos' || props.artType === 'icons' ? 'object-contain p-4' : 'object-cover'}`} 
                      />
                      <div class={`absolute inset-0 bg-gradient-to-t from-steam-blue/20 to-transparent transition-opacity duration-300 pointer-events-none ${selectedIndex() === index() ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}></div>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </Show>
        </div>

        <div class="p-4 border-t border-white/5 bg-steam-bg-dark/40 text-[10px] text-steam-text-muted flex justify-center gap-8 uppercase font-black tracking-[0.2em]">
          <div class="flex items-center gap-2"><span class="bg-white/10 px-1.5 py-0.5 rounded text-white">&larr;&rarr;&uarr;&darr;</span> Navigate</div>
          <div class="flex items-center gap-2"><span class="bg-white/10 px-1.5 py-0.5 rounded text-white">Enter</span> Select</div>
          <div class="flex items-center gap-2"><span class="bg-white/10 px-1.5 py-0.5 rounded text-white">Esc</span> Close</div>
        </div>
      </div>
    </div>
  );
};

export default ArtGalleryModal;
