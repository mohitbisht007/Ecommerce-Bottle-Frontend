"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// --- Custom Icons ---
const IconHeart = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20.8 8.6c0-2.6-2-4.8-4.6-4.8-1.4 0-2.7.7-3.6 1.8-.9-1.1-2.2-1.8-3.6-1.8-2.6 0-4.6 2.2-4.6 4.8 0 5.2 8.2 8.6 8.2 8.6s8.6-3.4 8.6-8.6z" />
  </svg>
);
const IconCart = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M6 6h15l-1.6 8.1a2 2 0 0 1-2 1.6H9.6a2 2 0 0 1-2-1.6L6 6z" />
    <circle cx="10" cy="19" r="1" fill="currentColor" />
    <circle cx="18" cy="19" r="1" fill="currentColor" />
  </svg>
);
const IconUser = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconSearch = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const IconBurger = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
  >
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

export default function Header() {
  const router = useRouter();
  const [categories, setCategories] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSidebar, setShowSidebar] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories`
        );
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (e) {
        console.error(e);
      }
      const cart = JSON.parse(localStorage.getItem("bottle_cart") || "{}");
      setCartCount(
        (cart.items || []).reduce((s, it) => s + (Number(it.qty) || 0), 0)
      );
      setUser(JSON.parse(localStorage.getItem("bottle_user") || "null"));
    };
    fetchData();
    window.addEventListener("bottle_cart_updated", fetchData);
    window.addEventListener("bottle_auth_changed", fetchData);
    return () => {
      window.removeEventListener("bottle_cart_updated", fetchData);
      window.removeEventListener("bottle_auth_changed", fetchData);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (showSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    // Cleanup to ensure scrolling is restored if component unmounts
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showSidebar]);

  useEffect(() => {
    if (showSearch) setTimeout(() => searchInputRef.current?.focus(), 100);
  }, [showSearch]);

  const handleLogout = () => {
    localStorage.clear();
    setUser(null);
    setShowSidebar(false);
    window.dispatchEvent(new CustomEvent("bottle_auth_changed"));
    router.push("/");
  };

  return (
    <>
      <header
        className={`site-header ${showSearch ? "search-overlay-active" : ""}`}
      >
        <div className="header-container">
          <div className="header-left">
            <Link href="/" className="desktop-logo hide-mobile">
              <Image
                src="/logo2.png" // Path from your public folder
                alt="Bouncy Bucket Logo"
                width={300} // Adjust based on your design
                height={120} // Adjust based on your design
                priority // CRITICAL: Tells Next.js to load this first!
                className="header-logo"
              />
            </Link>
            <button
              className="icon-btn burger-trigger show-mobile"
              onClick={() => setShowSidebar(true)}
            >
              <IconBurger />
            </button>
          </div>

          <div className="header-center">
            <nav className="main-nav hide-mobile">
              <Link href="/shop?sort=newest" className="nav-pill">
                New Arrivals
              </Link>
              {categories.slice(0, 4).map((c) => (
                <Link
                  key={c._id}
                  href={`/shop?category=${c.name}`}
                  className="nav-pill"
                >
                  {c.displayName}
                </Link>
              ))}
            </nav>
            <Link href="/" className="mobile-logo show-mobile">
              <Image
                src="/logo2.png" // Path from your public folder
                alt="Bouncy Bucket Logo"
                width={150} // Adjust based on your design
                height={40} // Adjust based on your design
                priority // CRITICAL: Tells Next.js to load this first!
                className="header-logo"
              />
            </Link>
          </div>

          <div className="header-right">
            <button className="icon-btn" onClick={() => setShowSearch(true)}>
              <IconSearch />
            </button>
            <Link href="/wishlist" className="icon-btn hide-mobile-sm">
              <IconHeart />
            </Link>

            {/* --- UPDATED DESKTOP USER AREA --- */}
            <div className="user-area hide-mobile" ref={userMenuRef}>
              {!user ? (
                <Link href="/login" className="icon-btn">
                  <IconUser />
                </Link>
              ) : (
                <div className="user-pill-wrapper">
                  <button
                    className={`user-pill-trigger ${
                      showUserMenu ? "active" : ""
                    }`}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="user-avatar-mini">
                      {user.name?.charAt(0)}
                    </div>
                    <span className="user-name-text">
                      {user.name?.split(" ")[0]}
                    </span>
                    <svg
                      className="chevron-icon"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                  </button>

                  <div
                    className={`desktop-dropdown ${showUserMenu ? "show" : ""}`}
                  >
                    <div className="dropdown-info">
                      <p className="u-label">Account</p>
                      <p className="u-email">{user.email}</p>
                    </div>
                    <div className="dropdown-divider"></div>
                    <Link
                      href="/account"
                      className="dropdown-link"
                      onClick={() => setShowUserMenu(false)}
                    >
                      👤 Profile
                    </Link>
                    <Link
                      href="/account/orders"
                      className="dropdown-link"
                      onClick={() => setShowUserMenu(false)}
                    >
                      📦 Orders
                    </Link>
                    <Link
                      href="/account/addresses"
                      onClick={() => setShowSidebar(false)}
                      className="dropdown-link"
                    >
                      📍 Address
                    </Link>
                    <div className="dropdown-divider"></div>
                    <button
                      className="dropdown-logout-btn"
                      onClick={handleLogout}
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>

            <Link href="/checkout" className="icon-btn cart-btn">
              <IconCart />
              {cartCount > 0 && <span className="badge">{cartCount}</span>}
            </Link>
          </div>
        </div>

        {/* PREMIUM EXPANDING SEARCH OVERLAY */}
        <div className={`full-search-overlay ${showSearch ? "active" : ""}`}>
          <div className="search-overlay-inner">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                router.push(`/shop?q=${searchQuery}`);
                setShowSearch(false);
              }}
            >
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search for premium bottles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <button
              className="close-search-btn"
              onClick={() => setShowSearch(false)}
            >
              ✕
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE DRAWER (Right to Left) */}
      <div
        className={`drawer-backdrop ${showSidebar ? "active" : ""}`}
        onClick={() => setShowSidebar(false)}
      />
      <aside className={`mobile-drawer ${showSidebar ? "active" : ""}`}>
        <div className="drawer-inner">
          <div className="drawer-header">
            <span className="drawer-title">Navigation</span>
            <button className="close-btn" onClick={() => setShowSidebar(false)}>
              ✕
            </button>
          </div>

          <div className="side-user-card">
            {!user ? (
              /* --- PROFESSIONAL GUEST CARD --- */
              <div className="guest-card">
                <div className="guest-content">
                  <div className="guest-icon-box">
                    <IconUser />
                  </div>
                  <div className="guest-text">
                    <h3>Welcome!</h3>
                    <p>Login to manage your orders & profile</p>
                  </div>
                </div>
                <Link
                  href="/login"
                  className="login-button-primary"
                  onClick={() => setShowSidebar(false)}
                >
                  Login / Sign Up
                </Link>
              </div>
            ) : (
              /* --- PROFESSIONAL USER DASHBOARD --- */
              <div className="user-dashboard-card">
                <div className="user-info-section">
                  <div className="avatar-container">
                    <div className="avatar-circle">{user.name?.charAt(0)}</div>
                    <div className="online-badge"></div>
                  </div>
                  <div className="user-meta">
                    <span className="welcome-tag">Welcome back,</span>
                    <h2 className="user-display-name">
                      {user.name?.split(" ")[0]}
                    </h2>
                    <p className="user-display-email">{user.email}</p>
                  </div>
                </div>

                <div className="account-actions-grid">
                  <Link
                    href="/account"
                    onClick={() => setShowSidebar(false)}
                    className="action-tile"
                  >
                    <span className="tile-icon">👤</span>
                    <span className="tile-text">Profile</span>
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setShowSidebar(false)}
                    className="action-tile"
                  >
                    <span className="tile-icon">📦</span>
                    <span className="tile-text">Orders</span>
                  </Link>
                  <Link
                    href="/account/addresses"
                    onClick={() => setShowSidebar(false)}
                    className="action-tile"
                  >
                    <span className="tile-icon">📍</span>
                    <span className="tile-text">Addresses</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="action-tile logout-tile"
                  >
                    <span className="tile-icon">🚪</span>
                    <span className="tile-text">Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="drawer-navigation-wrapper">
            {/* --- SECTION 1: HERO BANNER --- */}
            <div className="section-label-group">
              <span className="tiny-label">Curated for you</span>
              <h2 className="section-title">Explore Collections</h2>
            </div>

            <Link
              href="/shop?sort=newest"
              className="collection-hero-card"
              onClick={() => setShowSidebar(false)}
            >
              <div className="card-content">
                <div className="edition-badge">2026 SERIES</div>
                {/* UPDATED: Changed from 'The Neo-Classic' to 'New Arrivals' */}
                <h3>New Arrivals</h3>
                <p>Discover our latest 2026 collection.</p>
                <div className="shop-btn-outline">View Collection</div>
              </div>
              <div className="product-visual-element">
                <span className="bottle-emoji">🥤</span>
              </div>
            </Link>

            {/* --- SECTION 2: CATEGORY MOSAIC --- */}
            <div className="section-label-group">
              <h2 className="section-title">Explore Collections</h2>
            </div>

            <div className="horizontal-category-container">
              <div className="horizontal-category-row">
                {categories.map((cat, index) => (
                  <Link
                    key={cat._id}
                    href={`/shop?category=${encodeURIComponent(cat.name)}`}
                    className={`category-pill-card pill-style-${
                      (index % 3) + 1
                    }`}
                    onClick={() => setShowSidebar(false)}
                  >
                    <div className="pill-content">
                      <span className="pill-name">{cat.displayName}</span>
                    </div>
                    <div className="pill-decoration"></div>
                  </Link>
                ))}
              </div>
            </div>

            {/* --- SECTION 3: TRUST FOOTER --- */}
            <div className="sidebar-trust-footer">
              <Link href="/track-order" className="trust-link">
                <span className="t-icon">🚚</span> <span>Track Your Order</span>
              </Link>
              <Link href="/support" className="trust-link">
                <span className="t-icon">💬</span> <span>Customer Support</span>
              </Link>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
