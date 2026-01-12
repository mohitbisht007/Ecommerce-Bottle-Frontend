"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function EditAddressPage() {
  const router = useRouter();
  const params = useParams(); // Gets the :id from the URL
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  const [form, setForm] = useState({
    name: "", number: "", street: "", city: "", state: "", zip: "", landmark: "", isDefault: false,
  });

  // 1. Fetch current address data to pre-fill form
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.replace("/login"); return; }

    const fetchCurrentAddress = async () => {
      try {
        const res = await fetch(`http://localhost:8080/api/me`, {
          headers: { Authorization: `JWT ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          // Find the specific address from the user's array
          const target = data.user.addresses.find(a => a._id === params.id);
          if (target) {
            setForm({
              name: target.name,
              number: target.number,
              street: target.street,
              city: target.city,
              state: target.state,
              zip: target.zip,
              landmark: target.landmark || "",
              isDefault: target.isDefault,
            });
          } else {
            router.push("/account/addresses");
          }
        }
      } catch (err) {
        console.error("Error fetching address details");
      } finally {
        setFetching(false);
      }
    };
    fetchCurrentAddress();
  }, [params.id, router]);

  // 2. Handle Submit (PUT request)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8080/api/edit-address/${params.id}`, {
        method: "PUT",
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
        alert(errorData.message || "Failed to update address");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-state">Loading address details...</div>;

  return (
    <div className="account-layout-container">
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
          <button className="back-link" onClick={() => router.back()}>← Cancel Editing</button>
          <h1>Edit Address</h1>
        </div>

        <div className="info-card">
          <form onSubmit={handleSubmit} className="address-form">
            <div className="form-row">
              <div className="form-group">
                <label>Receiver's Name*</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Contact Number*</label>
                <input type="tel" required value={form.number} onChange={(e) => setForm({...form, number: e.target.value})} />
              </div>
            </div>

            <div className="form-group">
              <label>Street Address*</label>
              <input type="text" required value={form.street} onChange={(e) => setForm({...form, street: e.target.value})} />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Town/City*</label>
                <input type="text" required value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} />
              </div>
              <div className="form-group">
                <label>State*</label>
                <select required value={form.state} onChange={(e) => setForm({...form, state: e.target.value})}>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Pincode*</label>
                <input type="text" required value={form.zip} onChange={(e) => setForm({...form, zip: e.target.value})} />
              </div>
              <div className="form-group">
                <label>Landmark</label>
                <input type="text" value={form.landmark} onChange={(e) => setForm({...form, landmark: e.target.value})} />
              </div>
            </div>

            <div className="default-toggle-row">
              <input type="checkbox" id="isDefault" checked={form.isDefault} onChange={(e) => setForm({...form, isDefault: e.target.checked})} />
              <label htmlFor="isDefault">Default Address</label>
            </div>

            <div className="form-actions">
              <button type="submit" className="save-btn" disabled={loading}>
                {loading ? "Updating..." : "Update Address"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}