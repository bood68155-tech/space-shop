"use client";

import { motion } from "framer-motion";

interface PlanetFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

const categoryColors: Record<string, string> = {
  All: "#818cf8",
  Sneakers: "#f97316",
  Classic: "#3b82f6",
  Boots: "#f59e0b",
};

export default function PlanetFilter({ categories, selected, onSelect }: PlanetFilterProps) {
  return (
    <div className="mx-auto flex w-fit items-center gap-3">
      {categories.map((category) => {
        const isActive = selected === category;
        const color = categoryColors[category] || "#9ca3af";

        return (
          <motion.button
            key={category}
            onClick={() => onSelect(category)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="relative rounded-full border px-5 py-2 text-sm font-medium transition-all duration-300"
            style={{
              borderColor: isActive ? `${color}66` : "rgba(255,255,255,0.1)",
              background: isActive
                ? `linear-gradient(135deg, ${color}22, ${color}11)`
                : "rgba(255,255,255,0.04)",
              color: isActive ? "#fff" : "rgba(255,255,255,0.5)",
              boxShadow: isActive
                ? `0 0 20px ${color}22, inset 0 1px 0 rgba(255,255,255,0.06)`
                : "inset 0 1px 0 rgba(255,255,255,0.04)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
            }}
          >
            {category}
            {isActive && (
              <motion.div
                layoutId="category-indicator"
                className="absolute inset-0 rounded-full"
                style={{
                  border: `1px solid ${color}44`,
                  boxShadow: `0 0 12px ${color}18`,
                }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
