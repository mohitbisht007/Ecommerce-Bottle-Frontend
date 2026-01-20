"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { Mail, Lock, User, Eye, EyeOff, ArrowRight } from "lucide-react";

export default function AuthPage({ isLogin = false }) {
  const router = useRouter();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/google-login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Google login failed");

      localStorage.setItem("token", data.token);
      localStorage.setItem("bottle_user", JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent("bottle_auth_changed", { detail: { user: data.user } }));
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/${isLogin ? "login" : "register"}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(isLogin ? { email: form.email, password: form.password } : form),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");

      localStorage.setItem("token", data.token);
      localStorage.setItem("bottle_user", JSON.stringify(data.user));
      window.dispatchEvent(new CustomEvent("bottle_auth_changed", { detail: { user: data.user } }));
      router.push("/");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="874365563204-oisqt15mvfmb8bb4cpcik1om0kp1gb31.apps.googleusercontent.com">
      <div className="premium-auth-wrapper">
        <div className="auth-inner-card">
          
          {/* FORM SECTION */}
          <div className="auth-main">
            <div className="auth-header">
              <h2 className="brand-accent">BOUNCY BUCKET</h2>
              <h1>{isLogin ? "Welcome Back" : "Create Account"}</h1>
              <p>{isLogin ? "Please enter your details to sign in" : "Join our community of elite hydration"}</p>
            </div>

            <div className="google-auth-container">
              {mounted && (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError("Google Login Failed")}
                  theme="filled_blue"
                  shape="pill"
                  text={isLogin ? "signin_with" : "signup_with"}
                  width="100%"
                />
              )}
            </div>

            <div className="divider-text">
              <span>OR CONTINUE WITH EMAIL</span>
            </div>

            <form onSubmit={handleSubmit} className="auth-form-fields">
              {!isLogin && (
                <div className="premium-input-group">
                  <label>Full Name</label>
                  <div className="input-field-wrapper">
                    <User className="input-icon" size={18} />
                    <input type="text" name="name" placeholder="Adam Smith" required onChange={handleChange} />
                  </div>
                </div>
              )}

              <div className="premium-input-group">
                <label>Email Address</label>
                <div className="input-field-wrapper">
                  <Mail className="input-icon" size={18} />
                  <input type="email" name="email" placeholder="example@mail.com" required onChange={handleChange} />
                </div>
              </div>

              <div className="premium-input-group">
                <label>Password</label>
                <div className="input-field-wrapper">
                  <Lock className="input-icon" size={18} />
                  <input type={showPass ? "text" : "password"} name="password" placeholder="••••••••" required onChange={handleChange} />
                  <button type="button" className="pass-toggle-btn" onClick={() => setShowPass(!showPass)}>
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {error && <div className="auth-error-msg">{error}</div>}

              <button type="submit" className="premium-submit-btn" disabled={loading}>
                {loading ? "Processing..." : isLogin ? "Sign In" : "Create Account"}
                {!loading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="auth-footer-link">
              {isLogin ? "New to Bouncy Bucket?" : "Already a member?"}
              <Link href={isLogin ? "/signup" : "/login"}>
                {isLogin ? " Join Now" : " Log In"}
              </Link>
            </div>
          </div>

          {/* VISUAL SECTION (Desktop Only) */}
          <div className="auth-visual">
            <div className="visual-overlay"></div>
            <div className="visual-content-box">
              <span className="visual-tag">Luxury Hydration</span>
              <h2>Purity in Every Drop.</h2>
              <p>Experience the intersection of high-performance materials and sustainable luxury.</p>
              
              <div className="visual-feature-card">
                <div className="feature-icon">✨</div>
                <div>
                  <h4>Lifetime Warranty</h4>
                  <p>Quality that lasts generations.</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </GoogleOAuthProvider>
  );
}