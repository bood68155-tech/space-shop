import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import CosmicScene from "@/components/CosmicScene";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Space Shop - Cosmic Marketplace",
  description: "Shop the galaxy with Space Shop",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="cosmic-bg-image" />
        <CosmicScene />
        <div className="planet-earth" />
        <div className="planet-saturn" />
        <div className="planet-jupiter" />
        <div className="nebula-overlay" />
        <div className="relative z-10 min-h-screen">
          <Header />
          <main>{children}</main>
        </div>
      </body>
    </html>
  );
}
