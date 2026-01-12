"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AccountSidebar from "@/app/components/AccountSidebar";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

export default function AddressFormPage() {
  const router = useRouter();
  const params = useParams(); 
  const isEdit = !!params.id; // If ID exists in URL, we are in Edit mode

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);
  
  const [form, setForm] = useState({
    name: "",
    email: "", // Added Email
    number: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    landmark: "",
    isDefault: false,
  });

  // 1. Fetch data ONLY if in Edit Mode
  useEffect(() => {
    if (!isEdit) return;

    const fetchCurrentAddress = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `JWT ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          const target = data.user.addresses.find(a => a._id === params.id);
          if (target) {
            setForm({
              name: target.name,
              email: target.email || "", 
              number: target.number,
              street: target.street,
              city: target.city,
              state: target.state,
              zip: target.zip,
              landmark: target.landmark || "",
              isDefault: target.isDefault,
            });
          }
        }
      } catch (err) {
        console.error("Error fetching address details");
      } finally {
        setFetching(false);
      }
    };
    fetchCurrentAddress();
  }, [params.id, isEdit]);

  // 2. Unified Submit Handler (POST for New, PUT for Edit)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const endpoint = isEdit 
      ? `${process.env.NEXT_PUBLIC_API_URL}/edit-address/${params.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/add-address`;
    
    const method = isEdit ? "PUT" : "POST";

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(endpoint, {
        method: method,
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
      alert("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return <div className="loading-state">Loading details...</div>;

  return (
    <div className="account-layout-container">
      <AccountSidebar />

      <main className="account-main-content">
        <div className="content-header">
          <button className="back-link" onClick={() => router.back()}>
            ← {isEdit ? "Cancel Editing" : "Back to Addresses"}
          </button>
          <h1>{isEdit ? "Edit Address" : "Add New Address"}</h1>
        </div>

        <div className="info-card">
          <form onSubmit={handleSubmit} className="address-form">
            
            {/* NAME & EMAIL ROW */}
            <div className="form-row">
              <div className="form-group">
                <label>Receiver's Name*</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} placeholder="Full Name" />
              </div>
              <div className="form-group">
                <label>Email Address*</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} placeholder="email@example.com" />
              </div>
            </div>

            {/* PHONE & STREET */}
            <div className="form-row">
              <div className="form-group">
                <label>Contact Number*</label>
                <input type="tel" required pattern="[0-9]{10}" title="Please enter a 10-digit mobile number" value={form.number} onChange={(e) => setForm({...form, number: e.target.value})} placeholder="10-digit mobile number" />
              </div>
              <div className="form-group">
                <label>Flat, House no., Street*</label>
                <input type="text" required value={form.street} onChange={(e) => setForm({...form, street: e.target.value})} placeholder="House No. 123, ABC Street" />
              </div>
            </div>

            {/* CITY & STATE */}
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

            {/* ZIP & LANDMARK */}
            <div className="form-row">
              <div className="form-group">
                <label>Pincode / Zip*</label>
                <input type="text" required pattern="[0-9]{6}" title="Please enter a 6-digit pincode" value={form.zip} onChange={(e) => setForm({...form, zip: e.target.value})} placeholder="6-digit code" />
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
                {loading ? "Processing..." : isEdit ? "Update Address" : "Save Address"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}