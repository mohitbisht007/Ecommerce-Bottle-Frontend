"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Image as ImageIcon, Smartphone, Monitor, Link2, Hash } from "lucide-react";

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/banners`);
    const data = await res.json();
    setBanners(data);
  };

  useEffect(() => { fetchBanners(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Delete this hero carousel card?")) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/banners/${id}`, {
        method: "DELETE",
        headers: { Authorization: `JWT ${localStorage.getItem("token")}` }
      });
      if (res.ok) fetchBanners();
    } catch (err) {
      console.error(err);
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.target);
    const pcFile = formData.get("pcImage");
    const mobileFile = formData.get("mobileImage");

    try {
      const uploadToCloudinary = async (file) => {
        const cloudData = new FormData();
        cloudData.append("file", file);
        cloudData.append("upload_preset", "Product Images");
        cloudData.append("cloud_name", "da1m7gtvf");

        const res = await fetch(`https://api.cloudinary.com/v1_1/da1m7gtvf/image/upload`, {
          method: "POST",
          body: cloudData
        });
        const data = await res.json();
        return data.secure_url;
      };

      const [pcUrl, mobileUrl] = await Promise.all([
        uploadToCloudinary(pcFile),
        uploadToCloudinary(mobileFile)
      ]);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/storefront/banners`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          title: formData.get("title"),
          link: formData.get("link"),
          order: Number(formData.get("order")),
          imageUrl: pcUrl,
          mobileImageUrl: mobileUrl
        })
      });

      if (res.ok) {
        setShowModal(false);
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
    } {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Carousel Assets Deck</h3>
          <p className="text-xs text-slate-500 mt-0.5">Control high-resolution promotional sliders displayed in the primary web layout viewport block.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-sm transition">
          <Plus size={14} /> Create Slider
        </button>
      </div>

      {/* Main Structural Card Row Elements */}
      <div className="space-y-4">
        {banners.map((b) => (
          <div key={b._id} className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row items-center gap-4 shadow-sm group">
            <div className="flex gap-2 w-full md:w-auto">
              <div className="relative w-32 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/60 flex-shrink-0" title="Desktop Banner Profile">
                <img src={b.imageUrl} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 bg-black/60 text-white p-0.5 rounded text-[8px]"><Monitor size={8} /></span>
              </div>
              <div className="relative w-12 h-16 bg-slate-100 rounded-lg overflow-hidden border border-slate-200/60 flex-shrink-0" title="Mobile Portrait Banner Profile">
                <img src={b.mobileImageUrl || b.imageUrl} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-1 left-1 bg-black/60 text-white p-0.5 rounded text-[8px]"><Smartphone size={8} /></span>
              </div>
            </div>

            <div className="flex-1 min-w-0 text-center md:text-left">
              <h4 className="text-sm font-bold text-slate-900 truncate">{b.title || "Untitled Carousel Entry"}</h4>
              <p className="text-xs text-slate-400 mt-0.5 truncate font-medium">Link Root Route: <span className="text-slate-600 font-mono">{b.link}</span> &bull; Index Sort Weight: <span className="text-slate-700 font-bold">{b.order}</span></p>
            </div>

            <button onClick={() => handleDelete(b._id)} className="w-full md:w-auto p-2.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition flex items-center justify-center">
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>

      {/* Input Slider Creation Dialog Card Portal overlay modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-scale-up">
            <header className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><ImageIcon size={15} /> Add Hero Slide Resource</h3>
            </header>
            <form onSubmit={handleBannerSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Slide Campaign Title</label>
                <input name="title" required placeholder="e.g. Premium Laser Custom Matte Series" className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-slate-900 bg-slate-50/50" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-0.5"><Link2 size={10} /> Route Path</label>
                  <input name="link" required placeholder="/category/insulated-flasks" className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-slate-900 bg-slate-50/50" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-0.5"><Hash size={10} /> Sort Order</label>
                  <input name="order" type="number" defaultValue="0" className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-slate-900 bg-slate-50/50" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-slate-100 py-4 my-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1"><Monitor size={12} /> Desktop Image (16:9)</label>
                  <input name="pcImage" type="file" required className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:bg-slate-100 file:text-slate-700 file:cursor-pointer cursor-pointer hover:file:bg-slate-200 transition" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-1 flex items-center gap-1"><Smartphone size={12} /> Mobile Image (9:16)</label>
                  <input name="mobileImage" type="file" required className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:bg-slate-100 file:text-slate-700 file:cursor-pointer cursor-pointer hover:file:bg-slate-200 transition" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={uploading} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition">{uploading ? "Uploading..." : "Save Banner Asset"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}