"use client";

import { useState, useEffect } from "react";
import { Check } from "lucide-react";

export default function AnnouncementManager() {
  const [loading, setLoading] = useState(false);
  const [announcement, setAnnouncement] = useState({ text: "", enabled: true, bgColor: "#0f172a" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/settings`);
        const data = await res.json();
        if (data && data.announcement) setAnnouncement(data.announcement);
      } catch (err) {
        console.error(err);
      }
    };
    fetchSettings();
  }, []);

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/settings`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ announcement }),
      });
      if (res.ok) alert("Announcement banner settings pushed live!");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl bg-white border border-slate-200 shadow-sm rounded-xl p-6 space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Announcement Bar Hub</h3>
        <p className="text-xs text-slate-500 mt-0.5">Push real-time alert updates across the absolute top layer header grid of the store.</p>
      </div>

      {/* Dynamic Live Canvas Mock Previewer */}
      <div className="space-y-1.5">
        <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live View Desktop Preview</span>
        <div 
          className="w-full text-center py-2 px-4 text-xs font-semibold tracking-wide shadow-inner rounded-lg transition-all duration-200"
          style={{ 
            backgroundColor: announcement.enabled ? announcement.bgColor : "#cbd5e1", 
            color: announcement.enabled ? "#ffffff" : "#64748b" 
          }}
        >
          {announcement.enabled ? (announcement.text || "Configure alert banner string notes...") : "Announcement strip is currently hidden"}
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer select-none">
          <input type="checkbox" checked={announcement.enabled} onChange={(e) => setAnnouncement({ ...announcement, enabled: e.target.checked })} className="w-4 h-4 rounded border-slate-300 accent-slate-900 cursor-pointer" />
          Enable Announcement Strip Module
        </label>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Banner String Message</label>
          <input type="text" value={announcement.text} onChange={(e) => setAnnouncement({ ...announcement, text: e.target.value })} placeholder="e.g. USE CODE FIRST10 TO GET FREE CUSTOM LASER ENGRAVING TONIGHT" className="w-full text-xs font-semibold text-slate-800 border border-slate-200 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-slate-900 bg-slate-50/50" />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">Canvas Tint Hex Background Color</label>
          <div className="flex gap-3 items-center">
            <input type="color" value={announcement.bgColor} onChange={(e) => setAnnouncement({ ...announcement, bgColor: e.target.value })} className="w-12 h-9 padding-0 border-0 rounded-lg cursor-pointer bg-transparent" />
            <span className="text-xs font-mono font-bold bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200/60 text-slate-700">{announcement.bgColor.toUpperCase()}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-100 pt-4 flex justify-end">
        <button onClick={handleSave} disabled={loading} className="w-full sm:w-auto flex items-center justify-center gap-1 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-lg shadow-sm transition">
          <Check size={14} /> {loading ? "Pushed..." : "Commit Live Changes"}
        </button>
      </div>
    </div>
  );
}