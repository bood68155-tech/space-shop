"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { XR, createXRStore } from "@react-three/xr";
import CosmicStars from "./CosmicStars";
import Earth from "./Earth";
import Saturn from "./Saturn";

const store = createXRStore();

export default function CosmicScene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        dpr={[1, 2]}
      >
        <XR store={store}>
          <Suspense fallback={null}>
            <ambientLight intensity={0.15} />
            <directionalLight position={[8, 4, 6]} intensity={1.2} color="#fff5e0" />
            <pointLight position={[10, 10, 10]} intensity={0.8} color="#818cf8" />
            <pointLight position={[-10, -5, 5]} intensity={0.4} color="#a855f7" />

            <CosmicStars count={1500} />

            <Earth />

            <Saturn />

            <fog attach="fog" args={["#0a0a1a", 25, 70]} />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
