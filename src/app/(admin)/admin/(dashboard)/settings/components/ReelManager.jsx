"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Video, Eye, Link, Layers, AlertCircle, Sparkles } from "lucide-react";

export default function ReelManager() {
  const [reels, setReels] = useState([]);
  const [products, setProducts] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    videoUrl: "",
    thumbnailUrl: "",
    linkedProduct: "",
    caption: ""
  });

  const fetchStreamData = async () => {
    try {
      const token = localStorage.getItem("token");
      // 1. Load active reels stream
      const reelsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/stream`);
      const reelsData = await reelsRes.json();
      if (reelsData.success) setReels(reelsData.reels || []);

      // 2. Load simple product listing references for the form selection dropdown mapping
      const prodRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/admin/products`, {
        headers: { Authorization: `JWT ${token}` }
      });
      const prodData = await prodRes.json();
      if (prodData.success) setProducts(prodData.products || []);
    } catch (err) {
      console.error("Failed to load backend reel stream states:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchStreamData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/addReel`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `JWT ${token}` },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setShowModal(false);
        setFormData({ videoUrl: "", thumbnailUrl: "", linkedProduct: "", caption: "" });
        fetchStreamData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to remove this video node from the storefront stream?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/watch-buy/admin/reels/${id}`, {
        method: "DELETE",
        headers: { Authorization: `JWT ${localStorage.getItem("token")}` }
      });
      if (res.ok) fetchStreamData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-center py-12 text-xs text-slate-400 font-medium animate-pulse">Loading active media catalogs...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Active Stream Overview</h3>
          <p className="text-xs text-slate-500 mt-0.5">Currently running {reels.length} immersive video nodes on the storefront layout tray.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-sm transition">
          <Plus size={14} /> Add Video Reel
        </button>
      </div>

      {/* Admin Visual Catalog Dashboard Display Stream Grid Grid Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5">
        {reels.map((reel) => (
          <div key={reel._id} className="group relative bg-white border border-slate-200 shadow-sm rounded-xl overflow-hidden flex flex-col justify-between">
            <div className="relative aspect-[9/16] bg-black">
              <video src={reel.videoUrl} muted loop playsInline className="w-full h-full object-cover opacity-90" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30 p-3 flex flex-col justify-between opacity-0 group-hover:opacity-100 transition duration-200">
                <button onClick={() => handleDelete(reel._id)} className="self-end p-2 bg-rose-500/90 text-white rounded-lg hover:bg-rose-600 transition shadow-md">
                  <Trash2 size={14} />
                </button>
                <p className="text-[11px] text-slate-200 line-clamp-2 italic font-medium">"{reel.caption || 'No caption configured.'}"</p>
              </div>
            </div>
            
            <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between min-w-0">
              <div className="min-w-0 flex-1">
                <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">Linked Bottle</span>
                <strong className="block text-xs font-bold text-slate-800 truncate mt-0.5">{reel.linkedProduct?.title || "Unknown Reference"}</strong>
              </div>
              <a href={`/shop/product/${reel.linkedProduct?._id}`} target="_blank" className="p-1.5 bg-white border border-slate-200 text-slate-600 rounded-md hover:text-slate-900 transition">
                <Eye size={12} />
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Add Reel Interactive Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <header className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Video size={16} className="text-slate-700" /> Configure Watch & Buy Stream Node
              </h3>
            </header>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Link size={12} /> Direct Video Stream Path (MP4) *</label>
                <input type="url" required value={formData.videoUrl} onChange={(e) => setFormData({...formData, videoUrl: e.target.value})} placeholder="e.g. https://cdn.bouncybucket.com/reels/trek.mp4" className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-slate-900 bg-slate-50/50" />
                <span className="text-[10px] text-slate-400 mt-1 flex items-center gap-1"><AlertCircle size={10} /> Compress MP4 files down below **5MB** to guarantee fast performance logs.</span>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Link size={12} /> Poster Thumbnail Image Fallback URL</label>
                <input type="url" value={formData.thumbnailUrl} onChange={(e) => setFormData({...formData, thumbnailUrl: e.target.value})} placeholder="e.g. https://cdn.bouncybucket.com/covers/trek.jpg" className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-slate-900 bg-slate-50/50" />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Layers size={12} /> Connect Catalog Reference Bottle *</label>
                <select required value={formData.linkedProduct} onChange={(e) => setFormData({...formData, linkedProduct: e.target.value})} className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none focus:border-slate-900 cursor-pointer">
                  <option value="">-- Associate Product Target --</option>
                  {products.map((p) => <option key={p._id} value={p._id}>{p.title}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-1"><Sparkles size={12} /> Editorial Caption Notes</label>
                <textarea rows={2} maxLength={150} value={formData.caption} onChange={(e) => setFormData({...formData, caption: e.target.value})} placeholder="Write a catchy summary line..." className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-slate-900 resize-none bg-slate-50/50" />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={submitting} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition">{submitting ? "Publishing..." : "Save Stream Card"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}