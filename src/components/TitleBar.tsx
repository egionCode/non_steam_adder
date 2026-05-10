import { Component } from "solid-js";
import { getCurrentWindow } from "@tauri-apps/api/window";

const TitleBar: Component = () => {
  const appWindow = getCurrentWindow();

  return (
    <div 
      data-tauri-drag-region 
      class="h-8 bg-steam-bg-dark flex items-center justify-between select-none fixed top-0 left-0 right-0 z-[100] border-b border-white/5"
    >
      <div class="flex items-center px-3 gap-2 pointer-events-none">
        <div class="w-3.5 h-3.5 opacity-60">
           <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
             <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
           </svg>
        </div>
        <span class="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Non-Steam Adder</span>
      </div>

      <div class="flex h-full">
        <button 
          onClick={() => appWindow.minimize()}
          class="w-11 h-full flex items-center justify-center hover:bg-white/5 transition-colors group"
        >
          <svg width="10" height="1" viewBox="0 0 10 1" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-white/60 group-hover:stroke-white">
            <line y1="0.5" x2="10" y2="0.5" stroke-width="1"/>
          </svg>
        </button>
        
        <button 
          onClick={() => appWindow.toggleMaximize()}
          class="w-11 h-full flex items-center justify-center hover:bg-white/5 transition-colors group"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-white/60 group-hover:stroke-white">
            <rect x="0.5" y="0.5" width="9" height="9" stroke-width="1"/>
          </svg>
        </button>

        <button 
          onClick={() => appWindow.close()}
          class="w-11 h-full flex items-center justify-center hover:bg-red-500 transition-colors group"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" class="stroke-white/60 group-hover:stroke-white">
            <path d="M1 1L9 9M9 1L1 9" stroke-width="1"/>
          </svg>
        </button>
      </div>
    </div>
  );
};

export default TitleBar;
