"use client";

interface PlanetFilterProps {
  categories: string[];
  selected: string;
  onSelect: (category: string) => void;
}

const planetStyles: Record<string, { bg: string; ring: string; glow: string; emoji: string }> = {
  All: {
    bg: "bg-gradient-to-br from-indigo-500 to-purple-600",
    ring: "ring-indigo-400/50",
    glow: "shadow-indigo-500/40",
    emoji: "🌌",
  },
  Sneakers: {
    bg: "bg-gradient-to-br from-orange-400 to-red-500",
    ring: "ring-orange-400/50",
    glow: "shadow-orange-500/40",
    emoji: "👟",
  },
  Classic: {
    bg: "bg-gradient-to-br from-blue-400 to-cyan-500",
    ring: "ring-blue-400/50",
    glow: "shadow-blue-500/40",
    emoji: "👞",
  },
  Boots: {
    bg: "bg-gradient-to-br from-amber-500 to-yellow-600",
    ring: "ring-amber-400/50",
    glow: "shadow-amber-500/40",
    emoji: "👢",
  },
};

const fallbackStyle = {
  bg: "bg-gradient-to-br from-gray-400 to-gray-600",
  ring: "ring-gray-400/50",
  glow: "shadow-gray-500/40",
  emoji: "🪐",
};

export default function PlanetFilter({ categories, selected, onSelect }: PlanetFilterProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 py-6">
      {categories.map((category) => {
        const style = planetStyles[category] || { ...fallbackStyle, emoji: "🪐" };
        const isActive = selected === category;

        return (
          <button
            key={category}
            onClick={() => onSelect(category)}
            className="group flex flex-col items-center gap-2"
          >
            <div
              className={`planet-btn ${style.bg} ${isActive ? "planet-btn-active ring-2 " + style.ring + " shadow-xl " + style.glow : "planet-btn-inactive"}`}
              style={isActive ? { transform: "scale(1.1)" } : {}}
            >
              <span className="text-2xl">{style.emoji}</span>
              {isActive && (
                <div className="absolute -inset-1 animate-pulse-slow rounded-full border border-white/20" />
              )}
            </div>
            <span
              className={`text-xs font-medium transition-colors ${
                isActive ? "text-white" : "text-gray-500 group-hover:text-gray-300"
              }`}
            >
              {category}
            </span>
          </button>
        );
      })}
    </div>
  );
}
