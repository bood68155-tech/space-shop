"use client";

import { useState } from "react";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
}

export default function ProductCard({ name, price, image_url, category }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 ${
        hovered ? "scale-105 border-space-accent/50 shadow-lg shadow-space-accent/20" : ""
      }`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative mb-4 flex h-48 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-space-nebula to-space-deep">
        {image_url ? (
          <img
            src={image_url}
            alt={name}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <span className="text-6xl transition-transform duration-300 group-hover:scale-110">📦</span>
        )}
        <div className="absolute right-2 top-2 rounded-full bg-space-accent/80 px-3 py-1 text-xs font-medium backdrop-blur-sm">
          {category}
        </div>
      </div>
      <h3 className="mb-1 text-lg font-semibold">{name}</h3>
      <div className="flex items-center justify-between">
        <span className="text-xl font-bold text-space-glow">${price}</span>
        <button className="rounded-lg bg-space-accent/20 px-4 py-2 text-sm font-medium text-space-glow transition-colors hover:bg-space-accent hover:text-white">
          Add to Cart
        </button>
      </div>
    </div>
  );
}
