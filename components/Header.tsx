"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/auth/login");
    router.refresh();
  };

  const navLinks = [
    { href: "/shop", label: "Shop" },
    ...(user ? [{ href: "/admin/dashboard", label: "Admin" }] : []),
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-space-dark/60 backdrop-blur-2xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/shop" className="flex items-center gap-2 text-xl font-bold">
          <span className="text-2xl">🚀</span>
          <span className="bg-gradient-to-r from-space-accent to-space-glow bg-clip-text text-transparent text-glow">
            Space Shop
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-space-glow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {pathname === link.href && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-lg bg-space-accent/15 border border-space-accent/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">{link.label}</span>
            </Link>
          ))}

          {user ? (
            <button
              onClick={handleLogout}
              className="rounded-lg px-4 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
            >
              Logout
            </button>
          ) : (
            <Link
              href="/auth/login"
              className={`relative rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === "/auth/login"
                  ? "text-space-glow"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {pathname === "/auth/login" && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute inset-0 rounded-lg bg-space-accent/15 border border-space-accent/20"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <span className="relative z-10">Login</span>
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
