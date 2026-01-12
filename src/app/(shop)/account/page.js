// src/app/account/page.js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AccountSidebar from "@/app/components/AccountSidebar";

export default function MyProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [form, setForm] = useState({ name: "", phone: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      console.log("No token found, redirecting...");
      router.replace("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          method: 'GET',
          headers: {
            // FIX: Try 'Bearer' instead of 'JWT' if your backend uses standard JWT strategy
            'Authorization': `JWT ${token}`,
            'Content-Type': 'application/json'
          },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Session expired");
        }

        setUser(data.user);
        setForm({
          name: data.user.name || "",
          phone: data.user.phone || ""
        });
      } catch (err) {
        console.error("Profile fetch error:", err.message);
        // Only remove token if the error is actually an auth failure
        if (err.message.includes("Unauthorized") || err.message.includes("Session")) {
          localStorage.removeItem("token");
          localStorage.removeItem("bottle_user");
          router.replace("/login");
        }
      }
    };

    fetchProfile();
  }, [router]);

  const handleSave = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `JWT ${token}` // FIX: Matches the fetchProfile header
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setUser(data.user);
      setEditing(false);
      setMessage({ text: "Profile updated successfully ✔", type: "success" });

      // Sync with global user state
      localStorage.setItem("bottle_user", JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent("bottle_auth_changed"));

    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="profile-loading">Loading your profile...</div>;

  return (
    <div className="profile-container">
      {/* Sidebar Navigation (Desktop) */}
      <AccountSidebar />

      {/* Main Content */}
      <main className="profile-content">
        <div className="content-header">
          <h1>Account Settings</h1>
          <p>Update your personal details and manage your account</p>
        </div>

        {message.text && (
          <div className={`alert-msg ${message.type}`}>{message.text}</div>
        )}

        {/* Info Card */}
        <div className="info-card">

          <div className="account-card-top">
            <div className="title-group">
              <h2>Personal Information</h2>
              <div className="title-accent"></div>
            </div>

            {!editing ? (
              <button className="edit-trigger" onClick={() => setEditing(true)}>
                <span className="icon">✎</span> Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="cancel-btn" onClick={() => setEditing(false)}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSave} disabled={loading}>
                  {loading ? (
                    <div className="spinner"></div>
                  ) : (
                    <>
                      <span className="icon">✓</span> Save Changes
                    </>
                  )}
                </button>
              </div>
            )}
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="name"
                value={form.name}
                disabled={!editing}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={user.email} disabled className="disabled-input" />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                disabled={!editing}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Not provided"
              />
            </div>
            <div className="form-group">
              <label>Member Since</label>
              <input type="text" value={new Date(user.createdAt).toLocaleDateString()} disabled className="disabled-input" />
            </div>
          </div>
        </div>

        {/* Security Quick Link */}
        <div className="info-card security-card">
          <div className="security-info">
            <h3>Password & Security</h3>
            <p>Keep your account safe by updating your password regularly.</p>
          </div>
          <button className="outline-btn" onClick={() => router.push("/account/security")}>
            Manage Security
          </button>
        </div>
      </main>
    </div>
  );
}