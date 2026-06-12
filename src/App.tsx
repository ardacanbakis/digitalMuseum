import { Canvas } from "@react-three/fiber";
import { Stats } from "@react-three/drei";
import { Scene } from "./scene/Scene";
import { setLockElement } from "./scene/player/usePointerLock";
import { EYE_HEIGHT } from "./scene/player/collision";
import { Hud } from "./ui/Hud";
import { TouchControls } from "./ui/TouchControls";

export default function App() {
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
      </div>
    </div>
  );
}
