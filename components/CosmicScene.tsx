"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import CosmicStars from "./CosmicStars";
import Planet from "./Planet";

export default function CosmicScene() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        gl={{ alpha: true, antialias: true }}
        style={{ background: "transparent" }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.3} />
          <pointLight position={[10, 10, 10]} intensity={1.5} color="#818cf8" />
          <pointLight position={[-10, -5, 5]} intensity={0.8} color="#a855f7" />
          <pointLight position={[0, 5, -10]} intensity={0.5} color="#ec4899" />
          <CosmicStars count={1500} />
          <Planet />
        </Suspense>
      </Canvas>
    </div>
  );
}
