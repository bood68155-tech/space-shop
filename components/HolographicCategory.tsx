"use client";

import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";
import { motion } from "framer-motion";
import FadeIn from "./FadeIn";
import HologramIcon from "./HologramIcon";
import { GlowProvider } from "./AtmosphericGlow";

interface HolographicCategoryProps {
  onSelect: (category: string) => void;
  selected: string;
}

export default function HolographicCategory({ onSelect, selected }: HolographicCategoryProps) {
  const isActive = selected === "Classic";

  return (
    <FadeIn delay={0.35} duration={0.8} y={20}>
      <div
        className={`glass-card mx-auto mb-12 flex max-w-3xl cursor-pointer items-center gap-10 p-0 transition-all duration-500 ${
          isActive
            ? "border-cyan-400/30 shadow-lg shadow-cyan-500/10"
            : "hover:border-white/20"
        }`}
        onClick={() => onSelect("Classic")}
      >
        <div className="relative h-60 w-60 flex-shrink-0">
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-blue-500/10" />
          <Canvas
            camera={{ position: [0, 0.3, 2.5], fov: 40 }}
            gl={{ alpha: true, antialias: true }}
            style={{ background: "transparent" }}
          >
            <Suspense fallback={null}>
              <ambientLight intensity={0.3} />
              <GlowProvider>
                <HologramIcon type="classic" scale={1.4} />
              </GlowProvider>
            </Suspense>
          </Canvas>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-space-deep/80 to-transparent" />
        </div>

        <div className="flex-1 py-4 pr-6">
          <div className="mb-1 flex items-center gap-2">
            <span className="text-xs font-medium uppercase tracking-widest text-cyan-400/80">
              Featured Collection
            </span>
          </div>
          <h2 className="mb-2 text-2xl font-bold">
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-cyan-300 bg-clip-text text-transparent">
              Classic Leather
            </span>
          </h2>
          <p className="mb-4 text-sm text-gray-400">
            Handcrafted premium leather shoes. Timeless elegance meets cosmic design.
            Each pair is forged in the heart of a dying star.
          </p>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="glass-btn px-5 py-2.5 text-sm"
          >
            Explore Collection
          </motion.button>
        </div>

        {isActive && (
          <motion.div
            layoutId="holo-active-ring"
            className="absolute inset-0 rounded-2xl border-2 border-cyan-400/20"
            style={{ boxShadow: "0 0 40px rgba(0, 255, 204, 0.08), inset 0 0 40px rgba(0, 255, 204, 0.03)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </div>
    </FadeIn>
  );
}
