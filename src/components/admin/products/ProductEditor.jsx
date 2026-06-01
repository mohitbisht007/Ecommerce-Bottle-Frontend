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

    specifications: {
      type: "",
      material: "",
      weight: "",
      dimensions: "",
      finish: "",
      origin: "",

      insulation: "",
      hotRetention: "",
      coldRetention: "",

      leakproof: false,
      condensationFree: false,
      rustProof: false,

      suitableFor: [],
      mouthType: "",
      lidType: "",
      dishwasherSafe: false,
      carHolderFit: false
    },

    isCustomizable: false,

    customizationOptions: {
      price: 299,
      maxChars: 12,
      allowedFonts: ["Modern", "Elegant", "Sport", "Classic"],
      textPosition: {
        top: "55%",
        left: "50%"
      }
    }
  });

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [variants, setVariants] = useState([
    {
      baseColorName: "",
      colorName: "",
      colorCode: "#000000",
      images: [],
      imageFiles: [],
      sizes: [
        {
          capacity: "500ml",
          price: "",
          compareAtPrice: "",
          stock: 0
        }
      ]
    }
  ]);

  const addSize = (vIdx) => {
    const newVariants = [...variants];

    newVariants[vIdx].sizes.push({
      capacity: "",
      price: "",
      compareAtPrice: "",
      stock: 0
    });

    setVariants(newVariants);
  };

  const removeSize = (vIdx, sIdx) => {
    const newVariants = [...variants];
    if (newVariants[vIdx].sizes.length > 1) {
      newVariants[vIdx].sizes.splice(sIdx, 1);
      setVariants(newVariants);
    }
  };



  const isValidHex = (hex) => /^#([0-9A-F]{3}){1,2}$/i.test(hex);

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

    // Only validate for colorCode
    if (field === "colorCode") {
      // Allow typing (so user can type # first)
      newVariants[index][field] = value;

      // Only update if valid HEX OR empty typing state
      if (!/^#?[0-9A-Fa-f]{0,6}$/.test(value)) return;

      // Auto-fix: ensure it starts with #
      if (value && !value.startsWith("#")) {
        newVariants[index][field] = "#" + value;
      }
    } else {
      newVariants[index][field] = value;
    }

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

  const addVariant = () => setVariants([
    ...variants,
    {
      baseColorName: "",
      colorName: "",
      colorCode: "#000000",
      images: [],
      imageFiles: [],
      sizes: [{ capacity: "500ml", price: "", compareAtPrice: "", stock: 0 }]
    }
  ]);


  const removeVariant = (index) => {
    if (variants.length > 1) setVariants(variants.filter((_, i) => i !== index));
  };

  const handleSizeChange = (vIdx, sIdx, field, value) => {
    const newVariants = [...variants];
    newVariants[vIdx].sizes[sIdx][field] = value;
    setVariants(newVariants);
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
          baseColorName: v.baseColorName,
          colorName: v.colorName,
          colorCode: v.colorCode,
          images: [...existingUrls, ...newUploads],
          // Map the nested sizes
          sizes: v.sizes.map(s => ({
            capacity: s.capacity,
            price: parseFloat(s.price) || 0,
            compareAtPrice: s.compareAtPrice
              ? parseFloat(s.compareAtPrice)
              : undefined,
            stock: parseInt(s.stock) || 0
          }))
        };
      }));
      setProgress(80);

      const allPrices = processedVariants.flatMap(v =>
        v.sizes
          .map(s => s.price)
          .filter(price => typeof price === "number" && price > 0)
      );

      if (allPrices.length === 0) {
        alert("Please enter at least one valid price");
        setLoading(false);
        return;
      }

      const cheapestPrice = allPrices.length
        ? Math.min(...allPrices)
        : 0;

      setUploadStep("Saving product...");
      const finalPayload = {
        ...form,
        specifications: form.specifications,
        customizationOptions: form.customizationOptions,
        isCustomizable: form.isCustomizable,

        price: cheapestPrice, // Automatic "Starting at" price
        thumbnail: finalThumbnailUrl,
        variants: processedVariants,
        compareAtPrice: form.compareAtPrice
          ? Number(form.compareAtPrice)
          : undefined,
        tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
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
      } else {
        const errorData = await res.json();
        console.log(errorData);
        alert(errorData.message || "Server Error");
      }
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
            <h3>Specifications</h3>

            {/* BASIC */}
            <h4>Basic</h4>
            <div className="form-grid-2">
              <input placeholder="Type (Bottle/Mug)"
                value={form.specifications.type}
                onChange={(e) => setForm({
                  ...form,
                  specifications: { ...form.specifications, type: e.target.value }
                })}
              />

              <input placeholder="Material"
                value={form.specifications.material}
                onChange={(e) => setForm({
                  ...form,
                  specifications: { ...form.specifications, material: e.target.value }
                })}
              />

              <input placeholder="Weight"
                value={form.specifications.weight}
                onChange={(e) => setForm({
                  ...form,
                  specifications: { ...form.specifications, weight: e.target.value }
                })}
              />

              <input placeholder="Dimensions"
                value={form.specifications.dimensions}
                onChange={(e) => setForm({
                  ...form,
                  specifications: { ...form.specifications, dimensions: e.target.value }
                })}
              />
            </div>

            {/* PERFORMANCE */}
            <h4>Performance</h4>
            <div className="form-grid-2">
              <input placeholder="Insulation"
                value={form.specifications.insulation}
                onChange={(e) => setForm({
                  ...form,
                  specifications: { ...form.specifications, insulation: e.target.value }
                })}
              />

              <input placeholder="Hot Retention"
                value={form.specifications.hotRetention}
                onChange={(e) => setForm({
                  ...form,
                  specifications: { ...form.specifications, hotRetention: e.target.value }
                })}
              />

              <input placeholder="Cold Retention"
                value={form.specifications.coldRetention}
                onChange={(e) => setForm({
                  ...form,
                  specifications: { ...form.specifications, coldRetention: e.target.value }
                })}
              />
            </div>

            {/* BOOLEAN FEATURES */}
            <div className="checkbox-grid">
              {["leakproof", "condensationFree", "rustProof"].map((field) => (
                <label key={field}>
                  <input
                    type="checkbox"
                    checked={form.specifications[field]}
                    onChange={(e) => setForm({
                      ...form,
                      specifications: {
                        ...form.specifications,
                        [field]: e.target.checked
                      }
                    })}
                  />
                  {field}
                </label>
              ))}
            </div>

            {/* USAGE */}
            <h4>Usage</h4>
            <input
              placeholder="Suitable For (comma separated)"
              onChange={(e) =>
                setForm({
                  ...form,
                  specifications: {
                    ...form.specifications,
                    suitableFor: e.target.value.split(",").map(s => s.trim())
                  }
                })
              }
            />
          </div>

          <div className="editor-card">
            <h3>Customization</h3>

            <div className="form-group">
              <label>
                <input
                  type="checkbox"
                  checked={form.isCustomizable}
                  onChange={(e) => setForm({ ...form, isCustomizable: e.target.checked })}
                />
                Enable Customization
              </label>
            </div>

            {form.isCustomizable && (
              <>
                <div className="form-group">
                  <label>Engraving Price</label>
                  <input
                    type="number"
                    value={form.customizationOptions.price}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customizationOptions: {
                          ...form.customizationOptions,
                          price: Number(e.target.value)
                        }
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Max Characters</label>
                  <input
                    type="number"
                    value={form.customizationOptions.maxChars}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customizationOptions: {
                          ...form.customizationOptions,
                          maxChars: Number(e.target.value)
                        }
                      })
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Fonts (comma separated)</label>
                  <input
                    onChange={(e) =>
                      setForm({
                        ...form,
                        customizationOptions: {
                          ...form.customizationOptions,
                          allowedFonts: e.target.value.split(",").map(f => f.trim())
                        }
                      })
                    }
                  />
                </div>
              </>
            )}
          </div>

          <div className="editor-card">
            <div className="flex-header">
              <h3>Variants (Color & Size)</h3>
            </div>
            {variants.map((v, vIdx) => (
              <div key={vIdx} className="variant-block" style={{ border: '1px solid #eee', padding: '15px', borderRadius: '10px', marginBottom: '15px' }}>
                <div className="variant-inputs" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div className="form-group">
                    <label>Base Color Name</label>
                    <input type="text" value={v.baseColorName} onChange={(e) => handleVariantInfoChange(vIdx, "baseColorName", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Color Name</label>
                    <input type="text" value={v.colorName} onChange={(e) => handleVariantInfoChange(vIdx, "colorName", e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Swatch Code</label>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <input type="color" value={v.colorCode} onChange={(e) => handleVariantInfoChange(vIdx, "colorCode", e.target.value)} />
                      <input type="text" value={v.colorCode} onChange={(e) => handleVariantInfoChange(vIdx, "colorCode", e.target.value)} />
                    </div>
                  </div>
                </div>

                <div className="sizes-section" style={{ background: '#f9f9f9', padding: '15px', borderRadius: '8px' }}>
                  <h4 style={{ marginBottom: '10px' }}>Pricing & Capacity per Size</h4>
                  {v.sizes.map((s, sIdx) => (
                    <div key={sIdx} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 40px', gap: '10px', alignItems: 'flex-end', marginBottom: '10px' }}>
                      <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Capacity</label>
                        <input type="text" placeholder="500ml" value={s.capacity} onChange={(e) => handleSizeChange(vIdx, sIdx, "capacity", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Strike Price</label>
                        <input type="number" placeholder="1500" value={s.compareAtPrice} onChange={(e) => handleSizeChange(vIdx, sIdx, "compareAtPrice", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Sale Price</label>
                        <input type="number" placeholder="1200" value={s.price} onChange={(e) => handleSizeChange(vIdx, sIdx, "price", e.target.value)} />
                      </div>
                      <div className="form-group">
                        <label style={{ fontSize: '12px' }}>Stock</label>
                        <input type="number" value={s.stock} onChange={(e) => handleSizeChange(vIdx, sIdx, "stock", e.target.value)} />
                      </div>
                      <button type="button" onClick={() => removeSize(vIdx, sIdx)} style={{ background: 'none', border: 'none', color: 'red', cursor: 'pointer' }}>×</button>
                    </div>
                  ))}
                  <button type="button" onClick={() => addSize(vIdx)} style={{ fontSize: '12px', color: '#007bff', background: 'none', border: 'none', cursor: 'pointer' }}>+ Add another size for this color</button>
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
            <button type="button" className="add-var-btn" onClick={addVariant}>+ Add Variant</button>
          </div>
        </div>

        <div className="editor-right">

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