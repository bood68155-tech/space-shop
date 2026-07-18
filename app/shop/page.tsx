"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import ProductCard from "@/components/ProductCard";
import PlanetFilter from "@/components/PlanetFilter";
import FadeIn from "@/components/FadeIn";

interface Product {
  id: string;
  name: string;
  price: number;
  image_url: string;
  category: string;
}

const categories = ["All", "Sneakers", "Classic", "Boots"];

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducts();

    const channel = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchProducts()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });

    setProducts(data || []);
    setLoading(false);
  }

  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-10 text-center">
        <FadeIn delay={0} duration={0.8} y={0} blur="12px">
          <h1 className="mb-3 text-6xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-space-glow via-purple-400 to-pink-400 bg-clip-text text-transparent text-glow-strong">
              Explore the Galaxy
            </span>
          </h1>
        </FadeIn>
        <FadeIn delay={0.2} duration={0.8} y={20} blur="8px">
          <p className="text-lg text-gray-400">Discover cosmic gear and interstellar treasures</p>
        </FadeIn>
      </div>

      <FadeIn delay={0.3} duration={0.7} y={20}>
        <div className="mb-6">
          <PlanetFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </div>
      </FadeIn>

      <FadeIn delay={0.45} duration={0.7} y={20}>
        <div className="mb-8 flex justify-center">
          <div className="relative w-full max-w-md">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search the cosmos..."
              className="glass-input w-full pl-12"
            />
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
          </div>
        </div>
      </FadeIn>

      {loading ? (
        <div className="py-20 text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
            className="mx-auto mb-4 h-12 w-12 rounded-full border-4 border-white/10 border-t-space-accent"
          />
          <p className="text-gray-400">Scanning the universe...</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredProducts.map((product, index) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image_url={product.image_url}
                category={product.category}
                index={index}
              />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <FadeIn delay={0} duration={0.5}>
              <div className="glass-card mx-auto mt-8 max-w-md text-center">
                <span className="mb-4 block text-5xl">🔭</span>
                <p className="text-xl text-gray-300">No products found in this quadrant</p>
                <p className="mt-2 text-sm text-gray-500">Try adjusting your search or filters</p>
              </div>
            </FadeIn>
          )}
        </>
      )}
    </div>
  );
}
