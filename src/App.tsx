import { createSignal, Show, onMount } from "solid-js";
import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { getCurrentWindow } from "@tauri-apps/api/window";
import "./App.css";
import TitleBar from "./components/TitleBar";
import ImportScreen from "./components/ImportScreen";
import ManagementScreen from "./components/ManagementScreen";

export interface SGDBGame {
  id: number;
  name: string;
}

export interface SGDBArtwork {
  id: number;
  url: string;
  thumb: string;
  width?: number;
  height?: number;
}

function App() {
  const [screen, setScreen] = createSignal("import");
  const [filePath, setFilePath] = createSignal("");
  const [gameTitle, setGameTitle] = createSignal("");
  const [sgdbId, setSgdbId] = createSignal<number | null>(null);
  const [isDragging, setIsDragging] = createSignal(false);

  onMount(() => {
    const unlisten = getCurrentWindow().onDragDropEvent((event) => {
      if (event.payload.type === 'enter' || event.payload.type === 'over') {
        setIsDragging(true);
      } else if (event.payload.type === 'drop') {
        setIsDragging(false);
        const paths = event.payload.paths;
        if (paths.length > 0 && screen() === "import") {
          handleFileSelection(paths[0]);
        }
      } else {
        setIsDragging(false);
      }
    });

    return () => {
      unlisten.then(f => f());
    };
  });

  const handleFileSelection = async (path: string) => {
    if (!path.toLowerCase().endsWith(".exe")) {
      alert("Please select a .exe file");
      return;
    }
    setIsDragging(false);
    try {
      const metadataName = await invoke<string | null>("get_game_metadata", { path });
      const title = metadataName || path.split(/[/\\]/).pop()?.replace(/\.exe$/i, "") || "Unknown Game";
      setGameTitle(title);
      setFilePath(path);
      setSgdbId(null); // Will be searched in ManagementScreen
      setScreen("management");
    } catch (e) {
      console.error(e);
      alert(`Error loading game: ${e}`);
    }
  };

  const selectFile = async () => {
    const selected = await open({
      multiple: false,
      filters: [{ name: "Executable", extensions: ["exe"] }],
    });
    if (selected && typeof selected === "string") {
      handleFileSelection(selected);
    }
  };

  return (
    <div class="flex-1 flex flex-col h-screen overflow-hidden bg-steam-bg-dark text-steam-text">
      {/* Resize Handles */}
      <div class="resize-handle top"></div>
      <div class="resize-handle bottom"></div>
      <div class="resize-handle left"></div>
      <div class="resize-handle right"></div>
      <div class="resize-handle top-left"></div>
      <div class="resize-handle top-right"></div>
      <div class="resize-handle bottom-left"></div>
      <div class="resize-handle bottom-right"></div>

      <TitleBar />
      
      <div class="flex-1 flex flex-col overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-steam-gray [&::-webkit-scrollbar-thumb]:rounded-full">
        <div class="p-[clamp(0.5rem,3vw,1.5rem)] flex flex-col items-center">
          <Show when={screen() === "import"}>
            <ImportScreen 
              onSelect={handleFileSelection} 
              selectFile={selectFile} 
              isDragging={isDragging()}
            />
          </Show>

          <Show when={screen() === "management"}>
            <ManagementScreen 
              gameTitle={gameTitle()} 
              filePath={filePath()} 
              sgdbId={sgdbId()}
              onBack={() => setScreen("import")} 
            />
          </Show>
        </div>
      </div>
    </div>
  );
}

export default App;
