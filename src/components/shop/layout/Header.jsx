"use client";

import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// --- Custom Icons ---
const IconHeart = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.8 8.6c0-2.6-2-4.8-4.6-4.8-1.4 0-2.7.7-3.6 1.8-.9-1.1-2.2-1.8-3.6-1.8-2.6 0-4.6 2.2-4.6 4.8 0 5.2 8.2 8.6 8.2 8.6s8.6-3.4 8.6-8.6z" />
  </svg>
);
const IconCart = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 6h15l-1.6 8.1a2 2 0 0 1-2 1.6H9.6a2 2 0 0 1-2-1.6L6 6z" />
    <circle cx="10" cy="19" r="1" fill="currentColor" />
    <circle cx="18" cy="19" r="1" fill="currentColor" />
  </svg>
);
const IconUser = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const IconSearch = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);
const IconBurger = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);
const IconChevronDown = ({ className = "w-3.5 h-3.5" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
const IconClock = ({ className = "w-4 h-4" }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 3" />
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
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);

  const userMenuRef = useRef(null);
  const categoryMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
        const data = await res.json();
        if (data.success) setCategories(data.categories);
      } catch (e) {
        console.error(e);
      }
      const cart = JSON.parse(localStorage.getItem("bottle_cart") || "{}");
      setCartCount((cart.items || []).reduce((s, it) => s + (Number(it.qty) || 0), 0));
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
      if (categoryMenuRef.current && !categoryMenuRef.current.contains(event.target)) {
        setShowCategoryMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    document.body.style.overflow = showSidebar ? "hidden" : "unset";
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

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/shop?q=${encodeURIComponent(searchQuery)}`);
    setShowSearch(false);
  };

  return (
    <>
      {/* ================= TOP NAV ================= */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-3 bg-white px-4 sm:h-[72px] sm:gap-4 sm:px-6 lg:px-8">
          {/* LEFT: logo + shop by category */}
          <div className="flex shrink-0 items-center gap-2 sm:gap-4 lg:gap-6">
            <Link href="/" className="flex shrink-0 items-center">
              <Image
                src="/logo2.png"
                alt="Bouncy Bucket Logo"
                width={140}
                height={48}
                priority
                className="h-8 w-auto sm:h-10 lg:h-11"
              />
            </Link>

            <div className="relative hidden lg:block" ref={categoryMenuRef}>
              <button
                onClick={() => setShowCategoryMenu((v) => !v)}
                className="flex items-center gap-1.5 rounded-full px-2 py-2 text-sm font-semibold text-slate-900 transition-colors hover:bg-slate-100"
              >
                <span className="leading-tight">
                  Shop by
                  <br />
                  category
                </span>
                <IconChevronDown
                  className={`h-3.5 w-3.5 shrink-0 transition-transform duration-200 ${
                    showCategoryMenu ? "rotate-180" : ""
                  }`}
                />
              </button>

              <div
                className={`absolute left-0 top-full z-50 mt-2 w-64 origin-top-left rounded-2xl border border-slate-200 bg-white p-2 shadow-xl transition-all duration-150 ${
                  showCategoryMenu
                    ? "visible translate-y-0 opacity-100"
                    : "invisible -translate-y-1 opacity-0"
                }`}
              >
                <Link
                  href="/shop?sort=newest"
                  onClick={() => setShowCategoryMenu(false)}
                  className="block rounded-xl px-3 py-2.5 text-sm font-semibold text-slate-900 hover:bg-slate-100"
                >
                  New Arrivals
                </Link>
                <div className="my-1 h-px bg-slate-100" />
                <div className="max-h-72 overflow-y-auto">
                  {categories.map((c) => (
                    <Link
                      key={c._id}
                      href={`/shop?category=${c.name}`}
                      onClick={() => setShowCategoryMenu(false)}
                      className="block rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      {c.displayName}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* CENTER: search bar (desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden flex-1 items-center border-2 border-slate-900 bg-white pl-5 pr-1.5 py-1.5 sm:flex sm:max-w-md lg:max-w-xl"
          >
            <input
              type="text"
              placeholder="What are you looking for?"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 placeholder-slate-400 outline-none lg:text-base"
            />
            <button
              type="submit"
              aria-label="Search"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100"
            >
              <IconSearch className="h-5 w-5" />
            </button>
          </form>

          {/* RIGHT: delivery + icons */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2 lg:gap-4">
            <div className="mr-1 hidden items-center gap-1.5 text-sm font-semibold text-slate-900 xl:flex">
              <IconClock className="h-4 w-4" />
              <span>90 Minutes delivery</span>
            </div>

            {/* search icon — mobile / tablet, opens overlay */}
            <button
              onClick={() => setShowSearch(true)}
              aria-label="Search"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100 sm:hidden"
            >
              <IconSearch />
            </button>

            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="hidden h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100 md:flex"
            >
              <IconHeart />
            </Link>

            {/* user area — desktop */}
            <div className="relative hidden md:block" ref={userMenuRef}>
              {!user ? (
                <Link
                  href="/login"
                  aria-label="Account"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100"
                >
                  <IconUser />
                </Link>
              ) : (
                <>
                  <button
                    onClick={() => setShowUserMenu((v) => !v)}
                    className={`flex h-10 items-center gap-2 rounded-full px-2 transition-colors hover:bg-slate-100 ${
                      showUserMenu ? "bg-slate-100" : ""
                    }`}
                  >
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white">
                      {user.name?.charAt(0)}
                    </span>
                    <span className="hidden text-sm font-semibold text-slate-900 lg:inline">
                      {user.name?.split(" ")[0]}
                    </span>
                    <IconChevronDown
                      className={`h-3 w-3 text-slate-500 transition-transform duration-200 ${
                        showUserMenu ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  <div
                    className={`absolute right-0 top-full z-50 mt-2 w-60 origin-top-right rounded-2xl border border-slate-200 bg-white p-2 shadow-xl transition-all duration-150 ${
                      showUserMenu
                        ? "visible translate-y-0 opacity-100"
                        : "invisible -translate-y-1 opacity-0"
                    }`}
                  >
                    <div className="px-3 py-2">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Account
                      </p>
                      <p className="truncate text-sm font-medium text-slate-900">
                        {user.email}
                      </p>
                    </div>
                    <div className="my-1 h-px bg-slate-100" />
                    <Link
                      href="/account"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      👤 Profile
                    </Link>
                    <Link
                      href="/account/orders"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      📦 Orders
                    </Link>
                    <Link
                      href="/account/addresses"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100"
                    >
                      📍 Address
                    </Link>
                    <div className="my-1 h-px bg-slate-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-red-600 hover:bg-red-50"
                    >
                      Logout
                    </button>
                  </div>
                </>
              )}
            </div>

            <Link
              href="/checkout"
              aria-label="Cart"
              className="relative flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100"
            >
              <IconCart />
              {cartCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4.5 min-w-[18px] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold leading-none text-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* hamburger — mobile / tablet ONLY, hidden on desktop */}
            <button
              onClick={() => setShowSidebar(true)}
              aria-label="Menu"
              className="flex h-10 w-10 items-center justify-center rounded-full text-slate-900 transition-colors hover:bg-slate-100 lg:hidden"
            >
              <IconBurger />
            </button>
          </div>
        </div>
      </header>

      {/* ================= SEARCH OVERLAY (mobile / tablet) ================= */}
      <div
        className={`fixed inset-0 z-50 bg-white/95 backdrop-blur-sm transition-opacity duration-200 ${
          showSearch ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4 sm:h-20">
          <form onSubmit={handleSearchSubmit} className="flex-1">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search for premium bottles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border-2 border-slate-900 bg-white px-5 py-3 text-base text-slate-900 placeholder-slate-400 outline-none"
            />
          </form>
          <button
            onClick={() => setShowSearch(false)}
            aria-label="Close search"
            className="flex h-11 w-11 shrink-0 items-center justify-center text-xl text-slate-900 transition-colors hover:bg-slate-100"
          >
            ✕
          </button>
        </div>
      </div>

      {/* ================= MOBILE DRAWER ================= */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          showSidebar ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={() => setShowSidebar(false)}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-[85%] max-w-sm transform bg-white shadow-2xl transition-transform duration-300 ease-in-out ${
          showSidebar ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col overflow-y-auto">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <span className="text-base font-bold text-slate-900">Navigation</span>
            <button
              onClick={() => setShowSidebar(false)}
              aria-label="Close menu"
              className="flex h-9 w-9 items-center justify-center rounded-full text-lg text-slate-500 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          <div className="px-5 pt-5">
            {!user ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
                    <IconUser className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">Welcome!</h3>
                    <p className="text-xs text-slate-500">Login to manage your orders &amp; profile</p>
                  </div>
                </div>
                <Link
                  href="/login"
                  onClick={() => setShowSidebar(false)}
                  className="block w-full rounded-full bg-slate-900 py-2.5 text-center text-sm font-semibold text-white transition-colors hover:bg-slate-800"
                >
                  Login / Sign Up
                </Link>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="mb-4 flex items-center gap-3">
                  <div className="relative">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-lg font-bold text-white">
                      {user.name?.charAt(0)}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-500" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-xs text-slate-500">Welcome back,</span>
                    <h2 className="truncate text-base font-bold text-slate-900">{user.name?.split(" ")[0]}</h2>
                    <p className="truncate text-xs text-slate-500">{user.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/account"
                    onClick={() => setShowSidebar(false)}
                    className="flex flex-col items-center gap-1 rounded-xl bg-white py-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
                  >
                    <span className="text-lg">👤</span> Profile
                  </Link>
                  <Link
                    href="/account/orders"
                    onClick={() => setShowSidebar(false)}
                    className="flex flex-col items-center gap-1 rounded-xl bg-white py-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
                  >
                    <span className="text-lg">📦</span> Orders
                  </Link>
                  <Link
                    href="/account/addresses"
                    onClick={() => setShowSidebar(false)}
                    className="flex flex-col items-center gap-1 rounded-xl bg-white py-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-100"
                  >
                    <span className="text-lg">📍</span> Addresses
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="flex flex-col items-center gap-1 rounded-xl bg-white py-3 text-xs font-semibold text-red-600 shadow-sm hover:bg-red-50"
                  >
                    <span className="text-lg">🚪</span> Logout
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="flex-1 px-5 py-6">
            <div className="mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Curated for you</span>
              <h2 className="text-lg font-bold text-slate-900">Explore Collections</h2>
            </div>

            <Link
              href="/shop?sort=newest"
              onClick={() => setShowSidebar(false)}
              className="mb-6 flex items-center justify-between overflow-hidden rounded-2xl bg-slate-900 p-5 text-white"
            >
              <div>
                <span className="inline-block rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold tracking-wide">
                  2026 SERIES
                </span>
                <h3 className="mt-2 text-xl font-bold">New Arrivals</h3>
                <p className="mt-1 text-sm text-white/70">Discover our latest 2026 collection.</p>
                <span className="mt-3 inline-block rounded-full border border-white/40 px-4 py-1.5 text-xs font-semibold">
                  View Collection
                </span>
              </div>
              <span className="text-5xl">🥤</span>
            </Link>

            <h2 className="mb-3 text-lg font-bold text-slate-900">Shop by Category</h2>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Link
                  key={cat._id}
                  href={`/shop?category=${encodeURIComponent(cat.name)}`}
                  onClick={() => setShowSidebar(false)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-900 hover:bg-slate-900 hover:text-white"
                >
                  {cat.displayName}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-slate-100 px-5 py-4">
            <Link
              href="/track-order"
              onClick={() => setShowSidebar(false)}
              className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700"
            >
              <span>🚚</span> Track Your Order
            </Link>
            <Link
              href="/support"
              onClick={() => setShowSidebar(false)}
              className="flex items-center gap-2 py-2 text-sm font-medium text-slate-700"
            >
              <span>💬</span> Customer Support
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}