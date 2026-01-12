// src/components/Header.jsx
'use client';

import Link from 'next/link';
import { useEffect, useState, useRef } from 'react';

const IconHeart = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20.8 8.6c0-2.6-2-4.8-4.6-4.8-1.4 0-2.7.7-3.6 1.8-.9-1.1-2.2-1.8-3.6-1.8-2.6 0-4.6 2.2-4.6 4.8 0 5.2 8.2 8.6 8.2 8.6s8.6-3.4 8.6-8.6z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconCart = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M6 6h15l-1.6 8.1a2 2 0 0 1-2 1.6H9.6a2 2 0 0 1-2-1.6L6 6z" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="10" cy="19" r="1" fill="currentColor" />
    <circle cx="18" cy="19" r="1" fill="currentColor" />
  </svg>
);

const IconUser = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M20 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M4 21v-2a4 4 0 0 1 3-3.87" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="12" cy="7" r="4" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconSearch = ({ className = '' }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IconBurger = ({ className = '' }) => (
  <svg className={className} width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden>
    <path d="M4 6h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M4 12h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    <path d="M4 18h16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export default function Header() {
  const categories = ['New Arrivals', 'Steel', 'Glass', 'Plastic', 'Kids', 'Personalized'];
  const [cartCount, setCartCount] = useState(0);
  const [user, setUser] = useState(null);

  // UI states
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [activeCategory, setActiveCategory] = useState('New Arrivals');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);


  const searchInputRef = useRef(null);

  // load initial state
  useEffect(() => {
    const loadCart = () => {
      try {
        const raw = localStorage.getItem('bottle_cart');
        const cart = raw ? JSON.parse(raw) : { items: [] };
        const count = (cart.items || []).reduce((s, it) => s + (Number(it.qty) || 0), 0);
        setCartCount(count);
      } catch {
        setCartCount(0);
      }
    };
    const loadUser = () => {
      try {
        const raw = localStorage.getItem('bottle_user');
        setUser(raw ? JSON.parse(raw) : null);
      } catch {
        setUser(null);
      }
    };

    loadCart();
    loadUser();

    const onCart = () => loadCart();
    const onAuth = (e) => setUser(e?.detail?.user ?? (localStorage.getItem('bottle_user') ? JSON.parse(localStorage.getItem('bottle_user')) : null));

    window.addEventListener('bottle_cart_updated', onCart);
    window.addEventListener('bottle_auth_changed', onAuth);

    return () => {
      window.removeEventListener('bottle_cart_updated', onCart);
      window.removeEventListener('bottle_auth_changed', onAuth);
    };
  }, []);

  // Handle clicking outside to close the menu
  useEffect(() => {
    function handleClickOutside(event) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    }
    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserMenu]);

  // focus search input when it opens
  useEffect(() => {
    if (showSearch) {
      setTimeout(() => searchInputRef.current?.focus?.(), 80);
    } else {
      setSearchQuery('');
    }
  }, [showSearch]);

  const openSearch = () => setShowSearch(true);
  const closeSearch = () => setShowSearch(false);

  const toggleSidebar = () => setShowSidebar(s => !s);
  const closeSidebar = () => setShowSidebar(false);

  const handleSearchSubmit = (e) => {
    e?.preventDefault?.();
    if (!searchQuery.trim()) return;
    const q = encodeURIComponent(searchQuery.trim());
    setShowUserMenu(false)
    window.location.href = `/products?q=${q}`;
    closeSearch();
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('bottle_user');
    setUser(null);
    setShowUserMenu(false)
    window.dispatchEvent(new CustomEvent('bottle_auth_changed', { detail: { user: null } }));
  };

  return (
    <>
      <header className={`site-header modern responsive-header ${showSearch ? 'search-active' : ''}`}>
        <div className="site-inner">
          {/* LEFT (mobile: burger, desktop: logo) */}
          <div className="nav-left">
            <button
              className="icon-btn burger-btn"
              aria-label="Open menu"
              onClick={toggleSidebar}
              aria-expanded={showSidebar}
            >
              <IconBurger />
            </button>

            <Link href="/" className="logo desktop-logo" aria-label="Home">
              <svg width="34" height="34" viewBox="0 0 48 48" fill="none" aria-hidden>
                <rect width="48" height="48" rx="12" fill="#ec4899" />
                <path d="M14 26c4-6 10-6 14-2" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="logo-text">BottleShop</span>
            </Link>
          </div>

          {/* CENTER: categories or search */}
          <div className="center-area">
            {!showSearch ? (
              <nav className="nav-center" aria-label="Main categories">
                <ul>
                  {categories.map(cat => (
                    <li key={cat}>
                      <Link
                        href={`/products${cat === 'New Arrivals' ? '?sort=newest' : `?category=${encodeURIComponent(cat.toLowerCase())}`}`}
                        className={`cat-pill ${activeCategory === cat ? 'active' : ''}`}
                        onMouseEnter={() => setActiveCategory(cat)}
                        onFocus={() => setActiveCategory(cat)}
                        onClick={() => setActiveCategory(cat)}
                      >
                        {cat}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ) : (
              <form className="search-area" onSubmit={handleSearchSubmit} role="search" aria-label="Site search">
                <input
                  ref={searchInputRef}
                  className="search-input"
                  placeholder="Search products, categories, brands..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button type="button" className="search-close" onClick={closeSearch} aria-label="Close search">✕</button>
              </form>
            )}
          </div>

          {/* RIGHT: icons */}
          <div className="nav-right">
            <button className="icon-btn" aria-label="Search" onClick={openSearch}><IconSearch /></button>
            <Link href="/wishlist" className="icon-btn" aria-label="Wishlist"><IconHeart /></Link>

            {/* DESKTOP USER MENU */}
            {!user ? (
              <Link href="/login" className="icon-btn"><IconUser /></Link>
            ) : (
              <div className="user-menu-container" ref={userMenuRef}>
                <button 
                  className={`user-nav-pill ${showUserMenu ? 'active' : ''}`}
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <div className="user-avatar-sm">{user.name?.charAt(0)}</div>
                  <span className="user-firstname">{user.name?.split(' ')[0]}</span>
                  <span className={`chevron ${showUserMenu ? 'up' : ''}`}>▾</span>
                </button>

                {showUserMenu && (
                  <div className="user-dropdown-modern">
                    <div className="dropdown-header">
                      <p className="drop-name">{user.name}</p>
                      <p className="drop-email">{user.email}</p>
                    </div>
                    
                    <div className="dropdown-links">
                      <Link href="/account" onClick={() => setShowUserMenu(false)} className="drop-item">
                        <span className="drop-icon">👤</span> My Profile
                      </Link>
                      <Link href="/account/orders" onClick={() => setShowUserMenu(false)} className="drop-item">
                        <span className="drop-icon">📦</span> My Orders
                      </Link>
                      <Link href="/account/addresses" onClick={() => setShowUserMenu(false)} className="drop-item">
                        <span className="drop-icon">📍</span> Addresses
                      </Link>
                    </div>

                    <div className="dropdown-footer">
                      <button onClick={handleLogout} className="drop-logout-btn">
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <Link href="/cart" className="icon-btn cart" aria-label="Cart">
              <IconCart />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>
          </div>
        </div>
      </header>

      {/* Slide-in sidebar (mobile) */}
      <div className={`sidebar-backdrop ${showSidebar ? 'open' : ''}`} onClick={closeSidebar} aria-hidden={!showSidebar}></div>

      <aside className={`side-drawer ${showSidebar ? 'open' : ''}`} aria-hidden={!showSidebar} aria-label="Main menu">
        <div className="side-inner">

        <div className="side-top">
            <button className="close-drawer" onClick={closeSidebar}>✕</button>
            <span className="side-title">Menu</span>
          </div>

          {/* USER SECTION AT TOP OF SIDEBAR */}
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
                    <p className="profile-hi">Hi, {user.name?.split(' ')[0]}</p>
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
            {categories.map(cat => (
              <Link key={cat} href={`/products?category=${cat}`} className="side-cat" onClick={closeSidebar}>
                {cat}
              </Link>
            ))}
          </nav>

          <div className="side-social">
            <div className="side-social-label">Follow us</div>
            <div className="side-social-list">
              <a href="#" className="social" aria-label="Instagram">IG</a>
              <a href="#" className="social" aria-label="Facebook">FB</a>
              <a href="#" className="social" aria-label="X / Twitter">X</a>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
