"use client";
import { useState, useEffect } from "react";

const StarRating = ({ rating, setRating, interactive = false }) => {
    const [hover, setHover] = useState(0);
    return (
        <div className="star-rating-container">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    viewBox="0 0 24 24"
                    className={`star-svg ${star <= (hover || rating) ? "filled" : ""}`}
                    onClick={() => interactive && setRating(star)}
                    onMouseEnter={() => interactive && setHover(star)}
                    onMouseLeave={() => interactive && setHover(0)}
                >
                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
            ))}
        </div>
    );
};

export default function ReviewSection({ productId, productRating, totalReviews }) {
    const [reviews, setReviews] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedImg, setSelectedImg] = useState(null); // State for the Modal

    const [formData, setFormData] = useState({ name: "", rating: 5, comment: "" });
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [previews, setPreviews] = useState([]);

    const fetchReviews = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/${productId}`);
            const data = await res.json();
            setReviews(data);
        } catch (err) {
            console.error("Failed to fetch reviews", err);
        }
    };

    useEffect(() => { fetchReviews(); }, [productId]);

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setSelectedFiles((prev) => [...prev, ...files]);
        const newPreviews = files.map((file) => URL.createObjectURL(file));
        setPreviews((prev) => [...prev, ...newPreviews]);
    };

    const removePreview = (index) => {
        setSelectedFiles(selectedFiles.filter((_, i) => i !== index));
        setPreviews(previews.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const uploadedImageUrls = [];
            for (const file of selectedFiles) {
                const data = new FormData();
                data.append("file", file);
                data.append("upload_preset", "Product Images");
                data.append("cloud_name", "da1m7gtvf");
                const cloudRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`, { method: "POST", body: data });
                const cloudData = await cloudRes.json();
                if (cloudData.secure_url) uploadedImageUrls.push(cloudData.secure_url);
            }

            const token = localStorage.getItem("token");
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `JWT ${token}` },
                body: JSON.stringify({ ...formData, productId, images: uploadedImageUrls })
            });

            if (res.ok) {
                setShowForm(false);
                setFormData({ name: "", rating: 5, comment: "" });
                setSelectedFiles([]);
                setPreviews([]);
                fetchReviews();
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="reviews-container">
            {/* Modal for viewing images */}
            {selectedImg && (
                <div className="image-modal-overlay" onClick={() => setSelectedImg(null)}>
                    <div className="image-modal-content">
                        <img src={selectedImg} alt="Review Full" />
                        <button className="close-modal">×</button>
                    </div>
                </div>
            )}

            <div className="reviews-header">
                <div className="rating-summary">
                    <h2>Customer Reviews</h2>
                    <div className="big-rating-flex">
                        <span className="avg-num">{productRating || 0}</span>
                        <div className="stars-col">
                            <StarRating rating={Math.round(productRating || 0)} />
                            <p>Based on {totalReviews || 0} reviews</p>
                        </div>
                    </div>
                </div>
                <button className="write-review-btn" onClick={() => setShowForm(!showForm)}>
                    {showForm ? "Cancel" : "Write a Review"}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="review-form active">
                    <div className="form-row" style={{ marginBottom: '20px' }}>
                        <label>Your Rating</label>
                        <StarRating rating={formData.rating} setRating={(val) => setFormData({ ...formData, rating: val })} interactive={true} />
                    </div>
                    <input type="text" placeholder="Your Name" required className="review-input" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                    <textarea placeholder="Share your experience..." required className="review-textarea" value={formData.comment} onChange={(e) => setFormData({ ...formData, comment: e.target.value })} />
                    
                    <div className="photo-upload-wrapper">
                        <label className="photo-label">Add Photos</label>
                        <div className="photo-grid">
                            {previews.map((src, i) => (
                                <div key={i} className="review-preview-img">
                                    <img src={src} alt="preview" />
                                    <button type="button" onClick={() => removePreview(i)}>×</button>
                                </div>
                            ))}
                            <label className="add-photo-square">
                                <input type="file" multiple hidden onChange={handleFileChange} accept="image/*" />
                                <span>+</span>
                            </label>
                        </div>
                    </div>
                    <button type="submit" className="submit-review" disabled={loading}>{loading ? "Posting..." : "Submit Review"}</button>
                </form>
            )}

            <div className="reviews-list">
                {reviews.map((r, i) => (
                    <div key={i} className="review-item">
                        <div className="ri-header">
                            <StarRating rating={r.rating} />
                            <span className="ri-date">{new Date(r.createdAt).toLocaleDateString()}</span>
                        </div>
                        <h4 className="ri-name">{r.name} <span className="v-badge">✓ Verified Buyer</span></h4>
                        <p className="ri-comment">{r.comment}</p>
                        
                        {r.images && r.images.length > 0 && (
                            <div className="ri-image-gallery">
                                {r.images.map((img, idx) => (
                                    <div key={idx} className="ri-thumb-wrapper" onClick={() => setSelectedImg(img)}>
                                        <img src={img} alt="review" />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}