"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  Image as ImageIcon,
  Smartphone,
  Monitor,
  Link2,
  Hash,
  X,
  Save,
  ExternalLink,
} from "lucide-react";

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [uploading, setUploading] = useState(false);

  const fetchBanners = async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/storefront/banners`
      );

      const data = await res.json();

      if (res.ok) {
        setBanners(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  /* =========================
     DELETE BANNER
  ========================= */

  const handleDelete = async (id) => {
    if (!confirm("Delete this hero carousel banner?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/storefront/banners/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `JWT ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.ok) {
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
    }
  };

  /* =========================
     CLOUDINARY UPLOAD
  ========================= */

  const uploadToCloudinary = async (file) => {
    if (!file || file.size === 0) return null;

    const cloudData = new FormData();

    cloudData.append("file", file);
    cloudData.append("upload_preset", "Product Images");
    cloudData.append("cloud_name", "da1m7gtvf");

    const res = await fetch(
      `https://api.cloudinary.com/v1_1/da1m7gtvf/image/upload`,
      {
        method: "POST",
        body: cloudData,
      }
    );

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error?.message || "Cloudinary upload failed");
    }

    return data.secure_url;
  };

  /* =========================
     ADD BANNER
  ========================= */

  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.target);

    const pcFile = formData.get("pcImage");
    const mobileFile = formData.get("mobileImage");

    try {
      const [pcUrl, mobileUrl] = await Promise.all([
        uploadToCloudinary(pcFile),
        uploadToCloudinary(mobileFile),
      ]);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/storefront/banners`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: formData.get("title"),
            link: formData.get("link"),
            order: Number(formData.get("order")),
            imageUrl: pcUrl,
            mobileImageUrl: mobileUrl,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to create banner");
      }

      setShowModal(false);
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  /* =========================
     OPEN EDIT MODAL
  ========================= */

  const openEditModal = (banner) => {
    setEditingBanner(banner);
  };

  const closeEditModal = () => {
    if (uploading) return;
    setEditingBanner(null);
  };

  /* =========================
     UPDATE BANNER
  ========================= */

  const handleBannerUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.target);

    const pcFile = formData.get("pcImage");
    const mobileFile = formData.get("mobileImage");

    try {
      let pcUrl = editingBanner.imageUrl;
      let mobileUrl = editingBanner.mobileImageUrl;

      /*
       * Only upload new image if user
       * selected one.
       */

      if (pcFile && pcFile.size > 0) {
        pcUrl = await uploadToCloudinary(pcFile);
      }

      if (mobileFile && mobileFile.size > 0) {
        mobileUrl = await uploadToCloudinary(mobileFile);
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/storefront/banners/edit/${editingBanner._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            title: formData.get("title"),
            link: formData.get("link"),
            order: Number(formData.get("order")),
            imageUrl: pcUrl,
            mobileImageUrl: mobileUrl,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update banner");
      }

      setEditingBanner(null);
      fetchBanners();
    } catch (err) {
      console.error(err);
      alert(err.message || "Something went wrong");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">

      {/* ================= HEADER ================= */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

        <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">

          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <ImageIcon size={17} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Hero Banners
                </h3>

                <p className="text-xs text-slate-500 mt-0.5">
                  Manage desktop and mobile carousel assets
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <Plus size={15} />
            Add Banner
          </button>

        </div>

        <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/70">
          <div className="flex items-center justify-between">

            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Active Slides
            </span>

            <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
              {banners.length}
            </span>

          </div>
        </div>

      </div>


      {/* ================= BANNER LIST ================= */}

      <div className="space-y-3">

        {banners.map((b, index) => (

          <div
            key={b._id}
            className="group bg-white border border-slate-200 rounded-2xl p-3 sm:p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
          >

            <div className="flex flex-col md:flex-row items-center gap-4">

              {/* IMAGES */}

              <div className="flex items-center gap-2 w-full md:w-auto">

                <div className="relative w-full sm:w-40 md:w-44 h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">

                  <img
                    src={b.imageUrl}
                    alt={b.title || "Desktop banner"}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/65 backdrop-blur-sm text-white px-2 py-1 rounded-md text-[9px] font-bold uppercase">
                    <Monitor size={10} />
                    Desktop
                  </div>

                </div>


                <div className="relative w-16 h-24 bg-slate-100 rounded-xl overflow-hidden border border-slate-200">

                  <img
                    src={b.mobileImageUrl || b.imageUrl}
                    alt={b.title || "Mobile banner"}
                    className="w-full h-full object-cover"
                  />

                  <div className="absolute bottom-1 left-1 right-1 flex items-center justify-center gap-1 bg-black/65 backdrop-blur-sm text-white py-1 rounded text-[8px] font-bold">
                    <Smartphone size={9} />
                    Mobile
                  </div>

                </div>

              </div>


              {/* INFO */}

              <div className="flex-1 min-w-0 w-full text-center md:text-left">

                <div className="flex items-center justify-center md:justify-start gap-2">

                  <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded">
                    #{index + 1}
                  </span>

                  <h4 className="text-sm font-bold text-slate-900 truncate">
                    {b.title || "Untitled Banner"}
                  </h4>

                </div>

                <div className="mt-2 flex flex-wrap justify-center md:justify-start gap-x-4 gap-y-1 text-[11px] text-slate-500">

                  <span className="flex items-center gap-1">
                    <Link2 size={11} />
                    <span className="font-mono text-slate-700">
                      {b.link || "/"}
                    </span>
                  </span>

                  <span className="flex items-center gap-1">
                    <Hash size={11} />
                    Order:
                    <strong className="text-slate-700">
                      {b.order}
                    </strong>
                  </span>

                </div>

              </div>


              {/* ACTIONS */}

              <div className="flex items-center gap-2 w-full md:w-auto justify-end">

                <button
                  onClick={() => openEditModal(b)}
                  className="flex-1 md:flex-none flex items-center justify-center gap-1.5 px-3 py-2.5 border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition text-xs font-bold"
                >
                  <Pencil size={14} />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(b._id)}
                  className="p-2.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg transition"
                  title="Delete banner"
                >
                  <Trash2 size={15} />
                </button>

              </div>

            </div>

          </div>

        ))}

      </div>


      {/* ================= ADD MODAL ================= */}

      {showModal && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">

          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">

            <ModalHeader
              title="Add Hero Banner"
              icon={<Plus size={16} />}
              onClose={() => setShowModal(false)}
            />

            <form
              onSubmit={handleBannerSubmit}
              className="p-6 space-y-5"
            >

              <BannerFields />

              <ImageUploadFields required />

              <ModalActions
                onCancel={() => setShowModal(false)}
                loading={uploading}
                submitText="Create Banner"
              />

            </form>

          </div>

        </div>

      )}


      {/* ================= EDIT MODAL ================= */}

      {editingBanner && (

        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">

          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden">

            <ModalHeader
              title="Edit Hero Banner"
              icon={<Pencil size={16} />}
              onClose={closeEditModal}
            />

            <form
              onSubmit={handleBannerUpdate}
              className="p-6 space-y-5"
            >

              <BannerFields banner={editingBanner} />

              {/* CURRENT PREVIEW */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <ImagePreview
                  label="Current Desktop"
                  icon={<Monitor size={12} />}
                  src={editingBanner.imageUrl}
                />

                <ImagePreview
                  label="Current Mobile"
                  icon={<Smartphone size={12} />}
                  src={editingBanner.mobileImageUrl || editingBanner.imageUrl}
                />

              </div>


              <ImageUploadFields />

              <p className="text-[11px] text-slate-400 -mt-2">
                Leave an image empty if you don't want to replace it.
              </p>

              <ModalActions
                onCancel={closeEditModal}
                loading={uploading}
                submitText="Save Changes"
              />

            </form>

          </div>

        </div>

      )}

    </div>
  );
}


/* =========================================================
   MODAL HEADER
========================================================= */

function ModalHeader({ title, icon, onClose }) {
  return (
    <header className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">

      <div className="flex items-center gap-2">

        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
          {icon}
        </div>

        <h3 className="text-sm font-bold text-slate-800">
          {title}
        </h3>

      </div>

      <button
        type="button"
        onClick={onClose}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition"
      >
        <X size={17} />
      </button>

    </header>
  );
}


/* =========================================================
   BANNER FIELDS
========================================================= */

function BannerFields({ banner }) {
  return (
    <>
      <div>
        <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
          Slide Campaign Title
        </label>

        <input
          name="title"
          required
          defaultValue={banner?.title || ""}
          placeholder="e.g. Premium Laser Custom Matte Series"
          className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
        />
      </div>


      <div className="grid grid-cols-3 gap-3">

        <div className="col-span-2">

          <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            <Link2 size={10} />
            Route Path
          </label>

          <input
            name="link"
            required
            defaultValue={banner?.link || ""}
            placeholder="/category/insulated-flasks"
            className="w-full text-xs font-mono border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
          />

        </div>


        <div>

          <label className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
            <Hash size={10} />
            Sort Order
          </label>

          <input
            name="order"
            type="number"
            defaultValue={banner?.order ?? 0}
            className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 bg-white"
          />

        </div>

      </div>
    </>
  );
}


/* =========================================================
   IMAGE UPLOAD FIELDS
========================================================= */

function ImageUploadFields({ required = false }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-b border-slate-100 py-4">

      <div>

        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
          <Monitor size={12} />
          Desktop Image
        </label>

        <input
          name="pcImage"
          type="file"
          accept="image/*"
          required={required}
          className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:bg-slate-100 file:text-slate-700 file:cursor-pointer cursor-pointer hover:file:bg-slate-200 transition"
        />

      </div>


      <div>

        <label className="flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-wider mb-2">
          <Smartphone size={12} />
          Mobile Image
        </label>

        <input
          name="mobileImage"
          type="file"
          accept="image/*"
          required={required}
          className="w-full text-xs text-slate-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-[11px] file:font-bold file:bg-slate-100 file:text-slate-700 file:cursor-pointer cursor-pointer hover:file:bg-slate-200 transition"
        />

      </div>

    </div>
  );
}


/* =========================================================
   IMAGE PREVIEW
========================================================= */

function ImagePreview({ label, icon, src }) {
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50">

      <div className="px-3 py-2 border-b border-slate-200 flex items-center gap-1.5">
        {icon}
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          {label}
        </span>
      </div>

      <div className="h-28 bg-slate-100">
        <img
          src={src}
          alt={label}
          className="w-full h-full object-cover"
        />
      </div>

    </div>
  );
}


/* =========================================================
   MODAL ACTIONS
========================================================= */

function ModalActions({
  onCancel,
  loading,
  submitText,
}) {
  return (
    <div className="flex justify-end gap-2 pt-1">

      <button
        type="button"
        onClick={onCancel}
        disabled={loading}
        className="px-4 py-2.5 text-xs font-bold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-sm transition"
      >
        {loading ? (
          <>
            <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Saving...
          </>
        ) : (
          <>
            <Save size={14} />
            {submitText}
          </>
        )}
      </button>

    </div>
  );
}