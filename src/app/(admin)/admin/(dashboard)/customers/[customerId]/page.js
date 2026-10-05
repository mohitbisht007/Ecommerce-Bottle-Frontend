"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminCustomerDetailsPage() {
  const { customerId } = useParams();
  const router = useRouter();

  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customers/admin/${customerId}`,
        {
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message || "Failed to fetch customer"
        );
      }

      setCustomer(data.customer);

      setForm({
        name: data.customer.name || "",
        email: data.customer.email || "",
        phone: data.customer.phone || "",
      });
    } catch (err) {
      console.error(
        "Failed to fetch customer:",
        err
      );

      setError(
        err.message ||
          "Unable to load customer details"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (customerId) {
      fetchCustomer();
    }
  }, [customerId]);

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/customers/admin/${customerId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${token}`,
          },
          body: JSON.stringify(form),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.message ||
            "Failed to update customer"
        );
      }

      setCustomer((prev) => ({
        ...prev,
        ...data.customer,
      }));

      setEditing(false);
    } catch (err) {
      console.error(
        "Failed to update customer:",
        err
      );

      setError(
        err.message ||
          "Unable to update customer"
      );
    } finally {
      setSaving(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) return "—";

    return new Date(date).toLocaleString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  };

  const getInitial = (name) => {
    return (
      name?.charAt(0)?.toUpperCase() || "C"
    );
  };

  const getAccountType = () => {
    if (customer?.isGuest) return "Guest";

    if (customer?.authProvider === "google") {
      return "Google";
    }

    return "Registered";
  };

  const getOrderStatusClass = (status) => {
    switch (status) {
      case "Delivered":
        return "bg-emerald-50 text-emerald-700";

      case "Shipped":
        return "bg-blue-50 text-blue-700";

      case "Processing":
        return "bg-amber-50 text-amber-700";

      case "Cancelled":
        return "bg-red-50 text-red-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getPaymentStatusClass = (status) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-emerald-700";

      case "Failed":
        return "bg-red-50 text-red-700";

      case "Pending":
        return "bg-amber-50 text-amber-700";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[500px] flex-col items-center justify-center gap-3">

        <div className="h-8 w-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-700" />

        <p className="text-sm text-slate-400">
          Loading customer...
        </p>

      </div>
    );
  }

  if (error && !customer) {
    return (
      <div className="mx-auto max-w-3xl py-20 text-center">

        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-500">
          !
        </div>

        <h2 className="text-lg font-semibold text-slate-800">
          Unable to load customer
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          {error}
        </p>

        <button
          onClick={() => router.back()}
          className="mt-6 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Go Back
        </button>

      </div>
    );
  }

  const summary = customer.orderSummary || {};

  return (
    <div className="mx-auto w-full max-w-[1400px]">

      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">

        <div>

          <Link
            href="/admin/customers"
            className="mb-3 inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 transition hover:text-slate-700"
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>

            Back to customers
          </Link>

          <h1 className="text-[26px] font-semibold tracking-[-0.02em] text-slate-900">
            Customer Details
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View customer information, orders and
            account activity.
          </p>

        </div>

      </div>


      {/* =====================================================
          ERROR
      ===================================================== */}

      {error && (
        <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-100 text-xs font-bold">
            !
          </span>

          {error}

        </div>
      )}


      {/* =====================================================
          CUSTOMER PROFILE
      ===================================================== */}

      <div className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

        <div className="p-5 sm:p-6">

          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

            {/* Profile */}

            <div className="flex min-w-0 items-center gap-4">

              {customer.avatar ? (
                <img
                  src={customer.avatar}
                  alt={customer.name}
                  className="h-16 w-16 shrink-0 rounded-full object-cover ring-4 ring-slate-50"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xl font-semibold text-slate-600 ring-4 ring-slate-50">
                  {getInitial(customer.name)}
                </div>
              )}

              <div className="min-w-0">

                <h2 className="truncate text-xl font-semibold text-slate-900">
                  {customer.name}
                </h2>

                <p className="mt-1 truncate text-sm text-slate-500">
                  {customer.email}
                </p>

                <div className="mt-2 flex flex-wrap items-center gap-2">

                  <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
                    {getAccountType()}
                  </span>

                  <span className="text-xs text-slate-400">
                    Joined{" "}
                    {formatDate(
                      customer.createdAt
                    )}
                  </span>

                </div>

              </div>

            </div>


            {/* Edit */}

            <button
              type="button"
              onClick={() =>
                setEditing((prev) => !prev)
              }
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
            >

              {editing ? "Cancel" : "Edit Customer"}

            </button>

          </div>


          {/* Edit Form */}

          {editing && (
            <div className="mt-6 border-t border-slate-100 pt-6">

              <div className="grid gap-4 md:grid-cols-3">

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Name
                  </label>

                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Email
                  </label>

                  <input
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Phone
                  </label>

                  <input
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                  />
                </div>

              </div>

              <div className="mt-4 flex justify-end">

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSave}
                  className="inline-flex h-9 items-center justify-center rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving
                    ? "Saving..."
                    : "Save Changes"}
                </button>

              </div>

            </div>
          )}

        </div>

      </div>


      {/* =====================================================
          STATISTICS
      ===================================================== */}

      <div className="mb-5 grid grid-cols-2 gap-3 lg:grid-cols-4">

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <p className="text-[11px] font-medium text-slate-400">
            Total Orders
          </p>

          <p className="mt-1 text-xl font-semibold text-slate-900">
            {summary.total || 0}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <p className="text-[11px] font-medium text-slate-400">
            Total Spent
          </p>

          <p className="mt-1 text-xl font-semibold text-slate-900">
            {formatCurrency(
              customer.totalSpent
            )}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <p className="text-[11px] font-medium text-slate-400">
            Delivered
          </p>

          <p className="mt-1 text-xl font-semibold text-emerald-600">
            {summary.delivered || 0}
          </p>

        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">

          <p className="text-[11px] font-medium text-slate-400">
            Processing
          </p>

          <p className="mt-1 text-xl font-semibold text-amber-600">
            {summary.processing || 0}
          </p>

        </div>

      </div>


      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <div className="grid gap-5 xl:grid-cols-[340px_minmax(0,1fr)]">


        {/* ===================================================
            LEFT COLUMN
        =================================================== */}

        <div className="space-y-5">


          {/* PERSONAL INFORMATION */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <h3 className="text-sm font-semibold text-slate-800">
              Personal Information
            </h3>

            <div className="mt-5 space-y-4">

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Full Name
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {customer.name || "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Email
                </p>

                <p className="mt-1 break-all text-sm text-slate-700">
                  {customer.email || "—"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Phone
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {customer.phone || "Not provided"}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Account
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {getAccountType()}
                </p>
              </div>

              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Customer Since
                </p>

                <p className="mt-1 text-sm text-slate-700">
                  {formatDate(
                    customer.createdAt
                  )}
                </p>
              </div>

            </div>

          </div>


          {/* ADDRESSES */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <div className="flex items-center justify-between">

              <h3 className="text-sm font-semibold text-slate-800">
                Saved Addresses
              </h3>

              <span className="text-[10px] font-medium text-slate-400">
                View only
              </span>

            </div>

            <div className="mt-4 space-y-3">

              {!customer.addresses ||
              customer.addresses.length === 0 ? (
                <div className="rounded-lg bg-slate-50 px-4 py-5 text-center text-xs text-slate-400">
                  No saved addresses
                </div>
              ) : (
                customer.addresses.map(
                  (address) => (
                    <div
                      key={address._id}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-4"
                    >

                      <div className="flex items-start justify-between gap-3">

                        <div>
                          <p className="text-xs font-semibold text-slate-700">
                            {address.name}
                          </p>

                          {address.isDefault && (
                            <span className="mt-1 inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[9px] font-semibold text-emerald-600">
                              Default
                            </span>
                          )}
                        </div>

                      </div>

                      <div className="mt-3 space-y-1 text-xs leading-5 text-slate-500">

                        <p>
                          {address.street}
                        </p>

                        {address.landmark && (
                          <p>
                            {address.landmark}
                          </p>
                        )}

                        <p>
                          {address.city},{" "}
                          {address.state}
                        </p>

                        <p>
                          {address.zip}
                        </p>

                        <p>
                          {address.number}
                        </p>

                      </div>

                    </div>
                  )
                )
              )}

            </div>

          </div>


          {/* WISHLIST */}

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

            <h3 className="text-sm font-semibold text-slate-800">
              Wishlist
            </h3>

            <div className="mt-4">

              {!customer.wishlist ||
              customer.wishlist.length === 0 ? (
                <p className="rounded-lg bg-slate-50 px-4 py-5 text-center text-xs text-slate-400">
                  Wishlist is empty
                </p>
              ) : (
                <div className="space-y-2">

                  {customer.wishlist.map(
                    (product) => (
                      <div
                        key={product._id}
                        className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5"
                      >

                        {product.images?.[0] && (
                          <img
                            src={
                              product.images[0]
                            }
                            alt={
                              product.title
                            }
                            className="h-10 w-10 rounded-lg object-cover"
                          />
                        )}

                        <div className="min-w-0 flex-1">

                          <p className="truncate text-xs font-medium text-slate-700">
                            {product.title}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {formatCurrency(
                              product.price
                            )}
                          </p>

                        </div>

                      </div>
                    )
                  )}

                </div>
              )}

            </div>

          </div>

        </div>


        {/* ===================================================
            RIGHT COLUMN - ORDERS
        =================================================== */}

        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-5 py-4">

            <div className="flex items-center justify-between gap-4">

              <div>

                <h3 className="text-sm font-semibold text-slate-800">
                  Order History
                </h3>

                <p className="mt-1 text-xs text-slate-400">
                  {customer.orders?.length || 0}{" "}
                  total orders
                </p>

              </div>

            </div>

          </div>


          {/* ORDERS */}

          {!customer.orders ||
          customer.orders.length === 0 ? (
            <div className="flex min-h-[300px] items-center justify-center px-6 text-center">

              <div>

                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50">
                  📦
                </div>

                <p className="text-sm font-medium text-slate-600">
                  No orders yet
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  This customer hasn't placed
                  any orders.
                </p>

              </div>

            </div>
          ) : (
            <div className="divide-y divide-slate-100">

              {customer.orders.map(
                (order) => (
                  <div
                    key={order._id}
                    className="p-5 transition hover:bg-slate-50/50"
                  >

                    {/* ORDER TOP */}

                    <div className="flex flex-wrap items-start justify-between gap-4">

                      <div>

                        <div className="flex flex-wrap items-center gap-2">

                          <span className="text-sm font-semibold text-slate-800">
                            #{order._id
                              ?.slice(-8)
                              .toUpperCase()}
                          </span>

                          <span
                            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${getOrderStatusClass(
                              order.orderStatus
                            )}`}
                          >
                            {order.orderStatus}
                          </span>

                        </div>

                        <p className="mt-1 text-[11px] text-slate-400">
                          {formatDateTime(
                            order.createdAt
                          )}
                        </p>

                      </div>


                      <div className="text-right">

                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(
                            order.totalAmount
                          )}
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          {order.paymentMethod ||
                            "Payment"}
                        </p>

                      </div>

                    </div>


                    {/* ORDER ITEMS */}

                    {order.items?.length > 0 && (
                      <div className="mt-4 rounded-xl bg-slate-50 p-3">

                        <div className="space-y-2">

                          {order.items.map(
                            (item, index) => (
                              <div
                                key={
                                  item._id ||
                                  index
                                }
                                className="flex items-center justify-between gap-4"
                              >

                                <div className="min-w-0">

                                  <p className="truncate text-xs font-medium text-slate-700">
                                    {item.title ||
                                      item.name ||
                                      "Product"}
                                  </p>

                                  <p className="mt-0.5 text-[10px] text-slate-400">
                                    Qty:{" "}
                                    {item.quantity ||
                                      1}
                                  </p>

                                </div>

                                <span className="shrink-0 text-xs font-medium text-slate-600">
                                  {formatCurrency(
                                    (item.price ||
                                      0) *
                                      (item.quantity ||
                                        1)
                                  )}
                                </span>

                              </div>
                            )
                          )}

                        </div>

                      </div>
                    )}


                    {/* ORDER META */}

                    <div className="mt-4 flex flex-wrap items-center gap-2">

                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${getPaymentStatusClass(
                          order.paymentStatus
                        )}`}
                      >
                        Payment:{" "}
                        {order.paymentStatus}
                      </span>

                      {order.invoiceNumber && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                          Invoice{" "}
                          {order.invoiceNumber}
                        </span>
                      )}

                      {order.shiprocket
                        ?.awbCode && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-medium text-slate-500">
                          AWB{" "}
                          {
                            order.shiprocket
                              .awbCode
                          }
                        </span>
                      )}

                    </div>

                  </div>
                )
              )}

            </div>
          )}

        </div>

      </div>

    </div>
  );
}