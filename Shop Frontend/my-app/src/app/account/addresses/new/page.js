"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

// Full list of Indian States and UTs
const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function AddAddressPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    number: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    landmark: "",
    isDefault: false,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/add-address`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        router.push("/account/addresses");
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to save address");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="account-layout-container">
      {/* SIDEBAR - Consistent desktop alignment */}
      <aside className="account-sidebar">
        <nav className="sidebar-nav">
          <button onClick={() => router.push('/account')} className="nav-item">👤 Profile Info</button>
          <button onClick={() => router.push('/account/orders')} className="nav-item">📦 My Orders</button>
          <button onClick={() => router.push('/account/address')} className="nav-item active">📍 Addresses</button>
          <button onClick={() => router.push('/account/security')} className="nav-item">🔒 Security</button>
        </nav>
      </aside>

      <main className="account-main-content">
        <div className="content-header">
          <button className="back-link" onClick={() => router.back()}>← Back to Addresses</button>
          <h1>Add New Address</h1>
        </div>

        <div className="info-card">
          <form onSubmit={handleSubmit} className="address-form">
            <div className="form-row">
              <div className="form-group">
                <label>Receiver's Name*</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Full Name" />
              </div>
              <div className="form-group">
                <label>Contact Number*</label>
                <input type="tel" required value={form.number} onChange={(e) => setForm({...form, number: e.target.value})} placeholder="10-digit mobile number" />
              </div>
            </div>

            <div className="form-group">
              <label>Flat, House no., Building, Street*</label>
              <input type="text" required value={form.street} onChange={(e) => setForm({...form, street: e.target.value})} placeholder="House No. 123, ABC Street" />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Town/City*</label>
                <input type="text" required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} />
              </div>
              <div className="form-group">
                <label>State*</label>
                <select required value={form.state} onChange={(e) => setForm({...form, state: e.target.value})}>
                  <option value="" disabled>Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pincode / Zip*</label>
                <input type="text" required value={form.zip} onChange={(e) => setForm({...form, zip: e.target.value})} placeholder="6-digit code" />
              </div>
              <div className="form-group">
                <label>Landmark (Optional)</label>
                <input type="text" value={form.landmark} onChange={(e) => setForm({...form, landmark: e.target.value})} placeholder="E.g. Near Apollo Hospital" />
              </div>
            </div>

            <div className="default-toggle-row">
              <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={(e) => setForm({...form, isDefault: e.target.checked})} />
              <label htmlFor="isDefault">Make this my default shipping address</label>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "Saving Address..." : "Save Address"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}