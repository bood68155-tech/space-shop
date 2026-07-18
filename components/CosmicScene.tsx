"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { XR, createXRStore } from "@react-three/xr";
import { Float } from "@react-three/drei";
import CosmicStars from "./CosmicStars";
import Planet from "./Planet";
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
            <ambientLight intensity={0.2} />
            <pointLight position={[10, 10, 10]} intensity={1.5} color="#818cf8" />
            <pointLight position={[-10, -5, 5]} intensity={0.8} color="#a855f7" />
            <pointLight position={[0, 5, -10]} intensity={0.5} color="#ec4899" />
            <pointLight position={[5, -8, 3]} intensity={0.3} color="#6366f1" />

            <directionalLight position={[5, 5, 5]} intensity={0.6} color="#fde68a" />

            <CosmicStars count={1500} />

            <Float speed={1.5} rotationIntensity={0.3} floatIntensity={0.5}>
              <Planet />
            </Float>

            <Saturn />

            <fog attach="fog" args={["#0a0a1a", 30, 80]} />
          </Suspense>
        </XR>
      </Canvas>
    </div>
  );
}
