"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ShieldAlert, Lock, Mail, Loader2 } from "lucide-react";
import axios from "axios";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  // CHECK IF ALREADY LOGGED IN
  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    const token = localStorage.getItem("adminToken");

    if (isAdmin === "true" && token) {
      router.push("/admin/orders");
    }
  }, [router]);

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/login`, {
        email,
        password,
      });

      const { user, token } = response.data;

      if (user.role !== "admin") {
        setError("ACCESS DENIED: Administrative privileges required.");
        setLoading(false);
        return;
      }

      // 1. ADMIN KEYS (For dashboard protection)
      localStorage.setItem("adminToken", token);
      localStorage.setItem("isAdmin", "true");

      // 2. SHOP KEYS (So the shop UI recognizes you)
      // Use the SAME keys as your Shop AuthPage
      localStorage.setItem("token", token);
      localStorage.setItem("bottle_user", JSON.stringify(user));

      // 3. Trigger the event so the Navbar updates immediately
      window.dispatchEvent(new CustomEvent("bottle_auth_changed", { detail: { user } }));

      router.push("/admin/orders");
    } catch (err) {
      // Improved error message for CORS/Network issues
      if (!err.response) {
        setError("Network Error: Backend not reachable.");
      } else {
        setError(err.response?.data?.message || "Invalid credentials");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-page-root">
      <div className="admin-login-card">
        <div className="admin-brand">
          <div className="shield-bg">
            <ShieldAlert size={32} />
          </div>
          <h1>Admin Portal</h1>
          <p>Bouncy Bucket Control Center</p>
        </div>

        {error && <div className="admin-error-msg">{error}</div>}

        <form onSubmit={handleAdminLogin} className="admin-form">
          <div className="admin-input-group">
            <Mail size={18} />
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="admin-input-group">
            <Lock size={18} />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="admin-enter-btn" disabled={loading}>
            {loading ? <Loader2 className="spin" /> : "Verify Identity"}
          </button>
        </form>
      </div>
    </div>
  );
}