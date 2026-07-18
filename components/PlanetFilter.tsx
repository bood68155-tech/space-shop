"use client";

import { motion } from "framer-motion";

interface PlanetFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

const planetStyles: Record<string, { bg: string; ring: string; glow: string; emoji: string; color: string }> = {
  All: {
    bg: "bg-gradient-to-br from-indigo-500 to-purple-600",
    ring: "ring-indigo-400/50",
    glow: "shadow-indigo-500/40",
    emoji: "🌌",
    color: "#6366f1",
  },
  Sneakers: {
    bg: "bg-gradient-to-br from-orange-400 to-red-500",
    ring: "ring-orange-400/50",
    glow: "shadow-orange-500/40",
    emoji: "👟",
    color: "#f97316",
  },
  Classic: {
    bg: "bg-gradient-to-br from-blue-400 to-cyan-500",
    ring: "ring-blue-400/50",
    glow: "shadow-blue-500/40",
    emoji: "👞",
    color: "#3b82f6",
  },
  Boots: {
    bg: "bg-gradient-to-br from-amber-500 to-yellow-600",
    ring: "ring-amber-400/50",
    glow: "shadow-amber-500/40",
    emoji: "👢",
    color: "#f59e0b",
  },
};

const fallbackStyle = {
  bg: "bg-gradient-to-br from-gray-400 to-gray-600",
  ring: "ring-gray-400/50",
  glow: "shadow-gray-500/40",
  emoji: "🪐",
  color: "#9ca3af",
};

export default function PlanetFilter({ categories, selected, onSelect }: PlanetFilterProps) {
  return (
    <div className="glass-strong mx-auto flex w-fit flex-wrap items-center justify-center gap-8 rounded-full px-10 py-5">
      {categories.map((category) => {
        const style = planetStyles[category] || { ...fallbackStyle, emoji: "🪐", color: "#9ca3af" };
        const isActive = selected === category;

        return (
          <motion.button
            key={category}
            onClick={() => onSelect(category)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="group flex flex-col items-center gap-2"
          >
            <motion.div
              animate={isActive ? { scale: 1.15 } : { scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className={`planet-btn ${style.bg} ${isActive ? "planet-btn-active ring-2 " + style.ring : "planet-btn-inactive"}`}
              style={isActive ? {
                boxShadow: `0 0 24px ${style.color}66, 0 4px 16px rgba(0,0,0,0.3), inset 0 0 12px ${style.color}33`,
              } : {}}
            >
              <span className="text-2xl">{style.emoji}</span>
              {isActive && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="absolute -inset-1.5 rounded-full border border-white/20"
                  style={{
                    boxShadow: `0 0 16px ${style.color}33`,
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
