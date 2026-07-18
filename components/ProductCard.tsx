"use client";

import { motion } from "framer-motion";
import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
  index?: number;
}

export default function ProductCard({ name, price, image_url, category, index = 0 }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 40, filter: "blur(10px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.25, 0.4, 0.25, 1],
      }}
      whileHover={{ y: -6, scale: 1.02 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-colors duration-300 hover:border-space-accent/40 hover:bg-white/10"
      style={{
        boxShadow: hovered
          ? "0 20px 60px rgba(99, 102, 241, 0.15), 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255,255,255,0.08)"
          : "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255,255,255,0.05)",
      }}
    >
      {hovered && (
        <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{
            background: "radial-gradient(circle at 50% 0%, rgba(99,102,241,0.08) 0%, transparent 60%)",
          }}
        />
      )}

      <div className="relative mb-4 flex h-48 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-space-nebula to-space-deep">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <span className="text-6xl transition-transform duration-500 group-hover:scale-110">📦</span>
        )}
        <div className="absolute right-2 top-2 rounded-full bg-black/40 px-3 py-1 text-xs font-medium backdrop-blur-md border border-white/10">
          {category}
        </div>
      </div>

      <h3 className="mb-1 text-lg font-semibold">{name}</h3>

      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-space-glow text-glow">${price}</span>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="glass-btn px-4 py-2 text-sm"
        >
          Add to Cart
        </motion.button>
      </div>
    </motion.div>
  );
}
