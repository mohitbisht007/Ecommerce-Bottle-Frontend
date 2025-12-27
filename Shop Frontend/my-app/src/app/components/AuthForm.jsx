'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AuthPage({ isLogin = false }) {
  const router = useRouter();

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:8080/api/${isLogin ? 'login' : 'register'}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(
            isLogin
              ? { email: form.email, password: form.password }
              : form
          )
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Something went wrong');
      }

      // store auth
      localStorage.setItem('token', data.token);
      localStorage.setItem('bottle_user', JSON.stringify(data.user));

      // notify app (header, etc.)
      window.dispatchEvent(
        new CustomEvent('bottle_auth_changed', { detail: { user: data.user } })
      );

      // redirect to home
      router.push('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">

        {/* LEFT SIDE: FORM */}
        <div className="auth-form-section">
          <div className="form-header">
            <div className="auth-logo">
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                <rect width="40" height="40" rx="10" fill="#7C3AED" />
                <path d="M12 20C15 14 25 14 28 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </div>
            <h1>{isLogin ? 'Welcome Back' : 'Sign up for an account'}</h1>
            <p>Enter your details to {isLogin ? 'Log in' : 'Sign up'}.</p>
          </div>

          <div className="social-auth">
            <button className="social-btn"><img src="/apple.svg" alt="Apple" /></button>
            <button className="social-btn"><img src="/google.svg" alt="Google" /></button>
            <button className="social-btn"><img src="/linkedin.svg" alt="LinkedIn" /></button>
          </div>

          <div className="separator"><span>OR</span></div>

          <form className="auth-fields" onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="input-group">
                <label>Full Name*</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Adam Smith"
                  required
                  onChange={handleChange}
                />
              </div>
            )}

            <div className="input-group">
              <label>Email*</label>
              <div className="input-with-icon">
                <span className="icon">✉</span>
                <input
                  type="email"
                  name="email"
                  placeholder="example@mail.com"
                  required
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="input-group">
              <label>{isLogin ? 'Password*' : 'New Password*'}</label>
              <div className="input-with-icon">
                <span className="icon">🔒</span>
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  required
                  onChange={handleChange}
                />
                <button
                  type="button"
                  className="toggle-pass"
                  onClick={() => setShowPass(!showPass)}
                >
                  {showPass ? '👁️' : '🙈'}
                </button>
              </div>
            </div>

            {error && <p className="form-error">{error}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Please wait...' : isLogin ? 'Log IN' : 'Sign UP'}
            </button>
          </form>

          <p className="switch-auth">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <Link href={isLogin ? "/signup" : "/login"}>
              {isLogin ? ' Sign up' : ' Log in'}
            </Link>
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-visual-section">
          <div className="visual-content">
            <div className="floating-stats">
              <div className="stat-card">
                <span>Total Sales</span>
                <strong>$205.25k</strong>
                <div className="mini-chart"></div>
              </div>
            </div>
            <div className="hero-text">
              <h2>Your Commerce,<br />Your Control.</h2>
              <p>
                Receive personalized tips and recommendations based on your goals.
                Our insights help you make informed decisions.
              </p>
            </div>
            <div className="bg-circles"></div>
          </div>
        </div>

      </div>
    </div>
  );
}
