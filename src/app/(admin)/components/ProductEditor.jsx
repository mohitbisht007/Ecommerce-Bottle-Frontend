"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { compressImage } from "@/app/helpers/imageCompression";

export default function ProductEditor({ productId = null }) {
  const router = useRouter();
  const isEditMode = !!productId;

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEditMode);
  const [categories, setCategories] = useState([]);
  const [uploadStep, setUploadStep] = useState("");
  const [progress, setProgress] = useState(0);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    sku: "",
    tags: "",
    featured: false,
    compareAtPrice: "",
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [variants, setVariants] = useState([
    { colorName: "Default", colorCode: "#000000", capacity: "500ml", price: "", stock: 0, images: [], imageFiles: [] },
  ]);

  // --- Logic & Handlers ---

  useEffect(() => {
    const loadData = async () => {
      try {
        const catRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        const catData = await catRes.json();
        if (catData.success) setCategories(catData.categories);

        if (isEditMode) {
          const prodRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/${productId}`, {
            headers: { Authorization: `JWT ${localStorage.getItem("token")}` },
          });
          const prodData = await prodRes.json();
          if (prodRes.ok) {
            setForm({
              ...prodData,
              tags: prodData.tags ? prodData.tags.join(", ") : "",
              compareAtPrice: prodData.compareAtPrice || ""
            });
            setThumbnailPreview(prodData.thumbnail);
            setVariants(prodData.variants.map((v) => ({ ...v, imageFiles: [] })));
          }
        }
      } catch (err) { console.error(err); } finally { setFetching(false); }
    };
    loadData();
  }, [productId, isEditMode]);

  useEffect(() => {
    if (!isEditMode) {
      const slugified = form.title.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
      setForm((prev) => ({ ...prev, slug: slugified }));
    }
  }, [form.title, isEditMode]);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const handleVariantImageChange = (vIdx, e) => {
    const files = Array.from(e.target.files);
    const newVariants = [...variants];
    newVariants[vIdx].imageFiles = [...newVariants[vIdx].imageFiles, ...files];
    const previews = files.map((file) => URL.createObjectURL(file));
    newVariants[vIdx].images = [...newVariants[vIdx].images, ...previews];
    setVariants(newVariants);
  };

  const handleVariantInfoChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const removeVariantImage = (vIdx, imgIdx) => {
    const newVariants = [...variants];

    // 1. Revoke the Blob URL to prevent memory leaks (if it's a local preview)
    const imageToRemove = newVariants[vIdx].images[imgIdx];
    if (imageToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(imageToRemove);
    }

    // 2. Remove from the preview array
    newVariants[vIdx].images = newVariants[vIdx].images.filter((_, i) => i !== imgIdx);

    // 3. Remove from the file upload array
    // Note: We only filter imageFiles if the image being removed was a new upload
    // (Existing images from the DB don't have a corresponding entry in imageFiles)
    const totalExistingImages = newVariants[vIdx].images.filter(img => img.startsWith("http")).length;

    // If the removed image was a new file, calculate its relative index in imageFiles
    const relativeFileIdx = imgIdx - totalExistingImages;
    if (relativeFileIdx >= 0) {
      newVariants[vIdx].imageFiles = newVariants[vIdx].imageFiles.filter((_, i) => i !== relativeFileIdx);
    }

    setVariants(newVariants);
  };

  const addVariant = () => setVariants([...variants, { colorName: "", colorCode: "#000000", capacity: "500ml", price: "", stock: 0, images: [], imageFiles: [] }]);

  const removeVariant = (index) => {
    if (variants.length > 1) setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setProgress(5);

    try {
      let finalThumbnailUrl = thumbnailPreview;
      if (thumbnailFile) {
        setUploadStep("Uploading Thumbnail...");
        const thumbData = new FormData();
        thumbData.append("file", thumbnailFile);
        thumbData.append("upload_preset", "Product Images");
        thumbData.append("cloud_name", "da1m7gtvf");
        const res = await fetch(`https://api.cloudinary.com/v1_1/da1m7gtvf/image/upload`, { method: "POST", body: thumbData });
        const data = await res.json();
        finalThumbnailUrl = data.secure_url;
      }
      setProgress(30);

      setUploadStep("Processing variants...");
      const processedVariants = await Promise.all(variants.map(async (v) => {
        const existingUrls = v.images.filter((img) => img.startsWith("http"));
        const newUploads = await Promise.all(v.imageFiles.map(async (file) => {
          const compressed = await compressImage(file);
          const vFormData = new FormData();
          vFormData.append("file", compressed);
          vFormData.append("upload_preset", "Product Images");
          vFormData.append("cloud_name", "da1m7gtvf");
          const res = await fetch(`https://api.cloudinary.com/v1_1/da1m7gtvf/image/upload`, { method: "POST", body: vFormData });
          const data = await res.json();
          return data.secure_url;
        }));

        return {
          colorName: v.colorName,
          colorCode: v.colorCode,
          capacity: v.capacity,
          price: Number(v.price),
          stock: Number(v.stock),
          images: [...existingUrls, ...newUploads],
        };
      }));
      setProgress(80);

      setUploadStep("Saving product...");
      const finalPayload = {
        ...form,
        thumbnail: finalThumbnailUrl,
        variants: processedVariants,
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        tags: form.tags.split(",").map((t) => t.trim()).filter((t) => t !== ""),
      };

      const endpoint = isEditMode ? `/product/update/${productId}` : `/product/add`;
      const method = isEditMode ? "PATCH" : "POST";

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${endpoint}`, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `JWT ${localStorage.getItem("token")}` },
        body: JSON.stringify(finalPayload),
      });

      if (res.ok) {
        setProgress(100);
        router.push("/admin/products");
      } else { alert("Server Error"); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (fetching) return <div className="admin-loader">Loading...</div>;

  return (
    <div className="admin-editor-container">
      <div className="admin-page-header">
        <button className="back-link" onClick={() => router.back()}>← Back</button>
        <h1>{isEditMode ? "Edit Product" : "Create New Product"}</h1>
      </div>

      {loading && (
        <div className="progress-bar-wrap">
          <p>{uploadStep} ({progress}%)</p>
          <div className="bar"><div style={{ width: `${progress}%` }}></div></div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-editor-grid">
        <div className="editor-left">
          <div className="editor-card">
            <h3>Product Information</h3>
            <div className="form-group">
              <label>Title*</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Slug*</label>
              <input type="text" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows="6" cols="20" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
          </div>

          <div className="editor-card">
            <h3>Display Thumbnail</h3>
            <div className="thumbnail-upload-area">
              {thumbnailPreview ? (
                <div className="thumb-preview-box">
                  <img src={thumbnailPreview} alt="Thumb" />
                  <button type="button" onClick={() => { setThumbnailPreview(""); setThumbnailFile(null); }}>Change</button>
                </div>
              ) : (
                <label className="thumb-upload-btn">
                  <input type="file" onChange={handleThumbnailChange} hidden />
                  <span>+ Upload Thumbnail</span>
                </label>
              )}
            </div>
          </div>

          <div className="editor-card">
            <div className="flex-header">
              <h3>Variants (Color & Size)</h3>
              <button type="button" className="add-var-btn" onClick={addVariant}>+ Add Variant</button>
            </div>
            {variants.map((v, vIdx) => (
              <div key={vIdx} className="variant-block" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                <div className="variant-inputs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Color Name</label>
                    <input type="text" value={v.colorName} onChange={(e) => handleVariantInfoChange(vIdx, "colorName", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Size / Capacity</label>
                    <select value={v.capacity} onChange={(e) => handleVariantInfoChange(vIdx, "capacity", e.target.value)}>
                      <option value="500ml">500ml</option>
                      <option value="750ml">750ml</option>
                      <option value="1L">1L</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price (₹)*</label>
                    <input type="number" required value={v.price} onChange={(e) => handleVariantInfoChange(vIdx, "price", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Stock*</label>
                    <input type="number" required value={v.stock} onChange={(e) => handleVariantInfoChange(vIdx, "stock", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Swatch</label>
                    <input type="color" value={v.colorCode} onChange={(e) => handleVariantInfoChange(vIdx, "colorCode", e.target.value)} />
                  </div>
                  <button
                    type="button"
                    className="remove-var-btn"
                    onClick={(e) => {
                      e.preventDefault(); // Extra safety
                      removeVariant(vIdx);
                    }}
                    style={{ color: "red", alignSelf: 'flex-end', marginBottom: '10px' }}
                  >
                    Remove
                  </button>
                </div>
                <div className="image-uploader-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '10px' }}>
                  {v.images.map((src, i) => (
                    <div key={i} className="image-preview" style={{ position: 'relative', width: '80px', height: '80px' }}>
                      <img
                        src={src}
                        alt="Variant"
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }}
                      />
                      <button
                        type="button"
                        onClick={() => removeVariantImage(vIdx, i)}
                        style={{
                          position: 'absolute',
                          top: '-5px',
                          right: '-5px',
                          background: '#ef4444',
                          color: 'white',
                          border: 'none',
                          borderRadius: '50%',
                          width: '20px',
                          height: '20px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                        }}
                      >
                        ×
                      </button>
                    </div>
                  ))}

                  <label className="upload-placeholder" style={{
                    width: '80px',
                    height: '80px',
                    border: '2px dashed #ccc',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer'
                  }}>
                    <input type="file" multiple onChange={(e) => handleVariantImageChange(vIdx, e)} hidden />
                    <span style={{ fontSize: '20px', color: '#666' }}>+</span>
                  </label>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="editor-right">
          <div className="editor-card">
            <h3>Global Pricing</h3>
            <div className="form-group">
              <label>Original Price (Strike-through ₹)</label>
              <input type="number" value={form.compareAtPrice} onChange={(e) => setForm({ ...form, compareAtPrice: e.target.value })} placeholder="e.g. 999" />
            </div>
          </div>

          <div className="editor-card">
            <h3>Organization</h3>
            <div className="form-group">
              <label>SKU (Base)</label>
              <input type="text" value={form.sku} onChange={(e) => setForm({ ...form, sku: e.target.value })} placeholder="BOT-001" />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                <option value="">-- Choose a Category --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>{cat.displayName}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tags</label>
              <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="tag1, tag2" />
            </div>
            <div className="featured-row">
              <input type="checkbox" id="feat" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              <label htmlFor="feat">Show on Home Page</label>
            </div>
          </div>
          <button type="submit" className="admin-save-btn" disabled={loading}>
            {loading ? "Processing..." : isEditMode ? "Update Product" : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}