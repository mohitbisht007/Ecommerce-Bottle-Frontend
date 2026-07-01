"use client";

import { useState, useEffect } from "react";
import { Sliders, Megaphone, FolderOpen, Film } from "lucide-react";
import BannerManager from "./components/BannerManager";
import AnnouncementManager from "./components/AnnouncementManager";
import CategoryManager from "./components/CategoryManager";
import ReelManager from "./components/ReelManager";

export default function StorefrontPage() {
  const [activeTab, setActiveTab] = useState("banners");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    document.title = "Storefront Management | Admin";
  }, []);

  if (!mounted) return null;

  const tabs = [
    { id: "banners", label: "Hero Banners", icon: <Sliders size={16} /> },
    { id: "announcement", label: "Announcement Bar", icon: <Megaphone size={16} /> },
    { id: "categories", label: "Categories", icon: <FolderOpen size={16} /> },
    { id: "reels", label: "Watch & Buy Reels", icon: <Film size={16} /> },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 min-h-screen bg-slate-50/50">
      {/* Dashboard Header Banner */}
      <header className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Storefront Engine</h1>
        <p className="text-sm text-slate-500 mt-1">Configure layout arrays, promotional alert nodes, and interactive streaming content displays live on Bouncy Bucket.</p>
      </header>

      {/* Modern Horizontal Scroll Tab Controls Tray */}
      <div className="flex border-b border-slate-200 gap-1 overflow-x-auto scrollbar-none mb-8 bg-white p-1 rounded-xl shadow-sm">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider whitespace-nowrap transition duration-200 ${
              activeTab === tab.id
                ? "bg-slate-900 text-white shadow-sm"
                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Dynamic Render Context Area */}
      <main className="transition-all duration-300">
        {activeTab === "banners" && <BannerManager />}
        {activeTab === "announcement" && <AnnouncementManager />}
        {activeTab === "categories" && <CategoryManager />}
        {activeTab === "reels" && <ReelManager />}
      </main>
    </div>
  );
}