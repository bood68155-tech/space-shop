"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image_url: string;
  created_at: string;
}

export default function AdminDashboard() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    price: 0,
    category: "Sneakers",
    image_url: "",
  });

  useEffect(() => {
    fetchProducts();
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

  const stats = [
    { label: "Total Products", value: products.length, icon: "📦", color: "from-white/10 to-white/5" },
    { label: "Sneakers", value: products.filter((p) => p.category === "Sneakers").length, icon: "👟", color: "from-white/10 to-white/5" },
    { label: "Classic", value: products.filter((p) => p.category === "Classic").length, icon: "👞", color: "from-white/10 to-white/5" },
    { label: "Boots", value: products.filter((p) => p.category === "Boots").length, icon: "👢", color: "from-white/10 to-white/5" },
  ];

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({ name: "", price: 0, category: "Sneakers", image_url: "" });
    setShowModal(true);
  };

  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      price: product.price,
      category: product.category,
      image_url: product.image_url,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (editingProduct) {
      const { error } = await supabase
        .from("products")
        .update({ name: formData.name, price: formData.price, category: formData.category, image_url: formData.image_url })
        .eq("id", editingProduct.id);

      if (error) {
        alert("Error updating product: " + error.message);
        return;
      }
    } else {
      const { error } = await supabase.from("products").insert([
        {
          name: formData.name,
          price: formData.price,
          category: formData.category,
          image_url: formData.image_url,
        },
      ]);

      if (error) {
        alert("Error adding product: " + error.message);
        return;
      }
    }

    setShowModal(false);
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    const { error } = await supabase.from("products").delete().eq("id", id);

    if (error) {
      alert("Error deleting product: " + error.message);
      return;
    }

    fetchProducts();
  };

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="mt-1 text-gray-400">Manage your cosmic inventory</p>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className={`rounded-2xl border border-white/10 bg-gradient-to-br ${stat.color} p-6 backdrop-blur-sm`}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-2xl">{stat.icon}</span>
              <span className="text-2xl font-bold">{stat.value}</span>
            </div>
            <p className="text-sm text-gray-400">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Products</h2>
        <button
          onClick={openAddModal}
          className="rounded-xl bg-space-accent px-6 py-2.5 font-medium text-white transition-all hover:brightness-110 hover:shadow-lg hover:shadow-space-accent/25"
        >
          + Add Product
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/10 border-t-space-accent" />
          <p className="text-gray-400">Loading inventory...</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left text-sm text-gray-400">
                  <th className="p-4">Product</th>
                  <th className="p-4">Category</th>
                  <th className="p-4">Price</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-white/5 transition-colors hover:bg-white/5"
                  >
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-lg bg-white/10">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                          ) : (
                            <span className="text-xl">📦</span>
                          )}
                        </div>
                        <span className="font-medium">{product.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="rounded-full bg-space-accent/20 px-3 py-1 text-xs font-medium text-space-glow">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-space-glow">${product.price}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEditModal(product)}
                          className="rounded-lg bg-white/10 px-3 py-1.5 text-sm transition-colors hover:bg-white/20"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="rounded-lg bg-white/5 px-3 py-1.5 text-sm text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {products.length === 0 && (
            <div className="py-12 text-center">
              <span className="mb-3 block text-4xl">📦</span>
              <p className="text-gray-400">No products yet. Add your first cosmic item!</p>
            </div>
          )}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-space-deep p-6">
            <h3 className="mb-6 text-xl font-semibold">
              {editingProduct ? "Edit Product" : "Add Product"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-gray-400">Name</label>
                <input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-space-accent"
                  placeholder="Product name"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Price ($)</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-space-accent"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm text-gray-400">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-space-accent"
                  >
                    <option value="Sneakers">Sneakers</option>
                    <option value="Classic">Classic</option>
                    <option value="Boots">Boots</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-400">Image URL</label>
                <input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none focus:border-space-accent"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image_url && (
                  <div className="mt-2 flex justify-center">
                    <img
                      src={formData.image_url}
                      alt="Preview"
                      className="h-20 w-20 rounded-xl object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="rounded-xl px-5 py-2.5 text-gray-400 transition-colors hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!formData.name || formData.price <= 0}
                className="rounded-xl bg-space-accent px-6 py-2.5 font-medium text-white transition-all hover:brightness-110 disabled:opacity-50"
              >
                {editingProduct ? "Save Changes" : "Add Product"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
