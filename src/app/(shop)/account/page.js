"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AccountSidebar from "@/app/components/AccountSidebar";

export default function MyProfilePage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [form, setForm] = useState({ name: "", phone: "" });

  // 1. Handle Mounting and Title
  useEffect(() => {
    setMounted(true);
    // Setting the title here ensures it changes once the component loads
    document.title = "My Profile | BouncyBucket";
  }, []);

  // 2. Authentication and Profile Fetching
  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: {
            'Authorization': `JWT ${token}`,
            'Content-Type': 'application/json'
          },
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Unauthorized");

        setUser(data.user);
        setForm({
          name: data.user.name || "",
          phone: data.user.phone || ""
        });
      } catch (err) {
        localStorage.removeItem("token");
        localStorage.removeItem("bottle_user");
        router.replace("/login");
      }
    };

    fetchProfile();
  }, [mounted, router]);

  const handleSave = async () => {
    setLoading(true);
    setMessage({ text: "", type: "" });
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/update-profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `JWT ${token}`
        },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setUser(data.user);
      setEditing(false);
      setMessage({ text: "Profile updated successfully ✔", type: "success" });

      localStorage.setItem("bottle_user", JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent("bottle_auth_changed"));

    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Prevent rendering until mounted to avoid hydration mismatch
  if (!mounted || !user) {
    return (
      <div className="profile-loading-container">
        <div className="spinner"></div>
        <p>Verifying session...</p>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* FIX: REMOVED <head> tag from here. 
         SEO is handled by public/robots.txt 
         Title is handled by document.title in useEffect
      */}
      
      <AccountSidebar active="profile" />

      <main className="profile-content">
        <header className="content-header">
          <h1>Account Settings</h1>
          <p>Update your personal details and manage your account</p>
        </header>

        {message.text && (
          <div className={`alert-msg ${message.type}`} role="alert">
            {message.text}
          </div>
        )}

        <section className="info-card">
          <div className="account-card-top">
            <div className="title-group">
              <h2>Personal Information</h2>
              <div className="title-accent"></div>
            </div>

            {!editing ? (
              <button className="edit-trigger" onClick={() => setEditing(true)}>
                ✎ Edit Profile
              </button>
            ) : (
              <div className="edit-actions">
                <button className="cancel-btn" onClick={() => setEditing(false)} disabled={loading}>
                  Cancel
                </button>
                <button className="save-btn" onClick={handleSave} disabled={loading}>
                  {loading ? <span className="loader"></span> : "Save Changes"}
                </button>
              </div>
            )}
          </div>

          <form className="form-grid" onSubmit={(e) => e.preventDefault()}>
            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                value={form.name}
                disabled={!editing}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Enter your name"
              />
            </div>

            <div className="form-group">
              <label>Email Address</label>
              <input type="email" value={user.email} disabled className="disabled-input" />
              <small className="input-hint">Email cannot be changed.</small>
            </div>

            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                id="phone"
                type="tel"
                value={form.phone}
                disabled={!editing}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="Not provided"
              />
            </div>

            <div className="form-group">
              <label>Member Since</label>
              <div className="static-field">
                {new Date(user.createdAt).toLocaleDateString('en-IN', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            </div>
          </form>
        </section>

        <section className="info-card security-card">
          <div className="security-info">
            <h3>Password & Security</h3>
            <p>Update your password or enable two-factor authentication.</p>
          </div>
          <button className="outline-btn" onClick={() => router.push("/account/security")}>
            Manage Security
          </button>
        </section>
      </main>
    </div>
  );
}