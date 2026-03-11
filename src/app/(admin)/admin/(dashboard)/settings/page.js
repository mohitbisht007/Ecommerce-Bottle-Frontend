"use client";
import { useState, useEffect } from "react";

export default function StorefrontPage() {
  const [activeTab, setActiveTab] = useState("banners");
  const [loading, setLoading] = useState(false);

  // Announcement State
  const [announcement, setAnnouncement] = useState({
    text: "",
    enabled: true,
    bgColor: "#ec4899",
  });

  // 1. Load existing settings on page mount
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/storefront/settings`
        );
        const data = await res.json();
        if (data && data.announcement) {
          setAnnouncement(data.announcement);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      }
    };
    fetchSettings();
  }, []);

  // 2. Save Settings to Backend
  const handleAnnouncementSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/storefront/settings`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ announcement }), // Wrapping it in the key expected by Schema
        }
      );

      if (res.ok) {
        alert("Announcement settings saved successfully!");
      } else {
        alert("Failed to save settings.");
      }
    } catch (err) {
      console.error(err);
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-container">
      <div className="admin-page-header">
        <h1>Storefront Management</h1>
        <p>Control what customers see on the homepage.</p>
      </div>

      <div className="storefront-tabs">
        <button
          className={activeTab === "banners" ? "active" : ""}
          onClick={() => setActiveTab("banners")}
        >
          Hero Banners
        </button>
        <button
          className={activeTab === "announcement" ? "active" : ""}
          onClick={() => setActiveTab("announcement")}
        >
          Announcement Bar
        </button>
        <button
          className={activeTab === "categories" ? "active" : ""}
          onClick={() => setActiveTab("categories")}
        >
          Categories
        </button>
      </div>

      <div className="storefront-content">
        {activeTab === "banners" && <BannerManager />}

        {activeTab === "announcement" && (
          <div className="editor-card">
            <h3>Announcement Settings</h3>

            <div className="form-group" style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={announcement.enabled}
                  onChange={(e) =>
                    setAnnouncement({
                      ...announcement,
                      enabled: e.target.checked,
                    })
                  }
                />
                Enable Announcement Bar
              </label>
            </div>

            <div className="form-group">
              <label>Message Text</label>
              <input
                type="text"
                value={announcement.text}
                onChange={(e) =>
                  setAnnouncement({ ...announcement, text: e.target.value })
                }
                placeholder="e.g. Sale ends tonight!"
              />
            </div>

            <div className="form-group">
              <label>Background Color</label>
              <div
                style={{ display: "flex", gap: "10px", alignItems: "center" }}
              >
                <input
                  type="color"
                  value={announcement.bgColor}
                  onChange={(e) =>
                    setAnnouncement({
                      ...announcement,
                      bgColor: e.target.value,
                    })
                  }
                  style={{
                    width: "50px",
                    height: "40px",
                    padding: "0",
                    border: "none",
                  }}
                />
                <span>{announcement.bgColor}</span>
              </div>
            </div>

            <button
              className="admin-save-btn"
              onClick={handleAnnouncementSave}
              disabled={loading}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        )}

        {activeTab === "categories" && <CategoryManager />}
      </div>
    </div>
  );
}

