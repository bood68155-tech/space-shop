"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import CosmicStars from "./CosmicStars";

export default function CosmicScene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 60 }}
        gl={{ alpha: true, antialias: true, powerPreference: "high-performance" }}
        style={{ background: "transparent" }}
        dpr={[1, 1.5]}
      >
        <Suspense fallback={null}>
          <CosmicStars count={1200} />
          <fog attach="fog" args={["#0a0a1a", 4, 12]} />
        </Suspense>
      </Canvas>
    </div>
  );
}
