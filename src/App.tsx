import { Canvas } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { Scene } from "./scene/Scene";
import { setLockElement } from "./scene/player/usePointerLock";
import { EYE_HEIGHT } from "./scene/player/collision";
import { DebugPage } from "./ui/DebugPage";
import { Hud } from "./ui/Hud";
import { InfoPanel } from "./ui/InfoPanel";
import { TouchControls } from "./ui/TouchControls";

const isDebug = new URLSearchParams(window.location.search).has("debug");

export default function App() {
  if (isDebug) return <DebugPage />;
  return (
    <div className="app">
      <Canvas
        camera={{ fov: 70, near: 0.1, far: 100, position: [0, EYE_HEIGHT, 2.5] }}
        onCreated={({ gl }) => setLockElement(gl.domElement)}
      >
        <Scene />
        {import.meta.env.DEV && <Stats />}
      </Canvas>
      <div className="overlay">
        <Hud />
        <TouchControls />
        <InfoPanel />
      </div>
    </div>
  );
}
