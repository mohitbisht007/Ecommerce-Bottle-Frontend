"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCustomers = async (searchValue = "") => {
    try {
      setLoading(true);
      setError("");

      const query = searchValue.trim()
        ? `?search=${encodeURIComponent(searchValue.trim())}`
        : "";

      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customers/admin${query}`,
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to fetch customers"
        );
      }

      setCustomers(data.customers || []);
    } catch (err) {
      console.error("Failed to fetch customers:", err);

      setError(
        err.message || "Unable to load customers"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchCustomers();
  }, []);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "No orders";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const getInitial = (name) => {
    return name?.charAt(0)?.toUpperCase() || "C";
  };

  const getAccountType = (customer) => {
    if (customer.isGuest) return "Guest";

    if (customer.authProvider === "google") {
      return "Google";
    }

    return "Registered";
  };

  const getAccountBadge = (customer) => {
    if (customer.isGuest) {
      return {
        label: "Guest",
        className:
          "bg-slate-100 text-slate-600",
        dot: "bg-slate-400",
      };
    }

    if (customer.authProvider === "google") {
      return {
        label: "Google",
        className:
          "bg-blue-50 text-blue-600",
        dot: "bg-blue-500",
      };
    }

    return {
      label: "Registered",
      className:
        "bg-emerald-50 text-emerald-600",
      dot: "bg-emerald-500",
    };
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="flex items-start justify-between gap-6 mb-6">

        <div>
          <div className="flex items-center gap-3">

            <h1 className="text-[26px] leading-tight font-semibold tracking-[-0.02em] text-slate-900">
              Customers
            </h1>

            <span className="inline-flex items-center justify-center min-w-7 h-6 px-2 rounded-full bg-slate-100 text-slate-600 text-xs font-semibold">
              {customers.length}
            </span>

          </div>

          <p className="mt-1.5 text-sm text-slate-500">
            View and manage your customer accounts,
            orders and activity.
          </p>
        </div>

      </div>


      {/* =====================================================
          SEARCH
      ===================================================== */}

      <div className="mb-4 rounded-xl border border-slate-200 bg-white p-2 shadow-sm">

        <div className="flex items-center gap-3 h-11 rounded-lg bg-slate-50 px-3 text-slate-400 focus-within:bg-white focus-within:ring-1 focus-within:ring-slate-300">

          {/* Search icon */}
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="shrink-0"
          >
            <circle
              cx="11"
              cy="11"
              r="7"
            />

            <path d="m20 20-3.5-3.5" />
          </svg>

          <input
            type="text"
            placeholder="Search customers by name, email or phone..."
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            className="w-full bg-transparent border-0 outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch("")}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500 text-lg leading-none transition hover:bg-slate-300 hover:text-slate-700"
            >
              ×
            </button>
          )}

        </div>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
            !
          </span>

          {error}

        </div>
      )}


      {/* =====================================================
          CUSTOMER CARD
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        {/* =================================================
            TABLE HEADER
        ================================================= */}

        <div className="hidden lg:grid lg:grid-cols-[minmax(280px,2.2fr)_100px_140px_180px_70px] items-center gap-4 border-b border-slate-200 bg-slate-50/80 px-5 py-3">

          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Customer
          </div>

          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Orders
          </div>

          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Total Spent
          </div>

          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-500">
            Activity
          </div>

          <div />
        </div>


        {/* =================================================
            LOADING
        ================================================= */}

        {loading ? (
          <div className="flex min-h-[300px] flex-col items-center justify-center gap-3 text-sm text-slate-400">

            <div className="h-7 w-7 animate-spin rounded-full border-2 border-slate-200 border-t-slate-600" />

            <span>
              Loading customers...
            </span>

          </div>
        ) : customers.length === 0 ? (

          /* =================================================
              EMPTY
          ================================================= */

          <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">

            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-2xl">
              👥
            </div>

            <h3 className="text-sm font-semibold text-slate-700">
              {search
                ? "No customers found"
                : "No customers yet"}
            </h3>

            <p className="mt-1.5 max-w-sm text-xs leading-5 text-slate-400">
              {search
                ? "Try searching with a different name, email or phone number."
                : "Customer accounts will appear here once people start shopping."}
            </p>

          </div>

        ) : (

          /* =================================================
              CUSTOMER LIST
          ================================================= */

          <div>

            {customers.map((customer) => {

              const badge =
                getAccountBadge(customer);

              return (
                <div
                  key={customer._id}
                  className="group border-b border-slate-100 last:border-b-0 transition-colors hover:bg-slate-50/60"
                >

                  {/* =======================================
                      DESKTOP ROW
                  ======================================= */}

                  <div className="hidden lg:grid lg:grid-cols-[minmax(280px,2.2fr)_100px_140px_180px_70px] items-center gap-4 px-5 py-4">

                    {/* CUSTOMER */}

                    <div className="flex min-w-0 items-center gap-3">

                      {customer.avatar ? (
                        <img
                          src={customer.avatar}
                          alt={customer.name}
                          className="h-10 w-10 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                        />
                      ) : (
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                          {getInitial(
                            customer.name
                          )}
                        </div>
                      )}

                      <div className="min-w-0">

                        <div className="truncate text-sm font-semibold text-slate-800">
                          {customer.name}
                        </div>

                        <div className="mt-0.5 truncate text-xs text-slate-500">
                          {customer.email}
                        </div>

                        <div className="mt-1.5 flex items-center gap-2">

                          <span
                            className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}
                            />

                            {badge.label}
                          </span>

                          {customer.phone && (
                            <>
                              <span className="text-[10px] text-slate-300">
                                •
                              </span>

                              <span className="text-[10px] text-slate-400">
                                {customer.phone}
                              </span>
                            </>
                          )}

                        </div>

                      </div>

                    </div>


                    {/* ORDERS */}

                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {customer.totalOrders || 0}
                      </div>

                      <div className="mt-0.5 text-[10px] text-slate-400">
                        {customer.totalOrders === 1
                          ? "order"
                          : "orders"}
                      </div>
                    </div>


                    {/* SPENT */}

                    <div>
                      <div className="text-sm font-semibold text-slate-800">
                        {formatCurrency(
                          customer.totalSpent
                        )}
                      </div>

                      <div className="mt-0.5 text-[10px] text-slate-400">
                        lifetime value
                      </div>
                    </div>


                    {/* ACTIVITY */}

                    <div>

                      <div className="text-xs font-medium text-slate-700">
                        {formatDate(
                          customer.lastOrderDate
                        )}
                      </div>

                      <div className="mt-0.5 text-[10px] text-slate-400">
                        Last order
                      </div>

                      <div className="mt-1 text-[10px] text-slate-300">
                        Joined{" "}
                        {formatDate(
                          customer.createdAt
                        )}
                      </div>

                    </div>


                    {/* VIEW */}

                    <div className="flex justify-end">

                      <Link
                        href={`/admin/customers/${customer._id}`}
                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800"
                        title="View customer"
                      >
                        <svg
                          width="15"
                          height="15"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M5 12h14" />
                          <path d="m13 6 6 6-6 6" />
                        </svg>
                      </Link>

                    </div>

                  </div>


                  {/* =======================================
                      MOBILE / TABLET CARD
                  ======================================= */}

                  <div className="flex items-center gap-3 p-4 lg:hidden">

                    {customer.avatar ? (
                      <img
                        src={customer.avatar}
                        alt={customer.name}
                        className="h-11 w-11 shrink-0 rounded-full object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-600 ring-1 ring-slate-200">
                        {getInitial(
                          customer.name
                        )}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">

                      <div className="truncate text-sm font-semibold text-slate-800">
                        {customer.name}
                      </div>

                      <div className="mt-0.5 truncate text-xs text-slate-500">
                        {customer.email}
                      </div>

                      <div className="mt-2 flex flex-wrap items-center gap-2">

                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.className}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${badge.dot}`}
                          />

                          {badge.label}
                        </span>

                        <span className="text-[10px] text-slate-400">
                          {customer.totalOrders || 0}{" "}
                          orders
                        </span>

                        <span className="text-[10px] text-slate-400">
                          {formatCurrency(
                            customer.totalSpent
                          )}
                        </span>

                      </div>

                    </div>

                    <Link
                      href={`/admin/customers/${customer._id}`}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition-all hover:border-slate-300 hover:bg-slate-100 hover:text-slate-800"
                      title="View customer"
                    >
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M5 12h14" />
                        <path d="m13 6 6 6-6 6" />
                      </svg>
                    </Link>

                  </div>

                </div>
              );
            })}

          </div>
        )}

      </div>

    </div>
  );
}