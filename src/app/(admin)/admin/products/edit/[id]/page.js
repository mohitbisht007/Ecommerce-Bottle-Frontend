"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function EditProductPage() {
  const { id } = useParams();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // existingImages = URLs already on Cloudinary
  const [existingImages, setExistingImages] = useState([]); 
  // newImagePreviews = blobs for UI preview
  const [newImagePreviews, setNewImagePreviews] = useState([]); 
  // newImageFiles = actual files to upload
  const [newImageFiles, setNewImageFiles] = useState([]);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    price: "",
    compareAtPrice: "",
    category: "Steel",
    sku: "",
    stock: 0,
    tags: "",
    featured: false,
  });

  // 1. Fetch Product Data on Load
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${id}`, {
          headers: { "Authorization": `JWT ${localStorage.getItem("token")}` }
        });
        const data = await res.json();
        
        if (res.ok) {
          setForm({
            ...data,
            tags: data.tags ? data.tags.join(", ") : "",
          });
          setExistingImages(data.images || []);
        }
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchProduct();
  }, [id]);

  // 2. Handle New Image Selection
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setNewImageFiles((prev) => [...prev, ...files]);

    const previews = files.map((file) => URL.createObjectURL(file));
    setNewImagePreviews((prev) => [...prev, ...previews]);
    e.target.value = null;
  };

  // 3. Remove Existing Image (from Cloudinary list)
  const removeExistingImage = (index) => {
    setExistingImages(existingImages.filter((_, i) => i !== index));
  };

  // 4. Remove New Image (before upload)
  const removeNewImage = (index) => {
    setNewImagePreviews(newImagePreviews.filter((_, i) => i !== index));
    setNewImageFiles(newImageFiles.filter((_, i) => i !== index));
  };

  // 5. Submit Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const uploadedImageUrls = [];

      // A. Upload NEW files to Cloudinary
      for (const file of newImageFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "Product Images"); 
        formData.append("cloud_name", "da1m7gtvf");

        const cloudRes = await fetch(
          `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
          { method: "POST", body: formData }
        );
        const cloudData = await cloudRes.json();
        if (cloudData.secure_url) uploadedImageUrls.push(cloudData.secure_url);
      }

      // B. Merge: Old URLs (remaining) + New URLs
      const finalImages = [...existingImages, ...uploadedImageUrls];

      // C. Prepare Payload
      const updatedData = {
        ...form,
        price: Number(form.price),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        stock: Number(form.stock),
        tags: form.tags.split(",").map(t => t.trim()).filter(t => t !== ""),
        images: finalImages,
      };

      // D. Send to Backend (PATCH)
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/update/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `JWT ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(updatedData),
      });

      if (res.ok) router.push("/admin/products");
      else alert("Update failed");

    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="admin-loader">Loading Product...</div>;

  return (
    <div className="admin-editor-container">
      <div className="admin-page-header">
        <button className="back-link" onClick={() => router.back()}>← Cancel</button>
        <h1>Edit Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="admin-editor-grid">
        <div className="editor-left">
          <div className="editor-card">
            <div className="form-group">
              <label>Product Title*</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows="6" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          <div className="editor-card">
            <label className="section-label">Product Images</label>
            <div className="image-uploader-grid">
              
              {/* Existing Images from Cloudinary */}
              {existingImages.map((src, i) => (
                <div key={`old-${i}`} className="image-preview">
                  <img src={src} alt="existing" />
                  <button type="button" onClick={() => removeExistingImage(i)} className="remove-img-badge">×</button>
                </div>
              ))}

              {/* New Previews (Blob) */}
              {newImagePreviews.map((src, i) => (
                <div key={`new-${i}`} className="image-preview new-upload">
                  <img src={src} alt="new preview" />
                  <button type="button" onClick={() => removeNewImage(i)} className="remove-img-badge">×</button>
                </div>
              ))}

              <label className="upload-placeholder">
                <input type="file" multiple onChange={handleImageChange} hidden />
                <span>+ Add More</span>
              </label>
            </div>
          </div>
        </div>

        <div className="editor-right">
          <div className="editor-card">
            <h3>Pricing</h3>
            <div className="form-group">
              <label>Price (₹)</label>
              <input type="number" required value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
            </div>
          </div>

          <div className="editor-card">
            <h3>Inventory</h3>
            <div className="form-group">
              <label>Stock</label>
              <input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
            </div>
          </div>

          <button type="submit" className="admin-save-btn" disabled={loading}>
            {loading ? "Saving Changes..." : "Update Product"}
          </button>
        </div>
      </form>
    </div>
  );
}