// Sub-Component for Banners
function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  // 1. Fetch Banners on load
  const fetchBanners = async () => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/storefront/banners`
    );
    const data = await res.json();
    setBanners(data);
  };

  const deleteBanner = async (id) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;

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
        setBanners(banners.filter((b) => b._id !== id));
        fetchBanners();
      } else {
        alert("Failed to delete banner.");
      }
    } catch (err) {
      console.error("Error deleting banner:", err);
      alert("An error occurred while deleting.");
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // 2. Submit Logic (Cloudinary + Backend)
  const handleBannerSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData(e.target);
    const pcFile = formData.get("pcImage");
    const mobileFile = formData.get("mobileImage");

    try {
      // Helper function for Cloudinary upload
      const uploadToCloudinary = async (file) => {
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
        return data.secure_url;
      };

      // Step A: Upload both images in parallel for speed
      const [pcUrl, mobileUrl] = await Promise.all([
        uploadToCloudinary(pcFile),
        uploadToCloudinary(mobileFile),
      ]);

      // Step B: Save to MongoDB
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
            mobileImageUrl: mobileUrl, // Sending the new field
          }),
        }
      );

      if (res.ok) {
        setShowModal(false);
        fetchBanners();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="banner-manager">
      <div className="banner-list">
        {banners.map((b) => (
          <div key={b._id} className="banner-item-card">
            <img src={b.imageUrl} alt="" className="banner-preview-img" />
            <div className="banner-info">
              <h4>{b.title}</h4>
              <p>
                Link: {b.link} | Order: {b.order}
              </p>
            </div>
            <div className="banner-actions">
              <button
                className="delete-icon"
                onClick={() => {
                  deleteBanner(b._id);
                }}
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="add-banner-dashed" onClick={() => setShowModal(true)}>
        + Add New Hero Banner
      </button>

      {/* --- ADD BANNER MODAL --- */}
      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <h3>Add Hero Banner</h3>
            <form onSubmit={handleBannerSubmit}>
              <div className="form-group">
                <label>Banner Title</label>
                <input name="title" placeholder="e.g. Summer Collection" />
              </div>
              <div className="form-group">
                <label>Target Link</label>
                <input
                  name="link"
                  required
                  placeholder="e.g. /category/steel"
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Desktop Banner (16:9)</label>
                  <input name="pcImage" type="file" required />
                </div>
                <div className="form-group">
                  <label>Mobile Banner (9:16)</label>
                  <input name="mobileImage" type="file" required />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-btn"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Save Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fetchCategories = async () => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
    const data = await res.json();
    if (data.success) setCategories(data.categories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCategorySubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const formData = new FormData(e.target);
    const file = formData.get("image");

    try {
      // Step A: Cloudinary Upload
      const cloudData = new FormData();
      cloudData.append("file", file);
      cloudData.append("upload_preset", "Product Images");
      cloudData.append("cloud_name", "da1m7gtvf");

      const cloudRes = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: cloudData,
        }
      );
      const { secure_url } = await cloudRes.json();

      // Step B: Backend Save
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/categories/add`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            displayName: formData.get("displayName"),
            image: secure_url,
            order: Number(formData.get("order")),
          }),
        }
      );

      if (res.ok) {
        setShowModal(false);
        fetchCategories();
      }
    } catch (err) {
      console.error("Error adding category:", err);
    } finally {
      setUploading(false);
    }
  };

  const deleteCategory = async (id) => {
    if (!confirm("Are you sure? This will remove it from the homepage tray."))
      return;
    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/${id}`, {
      method: "DELETE",
      headers: { Authorization: `JWT ${localStorage.getItem("token")}` },
    });
    fetchCategories();
  };

  return (
    <div className="category-manager">
      <div className="admin-grid-layout">
        {categories.map((cat) => (
          <div key={cat._id} className="admin-cat-card">
            <img
              src={cat.image}
              alt={cat.displayName}
              className="admin-cat-img"
            />
            <div className="admin-cat-info">
              <h4>{cat.displayName}</h4>
              <p>Slug: {cat.name}</p>
            </div>
            <button
              className="delete-btn-overlay"
              onClick={() => deleteCategory(cat._id)}
            >
              🗑️
            </button>
          </div>
        ))}

        <div className="add-card-dashed" onClick={() => setShowModal(true)}>
          <span>+ Add Homepage Category</span>
        </div>
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal-card">
            <h3>Add Category Card</h3>
            <p className="modal-subtitle">
              This will appear in the "Shop by Category" tray on the homepage.
            </p>
            <form onSubmit={handleCategorySubmit}>
              <div className="form-group">
                <label>Display Name (e.g. Steel Bottles)</label>
                <input
                  name="displayName"
                  required
                  placeholder="Enter category name..."
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Order</label>
                  <input name="order" type="number" defaultValue="0" />
                </div>
                <div className="form-group">
                  <label>Lifestyle Image</label>
                  <input name="image" type="file" required />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button
                  type="submit"
                  className="admin-primary-btn"
                  disabled={uploading}
                >
                  {uploading ? "Uploading..." : "Save Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
