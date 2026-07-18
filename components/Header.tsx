"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-space-dark/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link href="/shop" className="flex items-center gap-2 text-xl font-bold">
          <span className="text-2xl">🚀</span>
          <span className="bg-gradient-to-r from-space-accent to-space-glow bg-clip-text text-transparent">
            Space Shop
          </span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-space-accent/20 text-space-glow"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {link.label}
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
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
                pathname === "/auth/login"
                  ? "bg-space-accent/20 text-space-glow"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
