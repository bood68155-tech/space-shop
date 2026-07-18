"use client";

import { motion } from "framer-motion";
import FadeIn from "./FadeIn";

interface HolographicCategoryProps {
  onSelect: (category: string) => void;
  selected: string;
}

export default function HolographicCategory({ onSelect, selected }: HolographicCategoryProps) {
  const isActive = selected === "Classic";

  return (
    <FadeIn delay={0.35} duration={0.8} y={20}>
      <div
        className={`glass-card mx-auto mb-10 flex max-w-2xl cursor-pointer items-center gap-8 transition-all duration-500 ${
          isActive
            ? "border-blue-400/30 shadow-lg shadow-blue-500/10"
            : "hover:border-white/20"
        }`}
        onClick={() => onSelect("Classic")}
      >
        <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
          <span className="text-4xl">&#x1F45F;</span>
        </div>

        <div className="flex-1">
          <span className="mb-1 block text-xs font-medium uppercase tracking-widest text-blue-400/80">
            Featured Collection
          </span>
          <h2 className="mb-1 text-xl font-bold">
            <span className="bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text text-transparent">
              Classic Leather
            </span>
          </h2>
          <p className="text-sm text-gray-400">
            Handcrafted premium leather shoes. Timeless elegance meets cosmic design.
          </p>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="glass-btn mr-2 flex-shrink-0 px-4 py-2 text-sm"
        >
          Explore
        </motion.button>

        {isActive && (
          <motion.div
            layoutId="holo-active-ring"
            className="absolute inset-0 rounded-2xl border border-blue-400/15"
            style={{ boxShadow: "0 0 30px rgba(59, 130, 246, 0.06)" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
      </div>
    </FadeIn>
  );
}
