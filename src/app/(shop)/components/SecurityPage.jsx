"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AccountSidebar from "@/app/components/AccountSidebar";

export default function SecurityPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [form, setForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Mount + auth guard
  useEffect(() => {
    setMounted(true);

    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    if (form.newPassword !== form.confirmPassword) {
      return setMessage({
        text: "New passwords do not match!",
        type: "error",
      });
    }

    setLoading(true);
    setMessage({ text: "", type: "" });

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/update-password`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${token}`,
          },
          body: JSON.stringify({
            currentPassword: form.currentPassword,
            newPassword: form.newPassword,
          }),
        }
      );

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Non-JSON response");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Update failed");

      setMessage({
        text: "Password updated successfully! Redirecting…",
        type: "success",
      });

      setForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setTimeout(() => router.push("/account"), 2000);
    } catch (err) {
      setMessage({ text: err.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <div className="profile-container">
      <AccountSidebar active="security" />

      <main className="profile-content">
        <div className="content-header">
          <h1>Security Settings</h1>
          <p>Manage your password and protect your account.</p>
        </div>

        <div className="security-health-card">
          <div className="health-info">
            <span className="shield-icon">🛡️</span>
            <div>
              <h3>Account Security: Strong</h3>
              <p>Your account is protected with a secure password.</p>
            </div>
          </div>
        </div>

        {message.text && (
          <div className={`alert-msg ${message.type}`}>
            {message.text}
          </div>
        )}

        <div className="info-card">
          <form
            onSubmit={handleUpdatePassword}
            className="security-form"
          >
            <div className="form-group">
              <label>Current Password</label>
              <input
                type="password"
                required
                value={form.currentPassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    currentPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="divider-line" />

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                required
                value={form.newPassword}
                onChange={(e) =>
                  setForm({ ...form, newPassword: e.target.value })
                }
              />
            </div>

            <div className="form-group">
              <label>Confirm New Password</label>
              <input
                type="password"
                required
                value={form.confirmPassword}
                onChange={(e) =>
                  setForm({
                    ...form,
                    confirmPassword: e.target.value,
                  })
                }
              />
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={loading}
              >
                {loading ? "Updating…" : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
