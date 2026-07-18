"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { motion } from "framer-motion";
import HologramIcon from "./HologramIcon";
import { GlowProvider } from "./AtmosphericGlow";

interface PlanetFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

type ShoeType = "sneakers" | "classic" | "boots";

const categoryConfig: Record<string, { glow: string; color: string; type?: ShoeType; emoji?: string }> = {
  All: {
    glow: "shadow-indigo-500/40",
    color: "#6366f1",
    emoji: "🌌",
  },
  Sneakers: {
    glow: "shadow-orange-500/40",
    color: "#00ff88",
    type: "sneakers",
  },
  Classic: {
    glow: "shadow-blue-500/40",
    color: "#00ffcc",
    type: "classic",
  },
  Boots: {
    glow: "shadow-amber-500/40",
    color: "#ffaa00",
    type: "boots",
  },
};

const fallbackConfig = {
  glow: "shadow-gray-500/40",
  color: "#9ca3af",
  emoji: "🪐",
};

export default function PlanetFilter({ categories, selected, onSelect }: PlanetFilterProps) {
  return (
    <div className="glass-strong relative z-20 mx-auto flex w-fit flex-wrap items-center justify-center gap-14 rounded-full px-14 py-8">
      {categories.map((category) => {
        const config = categoryConfig[category] || fallbackConfig;
        const isActive = selected === category;
        const is3D = !!config.type;

        return (
          <motion.button
            key={category}
            onClick={() => onSelect(category)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="group flex flex-col items-center gap-3 px-3 py-2"
          >
            <motion.div
              animate={isActive ? { scale: 1.15 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`relative overflow-visible rounded-full ${
                isActive ? "ring-2 ring-white/30" : ""
              }`}
              style={{
                width: is3D ? 100 : 64,
                height: is3D ? 100 : 64,
                boxShadow: isActive
                  ? `0 0 28px ${config.color}55, 0 4px 16px rgba(0,0,0,0.3)`
                  : "0 4px 16px rgba(0,0,0,0.3)",
                background: is3D
                  ? "radial-gradient(circle, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.9) 100%)"
                  : undefined,
              }}
            >
              {is3D ? (
                <Canvas
                  camera={{ position: [0, 0.2, 2.8], fov: 35 }}
                  gl={{ alpha: true, antialias: true }}
                  style={{ background: "transparent" }}
                >
                  <ambientLight intensity={0.2} />
                  <Suspense fallback={null}>
                    <GlowProvider>
                      <HologramIcon type={config.type!} scale={0.58} />
                    </GlowProvider>
                  </Suspense>
                </Canvas>
              ) : (
                <div
                  className={`flex h-full w-full items-center justify-center ${
                    category === "All"
                      ? "bg-gradient-to-br from-indigo-500 to-purple-600"
                      : "bg-gradient-to-br from-gray-400 to-gray-600"
                  }`}
                >
                  <span className="text-2xl">{config.emoji}</span>
                </div>
              )}

              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -inset-1.5 rounded-full border border-white/20"
                  style={{
                    boxShadow: `0 0 16px ${config.color}33`,
                  }}
                />
              )}
            </motion.div>

            <span
              className={`text-xs font-medium transition-colors ${
                isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"
              }`}
            >
              {category}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
