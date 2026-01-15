"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

// --- Optimized Accessible Icons ---
const IconHeart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20.8 8.6c0-2.6-2-4.8-4.6-4.8-1.4 0-2.7.7-3.6 1.8-.9-1.1-2.2-1.8-3.6-1.8-2.6 0-4.6 2.2-4.6 4.8 0 5.2 8.2 8.6 8.2 8.6s8.6-3.4 8.6-8.6z" />
  </svg>
);

const IconCart = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 6h15l-1.6 8.1a2 2 0 0 1-2 1.6H9.6a2 2 0 0 1-2-1.6L6 6z" />
    <circle cx="10" cy="19" r="1" fill="currentColor" />
    <circle cx="18" cy="19" r="1" fill="currentColor" />
  </svg>
);

const IconUser = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const IconSearch = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 21l-4.35-4.35" />
    <circle cx="11" cy="11" r="6" />
  </svg>
);

const IconBurger = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
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
  const [activeCategory, setActiveCategory] = useState("New Arrivals");
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [authReady, setAuthReady] = useState(false);

  const userMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (err) {
        console.error("Error fetching categories", err);
      }
    };
    fetchCats();
  }, []);

  useEffect(() => {
    const loadState = () => {
      try {
        const cartRaw = localStorage.getItem("bottle_cart");
        const userRaw = localStorage.getItem("bottle_user");
        
        if (cartRaw) {
          const cart = JSON.parse(cartRaw);
          const count = (cart.items || []).reduce((s, it) => s + (Number(it.qty) || 0), 0);
          setCartCount(count);
        }
        setUser(userRaw ? JSON.parse(userRaw) : null);
      } catch (err) {
        console.error("State loading error", err);
      }
      setAuthReady(true);
    };

    loadState();

    const handleAuthChange = (e) => {
      if (e?.detail?.user !== undefined) setUser(e.detail.user);
      else loadState();
    };

    window.addEventListener("bottle_cart_updated", loadState);
    window.addEventListener("bottle_auth_changed", handleAuthChange);

    return () => {
      window.removeEventListener("bottle_cart_updated", loadState);
      window.removeEventListener("bottle_auth_changed", handleAuthChange);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  useEffect(() => {
    if (showSearch) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    } else {
      setSearchQuery("");
    }
  }, [showSearch]);

  const toggleSidebar = () => setShowSidebar((s) => !s);
  const closeSidebar = () => setShowSidebar(false);
  const openSearch = () => setShowSearch(true);
  const closeSearch = () => setShowSearch(false);

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    if (!searchQuery.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
    setShowSearch(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("bottle_user");
    setUser(null);
    setShowUserMenu(false);
    window.dispatchEvent(new CustomEvent("bottle_auth_changed", { detail: { user: null } }));
  };

  if (!authReady) return null;

  return (
    <>
      <header className={`site-header modern responsive-header ${showSearch ? "search-active" : ""}`}>
        <div className="site-inner">
          
          {/* LEFT: Burger & Desktop Logo */}
          <div className="nav-left">
            <button className="icon-btn burger-btn" aria-label="Open menu" onClick={toggleSidebar}>
              <IconBurger />
            </button>

            <Link href="/" className="logo desktop-logo" aria-label="BottleShop Home">
              <svg width="34" height="34" viewBox="0 0 48 48" fill="none">
                <rect width="48" height="48" rx="12" fill="#ec4899" />
                <path d="M14 26c4-6 10-6 14-2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="logo-text">BottleShop</span>
            </Link>
          </div>

          {/* CENTER: Navigation, Search, or Mobile Logo */}
          <div className="center-area">
            {!showSearch ? (
              <>
                {/* Desktop Nav */}
                <nav className="nav-center" aria-label="Main navigation">
                  <ul>
                    <li>
                      <Link 
                        href="/shop?sort=newest" 
                        className={`cat-pill ${activeCategory === "New Arrivals" ? "active" : ""}`}
                        onClick={() => setActiveCategory("New Arrivals")}
                      >
                        New Arrivals
                      </Link>
                    </li>
                    {categories.slice(0, 5).map((cat) => (
                      <li key={cat._id}>
                        <Link
                          href={`/shop?category=${encodeURIComponent(cat.name)}`}
                          className={`cat-pill ${activeCategory === cat.name ? "active" : ""}`}
                          onClick={() => setActiveCategory(cat.name)}
                        >
                          {cat.displayName}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>

                {/* Mobile Center Logo */}
                <Link href="/" className="logo mobile-logo" aria-label="BottleShop Home">
                  <svg width="30" height="30" viewBox="0 0 48 48" fill="none">
                    <rect width="48" height="48" rx="12" fill="#ec4899" />
                    <path d="M14 26c4-6 10-6 14-2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span className="logo-text">BottleShop</span>
                </Link>
              </>
            ) : (
              <form className="search-area" onSubmit={handleSearchSubmit} role="search">
                <input
                  ref={searchInputRef}
                  className="search-input"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="button" className="search-close" onClick={closeSearch}>✕</button>
              </form>
            )}
          </div>

          {/* RIGHT: User (Desktop Only), Wishlist, Cart */}
          <div className="nav-right">
            {!showSearch && (
              <button className="icon-btn" aria-label="Open Search" onClick={openSearch}>
                <IconSearch />
              </button>
            )}
            
            <Link href="/wishlist" className="icon-btn" aria-label="View Wishlist">
              <IconHeart />
            </Link>

            {/* User Profile - Hidden on Mobile via CSS */}
            <div className="user-profile-desktop">
              {!user ? (
                <Link href="/login" className="icon-btn" aria-label="Login">
                  <IconUser />
                </Link>
              ) : (
                <div className="user-menu-container" ref={userMenuRef}>
                  <button 
                    className={`user-nav-pill ${showUserMenu ? "active" : ""}`} 
                    onClick={() => setShowUserMenu(!showUserMenu)}
                  >
                    <div className="user-avatar-sm">{user.name?.charAt(0)}</div>
                    <span className="user-firstname">{user.name?.split(" ")[0]}</span>
                    <span className={`chevron ${showUserMenu ? "up" : ""}`}>▾</span>
                  </button>

                  {showUserMenu && (
                    <div className="user-dropdown-modern">
                      <div className="dropdown-header">
                        <p className="drop-name">{user.name}</p>
                        <p className="drop-email">{user.email}</p>
                      </div>
                      <div className="dropdown-links">
                        <Link href="/account" onClick={() => setShowUserMenu(false)} className="drop-item">👤 Profile</Link>
                        <Link href="/account/orders" onClick={() => setShowUserMenu(false)} className="drop-item">📦 Orders</Link>
                        <Link href="/account/addresses" onClick={() => setShowUserMenu(false)} className="drop-item">📍 Addresses</Link>
                      </div>
                      <div className="dropdown-footer">
                        <button onClick={handleLogout} className="drop-logout-btn">Logout</button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link href="/checkout" className="icon-btn cart" aria-label="Cart">
              <IconCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* Sidebar (Unchanged - User exists here) */}
      <div className={`sidebar-backdrop ${showSidebar ? "open" : ""}`} onClick={closeSidebar}></div>
      <aside className={`side-drawer ${showSidebar ? "open" : ""}`}>
        <div className="side-inner">
          <div className="side-top">
            <button className="close-drawer" onClick={closeSidebar}>✕</button>
            <span className="side-title">Menu</span>
          </div>

          <div className="side-user-card">
            {!user ? (
              <Link href="/login" className="side-auth-cta" onClick={closeSidebar}>
                <div className="cta-icon"><IconUser /></div>
                <div>
                  <p className="cta-head">Welcome!</p>
                  <p className="cta-sub">Login or Sign up</p>
                </div>
              </Link>
            ) : (
              <div className="side-profile">
                <div className="profile-main">
                  <div className="profile-avatar">{user.name?.charAt(0)}</div>
                  <div>
                    <p className="profile-hi">Hi, {user.name?.split(" ")[0]}</p>
                    <p className="profile-email">{user.email}</p>
                  </div>
                </div>
                <div className="side-account-grid">
                  <Link href="/account" onClick={closeSidebar} className="grid-item">👤 Profile</Link>
                  <Link href="/account/orders" onClick={closeSidebar} className="grid-item">📦 Orders</Link>
                  <Link href="/account/addresses" onClick={closeSidebar} className="grid-item">📍 Address</Link>
                  <button onClick={handleLogout} className="grid-item logout">🚪 Logout</button>
                </div>
              </div>
            )}
          </div>

          <div className="side-divider">Shop by Category</div>
          <nav className="side-cats">
            <Link href="/shop?sort=newest" className="side-cat" onClick={closeSidebar}>New Arrivals</Link>
            {categories.slice(0, 5).map((cat) => (
              <Link key={cat._id} href={`/shop?category=${encodeURIComponent(cat.name)}`} className="side-cat" onClick={closeSidebar}>
                {cat.displayName}
              </Link>
            ))}
          </nav>
        </div>
      </aside>
    </>
  );
}