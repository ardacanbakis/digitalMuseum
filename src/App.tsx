import { Canvas } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { Scene } from "./scene/Scene";
import { closeInspect } from "./scene/artworks/interaction";
import { setLockElement } from "./scene/player/usePointerLock";
import { EYE_HEIGHT } from "./scene/player/collision";
import { DebugPage } from "./ui/DebugPage";
import { Hud } from "./ui/Hud";
import { AdminPanel } from "./ui/AdminPanel";
import { FramePanel } from "./ui/FramePanel";
import { InfoPanel } from "./ui/InfoPanel";
import { MapOverlay } from "./ui/MapOverlay";
import { SearchOverlay } from "./ui/SearchOverlay";
import { TourOverlay } from "./ui/TourOverlay";
import { TouchControls } from "./ui/TouchControls";

const params = new URLSearchParams(window.location.search);
const isDebug = params.has("debug");
const showStats = params.has("stats"); // FPS/ms meter hidden unless ?stats

export default function App() {
  if (isDebug) return <DebugPage />;
  return (
    <div className="app">
      <Canvas
        camera={{ fov: 70, near: 0.1, far: 100, position: [0, EYE_HEIGHT, 2.5] }}
        onCreated={({ gl }) => setLockElement(gl.domElement)}
        onPointerMissed={() => closeInspect()}
      >
        <Scene />
        {showStats && <Stats />}
      </Canvas>
      <div className="overlay">
        <Hud />
        <TouchControls />
        <InfoPanel />
        <FramePanel />
        <MapOverlay />
        <SearchOverlay />
        <TourOverlay />
        <AdminPanel />
      </div>
    </div>
  );
}
