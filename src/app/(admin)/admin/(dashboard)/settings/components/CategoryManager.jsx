"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, FolderPlus, Grid, Image as ImageIcon } from "lucide-react";

export default function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchCategories = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
    const data = await res.json();
    if (data.success) setCategories(data.categories || []);
  };

  useEffect(() => { fetchCategories(); }, []);

  const handleDelete = async (id) => {
    if (!confirm("Remove this target category mapping from your homepage quick collection layout rows?")) return;
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
        method: "DELETE",
        headers: { Authorization: `JWT ${localStorage.getItem("token")}` }
      });
      fetchCategories();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.target);
    const file = formData.get("image");

    try {
      const cloudData = new FormData();
      cloudData.append("file", file);
      cloudData.append("upload_preset", "Product Images");
      cloudData.append("cloud_name", "da1m7gtvf");

      const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/da1m7gtvf/image/upload`, {
        method: "POST",
        body: cloudData
      });
      const { secure_url } = await cloudRes.json();

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.getItem("token")}`
        },
        body: JSON.stringify({
          displayName: formData.get("displayName"),
          image: secure_url,
          order: Number(formData.get("order"))
        })
      });

      if (res.ok) {
        setShowModal(false);
        fetchCategories();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
        <div>
          <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Homepage Category Tray</h3>
          <p className="text-xs text-slate-500 mt-0.5">Manage rows of active category navigation shortcuts visible inside your main homepage deck grid.</p>
        </div>
        <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-lg shadow-sm transition">
          <Plus size={14} /> Add Category Card
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
        {categories.map((cat) => (
          <div key={cat._id} className="group relative bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex flex-col">
            <div className="relative aspect-square bg-slate-100 border-b border-slate-100">
              <img src={cat.image} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-150 p-2 flex justify-end items-start">
                <button onClick={() => handleDelete(cat._id)} className="p-2 bg-rose-500 text-white rounded-lg hover:bg-rose-600 transition shadow-md">
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            <div className="p-3 bg-slate-50/50 flex-1 flex flex-col justify-center">
              <h4 className="text-xs font-bold text-slate-800 truncate text-center">{cat.displayName}</h4>
              <span className="block text-[9px] font-mono font-medium text-slate-400 mt-0.5 text-center">Weight index: {cat.order || 0}</span>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/40 backdrop-blur-md">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden animate-scale-up">
            <header className="px-6 py-4 bg-slate-50 border-b border-slate-200">
              <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5"><FolderPlus size={15} /> Catalog Category Asset</h3>
            </header>
            <form onSubmit={handleCategorySubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Display Label Name *</label>
                <input name="displayName" required placeholder="e.g. Sports Insulated Flasks" className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-slate-900 bg-slate-50/50" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-1">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Sort Order</label>
                  <input name="order" type="number" defaultValue="0" className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:border-slate-900 bg-slate-50/50" />
                </div>
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1 flex items-center gap-0.5"><ImageIcon size={10} /> Lifestyle Photo *</label>
                  <input name="image" type="file" required className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-2.5 file:rounded-md file:border-0 file:text-[10px] file:font-bold file:bg-slate-100 file:text-slate-700 file:cursor-pointer cursor-pointer hover:file:bg-slate-200 transition" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 mt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-slate-200 rounded-lg hover:bg-slate-50 transition">Cancel</button>
                <button type="submit" disabled={uploading} className="px-5 py-2 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm transition">{uploading ? "Uploading..." : "Save Category"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}