import { Component } from "solid-js";

interface ImportScreenProps {
  onSelect: (path: string) => void;
  selectFile: () => Promise<void>;
  isDragging: boolean;
}

const ImportScreen: Component<ImportScreenProps> = (props) => {
  return (
    <div class="flex-1 flex flex-col items-center justify-center p-10 animate-in fade-in slide-in-from-bottom-6 duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]">
      <div class="text-center mb-[clamp(2rem,10vh,4rem)]">
        <h1 class="text-6xl font-black mb-4 tracking-tighter text-white drop-shadow-2xl uppercase">
          Add Non-Steam Game
        </h1>
        <p class="text-steam-text-muted text-xl max-w-lg mx-auto leading-relaxed">
          Bring your collection together with official artwork and seamless
          integration.
        </p>
      </div>

      <div
        class={`
          w-full max-w-2xl h-[clamp(300px,50vh,400px)] border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-all duration-700 shadow-[0_30px_100px_rgba(0,0,0,0.5)] group relative overflow-hidden
          ${
            props.isDragging
              ? "border-steam-blue bg-steam-panel-light/40 scale-[1.03] shadow-[0_0_50px_rgba(102,192,244,0.2)]"
              : "border-steam-border bg-steam-panel/30 hover:border-steam-blue/60 hover:bg-steam-panel-light/20 hover:scale-[1.01]"
          }
        `}
        onClick={() => props.selectFile()}
      >
        <div
          class={`absolute inset-0 bg-radial-[circle_at_center,rgba(102,192,244,0.03)_0%,transparent_70%] transition-opacity duration-700 ${props.isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-100"}`}
        ></div>

        {/* Scanner Line Effect */}
        <Show when={props.isDragging}>
          <div class="absolute inset-x-0 h-0.5 bg-steam-blue/30 shadow-[0_0_15px_rgba(102,192,244,0.5)] animate-[steam-scan_2s_infinite_ease-in-out]"></div>
        </Show>

        <div class="mb-8 text-steam-blue transition-all duration-500 group-hover:-translate-y-2 group-hover:scale-110 drop-shadow-[0_0_20px_rgba(102,192,244,0.3)]">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
        </div>

        <div class="text-center relative z-10">
          <p class="text-white font-black text-2xl mb-2 tracking-tight uppercase">
            Import Game Executable
          </p>
          <p class="text-steam-text-muted font-medium">
            Click to browse or drop your{" "}
            <span class="text-steam-blue font-bold">.exe</span> here
          </p>
        </div>
      </div>
    </div>
  );
};

export default ImportScreen;
