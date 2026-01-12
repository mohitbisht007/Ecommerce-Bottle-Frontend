"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AddProductPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);

  // --- 1. Main Form State ---
  // Root price and stock will be calculated based on variants in the backend
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    sku: "",
    tags: "",
    featured: false,
    price: "",
    compareAtPrice: "", 
  });

  // --- 2. Main Thumbnail State ---
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");

  // --- 3. Variants State ---
  // Added capacity, price, and stock to each variant
  const [variants, setVariants] = useState([
    { 
        colorName: "Default", 
        colorCode: "#000000", 
        capacity: "500ml", 
        price: "", 
        stock: 0, 
        images: [], 
        imageFiles: [] 
    }
  ]);

  // Auto-slug Logic
  useEffect(() => {
    const slugified = form.title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)+/g, "");
    setForm((prev) => ({ ...prev, slug: slugified }));
  }, [form.title]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        const data = await res.json();
        if (data.success) {
          setCategories(data.categories);
          if (data.categories.length > 0) {
            setForm(prev => ({ ...prev, category: data.categories[0].name }));
          }
        }
      } catch (err) {
        console.error("Dropdown Fetch Error:", err);
      }
    };
    fetchCategories();
  }, []);

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailPreview(URL.createObjectURL(file));
    }
  };

  const addVariant = () => {
    setVariants([...variants, { colorName: "", colorCode: "#000000", capacity: "500ml", price: "", stock: 0, images: [], imageFiles: [] }]);
  };

  const removeVariant = (index) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleVariantInfoChange = (index, field, value) => {
    const newVariants = [...variants];
    newVariants[index][field] = value;
    setVariants(newVariants);
  };

  const handleVariantImageChange = (vIdx, e) => {
    const files = Array.from(e.target.files);
    const newVariants = [...variants];
    newVariants[vIdx].imageFiles = [...newVariants[vIdx].imageFiles, ...files];
    const previews = files.map(file => URL.createObjectURL(file));
    newVariants[vIdx].images = [...newVariants[vIdx].images, ...previews];
    setVariants(newVariants);
    e.target.value = null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 1. Upload Thumbnail to Cloudinary
      let finalThumbnailUrl = "";
      if (thumbnailFile) {
        const thumbData = new FormData();
        thumbData.append("file", thumbnailFile);
        thumbData.append("upload_preset", "Product Images");
        thumbData.append("cloud_name", "da1m7gtvf");
        const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
          method: "POST",
          body: thumbData
        });
        const data = await res.json();
        finalThumbnailUrl = data.secure_url;
      }

      // 2. Upload Variant Images
      const processedVariants = [];
      for (let v of variants) {
        const uploadedUrls = [];
        for (let file of v.imageFiles) {
          const vFormData = new FormData();
          vFormData.append("file", file);
          vFormData.append("upload_preset", "Product Images");
          vFormData.append("cloud_name", "da1m7gtvf");
          const res = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: vFormData
          });
          const data = await res.json();
          if (data.secure_url) uploadedUrls.push(data.secure_url);
        }
        processedVariants.push({
          colorName: v.colorName,
          colorCode: v.colorCode,
          capacity: v.capacity,
          price: Number(v.price),
          stock: Number(v.stock),
          images: uploadedUrls
        });
      }

      // 3. Final Payload
      const finalPayload = {
        ...form,
        thumbnail: finalThumbnailUrl || (processedVariants[0]?.images[0] || ""),
        compareAtPrice: form.compareAtPrice ? Number(form.compareAtPrice) : undefined,
        tags: form.tags.split(",").map(t => t.trim()).filter(t => t !== ""),
        variants: processedVariants
      };

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/add`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `JWT ${localStorage.getItem("token")}`
        },
        body: JSON.stringify(finalPayload),
      });

      if (res.ok) router.push("/admin/products");
      else alert("Backend save failed");

    } catch (err) {
      console.error(err);
      alert("Error during publishing");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-editor-container">
      <div className="admin-page-header">
        <button className="back-link" onClick={() => router.back()}>← Back</button>
        <h1>Create New Product</h1>
      </div>

      <form onSubmit={handleSubmit} className="admin-editor-grid">
        <div className="editor-left">
          {/* Main Info Card */}
          <div className="editor-card">
            <h3>Product Information</h3>
            <div className="form-group">
              <label>Title*</label>
              <input type="text" required value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Matte Black Steel Bottle" />
            </div>
            <div className="form-group">
              <label>Slug*</label>
              <input type="text" required value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea rows="6" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Write details about the product..." />
            </div>
          </div>

          {/* Media Card */}
          <div className="editor-card">
            <h3>Display Thumbnail</h3>
            <div className="thumbnail-upload-area">
              {thumbnailPreview ? (
                <div className="thumb-preview-box">
                  <img src={thumbnailPreview} alt="Thumb" />
                  <button type="button" onClick={() => { setThumbnailPreview(""); setThumbnailFile(null) }}>Change</button>
                </div>
              ) : (
                <label className="thumb-upload-btn">
                  <input type="file" onChange={handleThumbnailChange} hidden />
                  <span>+ Upload Main Thumbnail Image</span>
                </label>
              )}
            </div>
          </div>

          {/* Variants Card */}
          <div className="editor-card">
            <div className="flex-header">
              <h3>Variants (Color & Size)</h3>
              <button type="button" className="add-var-btn" onClick={addVariant}>+ Add Variant</button>
            </div>
            {variants.map((v, vIdx) => (
              <div key={vIdx} className="variant-block" style={{border: '1px solid #eee', padding: '15px', borderRadius: '10px', marginBottom: '15px'}}>
                <div className="variant-inputs" style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px'}}>
                  <div className="form-group">
                    <label>Color Name</label>
                    <input type="text" placeholder="Navy Blue" value={v.colorName} onChange={(e) => handleVariantInfoChange(vIdx, "colorName", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Size / Capacity</label>
                    <select value={v.capacity} onChange={(e) => handleVariantInfoChange(vIdx, "capacity", e.target.value)}>
                        <option value="500ml">500ml</option>
                        <option value="750ml">750ml</option>
                        <option value="1L">1L</option>
                        <option value="2L">2L</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Price for this Variant (₹)*</label>
                    <input type="number" required value={v.price} onChange={(e) => handleVariantInfoChange(vIdx, "price", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Stock for this Variant*</label>
                    <input type="number" required value={v.stock} onChange={(e) => handleVariantInfoChange(vIdx, "stock", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Swatch</label>
                    <input type="color" value={v.colorCode} onChange={(e) => handleVariantInfoChange(vIdx, "colorCode", e.target.value)} />
                  </div>
                  <div className="form-group" style={{display: 'flex', alignItems: 'flex-end'}}>
                    <button type="button" className="remove-var" onClick={() => removeVariant(vIdx)} style={{color: 'red', marginBottom: '10px'}}>Remove Variant</button>
                  </div>
                </div>
                
                <div className="variant-images" style={{marginTop: '15px'}}>
                  <div className="image-uploader-grid">
                    {v.images.map((src, i) => <div key={i} className="image-preview"><img src={src} alt="p" /></div>)}
                    <label className="upload-placeholder">
                      <input type="file" multiple onChange={(e) => handleVariantImageChange(vIdx, e)} hidden />
                      <span>+ Add Images</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
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
                  <option key={cat._id} value={cat.name}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Tags</label>
              <input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} placeholder="eco, gym, travel" />
            </div>
            <div className="featured-row">
              <input type="checkbox" id="feat" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
              <label htmlFor="feat">Show on Home Page</label>
            </div>
          </div>

          <button type="submit" className="admin-save-btn" disabled={loading}>
            {loading ? "Publishing Product..." : "Publish Product"}
          </button>
        </div>
      </form>
    </div>
  );
}