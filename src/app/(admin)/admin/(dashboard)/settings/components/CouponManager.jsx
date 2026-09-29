"use client";

import { useState, useEffect } from "react";
import {
  Plus,
  Trash2,
  Pencil,
  TicketPercent,
  X,
  Save,
  CheckCircle2,
  XCircle,
  Users,
  CalendarDays,
} from "lucide-react";

export default function CouponManager() {
  const [coupons, setCoupons] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  const emptyForm = {
    code: "",
    description: "",
    discountType: "percentage",
    discountValue: "",
    minimumItems: 1,
    minimumCartValue: 0,
    maximumDiscount: "",
    usageLimit: "",
    perUserLimit: 1,
    startDate: "",
    expiryDate: "",
    isActive: true,
  };

  const [form, setForm] = useState(emptyForm);

  // =========================
  // FETCH COUPONS
  // =========================

  const fetchCoupons = async () => {
    try {
      setFetching(true);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/coupons/admin`,
        {
          headers: {
            Authorization: `JWT ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();

      if (res.ok) {
        setCoupons(data.coupons || []);
      } else {
        alert(data.message || "Failed to fetch coupons");
      }
    } catch (err) {
      console.error("FETCH COUPONS ERROR:", err);
      alert("Unable to load coupons");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  // =========================
  // FORM HELPERS
  // =========================

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingCoupon(null);
  };

  const openCreateModal = () => {
    resetForm();
    setShowModal(true);
  };

  const openEditModal = (coupon) => {
    setEditingCoupon(coupon);

    setForm({
      code: coupon.code || "",
      description: coupon.description || "",
      discountType: coupon.discountType || "percentage",
      discountValue: coupon.discountValue ?? "",
      minimumItems: coupon.minimumItems ?? 1,
      minimumCartValue: coupon.minimumCartValue ?? 0,
      maximumDiscount: coupon.maximumDiscount ?? "",
      usageLimit: coupon.usageLimit ?? "",
      perUserLimit: coupon.perUserLimit ?? 1,
      startDate: coupon.startDate
        ? new Date(coupon.startDate).toISOString().slice(0, 16)
        : "",
      expiryDate: coupon.expiryDate
        ? new Date(coupon.expiryDate).toISOString().slice(0, 16)
        : "",
      isActive: coupon.isActive !== false,
    });

    setShowModal(true);
  };

  const closeModal = () => {
    if (loading) return;

    setShowModal(false);
    resetForm();
  };

  // =========================
  // CREATE / UPDATE
  // =========================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.code.trim()) {
      alert("Coupon code is required");
      return;
    }

    if (!form.discountValue || Number(form.discountValue) <= 0) {
      alert("Enter a valid discount value");
      return;
    }

    if (
      form.discountType === "percentage" &&
      Number(form.discountValue) > 100
    ) {
      alert("Percentage discount cannot exceed 100%");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        code: form.code.trim().toUpperCase(),
        description: form.description.trim(),
        discountType: form.discountType,
        discountValue: Number(form.discountValue),
        minimumItems: Number(form.minimumItems) || 1,
        minimumCartValue: Number(form.minimumCartValue) || 0,
        maximumDiscount:
          form.maximumDiscount === ""
            ? null
            : Number(form.maximumDiscount),
        usageLimit:
          form.usageLimit === "" ? null : Number(form.usageLimit),
        perUserLimit: Number(form.perUserLimit) || 1,
        startDate: form.startDate || null,
        expiryDate: form.expiryDate || null,
        isActive: form.isActive,
      };

      const url = editingCoupon
        ? `${process.env.NEXT_PUBLIC_API_URL}/coupons/admin/${editingCoupon._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/coupons/admin`;

      const res = await fetch(url, {
        method: editingCoupon ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to save coupon");
      }

      setShowModal(false);
      resetForm();
      fetchCoupons();
    } catch (err) {
      console.error("SAVE COUPON ERROR:", err);
      alert(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // =========================
  // DELETE
  // =========================

  const handleDelete = async (id) => {
    if (
      !confirm(
        "Delete this coupon?\n\nIf this coupon has already been used by customers, consider deactivating it instead."
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/coupons/admin/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `JWT ${localStorage.getItem("token")}`,
          },
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to delete coupon");
      }

      fetchCoupons();
    } catch (err) {
      console.error("DELETE COUPON ERROR:", err);
      alert(err.message || "Unable to delete coupon");
    }
  };

  // =========================
  // TOGGLE STATUS
  // =========================

  const toggleStatus = async (coupon) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/coupons/admin/${coupon._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `JWT ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            isActive: !coupon.isActive,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Failed to update coupon");
      }

      fetchCoupons();
    } catch (err) {
      console.error("TOGGLE COUPON ERROR:", err);
      alert(err.message || "Unable to update coupon");
    }
  };

  // =========================
  // DISPLAY HELPERS
  // =========================

  const formatDate = (date) => {
    if (!date) return "No expiry";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getDiscountText = (coupon) => {
    if (coupon.discountType === "percentage") {
      return `${coupon.discountValue}% OFF`;
    }

    return `₹${coupon.discountValue} OFF`;
  };

  return (
    <div className="space-y-6">
      {/* ================= HEADER ================= */}

      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                <TicketPercent size={17} />
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Coupons
                </h3>

                <p className="text-xs text-slate-500 mt-0.5">
                  Create and manage private promotional codes
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg shadow-sm transition"
          >
            <Plus size={15} />
            Add Coupon
          </button>
        </div>

        <div className="border-t border-slate-100 px-5 py-3 bg-slate-50/70">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Coupons
            </span>

            <span className="text-xs font-bold text-slate-700 bg-white border border-slate-200 px-2.5 py-1 rounded-full">
              {coupons.length}
            </span>
          </div>
        </div>
      </div>

      {/* ================= COUPON LIST ================= */}

      {fetching ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center">
          <div className="mx-auto w-6 h-6 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          <p className="text-xs text-slate-500 mt-3">
            Loading coupons...
          </p>
        </div>
      ) : coupons.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-slate-100 flex items-center justify-center text-slate-500">
            <TicketPercent size={22} />
          </div>

          <h4 className="text-sm font-bold text-slate-900 mt-4">
            No coupons yet
          </h4>

          <p className="text-xs text-slate-500 mt-1">
            Create your first private promotional coupon.
          </p>

          <button
            onClick={openCreateModal}
            className="mt-5 inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2.5 rounded-lg"
          >
            <Plus size={14} />
            Create Coupon
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {coupons.map((coupon) => (
            <div
              key={coupon._id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-slate-300 transition-all"
            >
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Coupon identity */}

                <div className="flex items-center gap-3 min-w-0 lg:w-64">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
                    <TicketPercent size={19} />
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-black text-slate-900 font-mono">
                        {coupon.code}
                      </h4>

                      {coupon.isActive ? (
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-1 rounded">
                          <CheckCircle2 size={10} />
                          Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[9px] font-bold uppercase text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-1 rounded">
                          <XCircle size={10} />
                          Inactive
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 truncate mt-1">
                      {coupon.description || "No description"}
                    </p>
                  </div>
                </div>

                {/* Discount */}

                <div className="lg:w-32">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Discount
                  </p>

                  <p className="text-sm font-black text-slate-900 mt-1">
                    {getDiscountText(coupon)}
                  </p>
                </div>

                {/* Condition */}

                <div className="lg:w-40">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Condition
                  </p>

                  <p className="text-xs font-bold text-slate-700 mt-1">
                    {coupon.minimumItems > 1
                      ? `${coupon.minimumItems}+ bottles`
                      : "No item minimum"}
                  </p>

                  {coupon.minimumCartValue > 0 && (
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Min. ₹{coupon.minimumCartValue}
                    </p>
                  )}
                </div>

                {/* Usage */}

                <div className="lg:w-32">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Usage
                  </p>

                  <p className="flex items-center gap-1 text-xs font-bold text-slate-700 mt-1">
                    <Users size={12} />
                    {coupon.usedCount || 0}
                    {coupon.usageLimit !== null &&
                      coupon.usageLimit !== undefined
                      ? ` / ${coupon.usageLimit}`
                      : " / ∞"}
                  </p>
                </div>

                {/* Expiry */}

                <div className="flex-1">
                  <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400">
                    Expiry
                  </p>

                  <p className="flex items-center gap-1 text-xs font-bold text-slate-700 mt-1">
                    <CalendarDays size={12} />
                    {formatDate(coupon.expiryDate)}
                  </p>
                </div>

                {/* Actions */}

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleStatus(coupon)}
                    className={`px-3 py-2.5 border rounded-lg text-[10px] font-bold transition ${
                      coupon.isActive
                        ? "border-amber-200 text-amber-700 hover:bg-amber-50"
                        : "border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                    }`}
                  >
                    {coupon.isActive ? "Deactivate" : "Activate"}
                  </button>

                  <button
                    onClick={() => openEditModal(coupon)}
                    className="p-2.5 border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50 rounded-lg transition"
                    title="Edit coupon"
                  >
                    <Pencil size={14} />
                  </button>

                  <button
                    onClick={() => handleDelete(coupon._id)}
                    className="p-2.5 border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 rounded-lg transition"
                    title="Delete coupon"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ================= CREATE / EDIT MODAL ================= */}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/50 backdrop-blur-sm">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}

            <header className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-slate-900 text-white flex items-center justify-center">
                  {editingCoupon ? (
                    <Pencil size={16} />
                  ) : (
                    <Plus size={16} />
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    {editingCoupon ? "Edit Coupon" : "Create Coupon"}
                  </h3>

                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Configure promotional rules and limits
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-white transition"
              >
                <X size={17} />
              </button>
            </header>

            {/* Form */}

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              {/* Code + Description */}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Coupon Code
                  </label>

                  <input
                    name="code"
                    value={form.code}
                    onChange={handleChange}
                    required
                    disabled={!!editingCoupon}
                    placeholder="BOTTLE20"
                    className="w-full text-xs font-mono uppercase border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 disabled:bg-slate-50 disabled:text-slate-400"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                    Description
                  </label>

                  <input
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    placeholder="20% off on 2+ bottles"
                    className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                  />
                </div>
              </div>

              {/* Discount */}

              <div className="border-t border-slate-100 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Discount
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Discount Type
                    </label>

                    <select
                      name="discountType"
                      value={form.discountType}
                      onChange={handleChange}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    >
                      <option value="percentage">
                        Percentage (%)
                      </option>
                      <option value="fixed">Fixed Amount (₹)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Discount Value
                    </label>

                    <input
                      name="discountValue"
                      type="number"
                      min="0"
                      max={
                        form.discountType === "percentage"
                          ? "100"
                          : undefined
                      }
                      value={form.discountValue}
                      onChange={handleChange}
                      required
                      placeholder={
                        form.discountType === "percentage"
                          ? "20"
                          : "200"
                      }
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Conditions */}

              <div className="border-t border-slate-100 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Conditions
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Minimum Bottles
                    </label>

                    <input
                      name="minimumItems"
                      type="number"
                      min="1"
                      value={form.minimumItems}
                      onChange={handleChange}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Minimum Cart Value
                    </label>

                    <input
                      name="minimumCartValue"
                      type="number"
                      min="0"
                      value={form.minimumCartValue}
                      onChange={handleChange}
                      placeholder="0"
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Maximum Discount
                    </label>

                    <input
                      name="maximumDiscount"
                      type="number"
                      min="0"
                      value={form.maximumDiscount}
                      onChange={handleChange}
                      placeholder="No limit"
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />

                    <p className="text-[9px] text-slate-400 mt-1">
                      Useful for percentage coupons.
                    </p>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Per User Limit
                    </label>

                    <input
                      name="perUserLimit"
                      type="number"
                      min="1"
                      value={form.perUserLimit}
                      onChange={handleChange}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>
                </div>
              </div>

              {/* Usage */}

              <div className="border-t border-slate-100 pt-5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-3">
                  Usage & Validity
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Total Usage Limit
                    </label>

                    <input
                      name="usageLimit"
                      type="number"
                      min="1"
                      value={form.usageLimit}
                      onChange={handleChange}
                      placeholder="Unlimited"
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Start Date
                    </label>

                    <input
                      name="startDate"
                      type="datetime-local"
                      value={form.startDate}
                      onChange={handleChange}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                      Expiry Date
                    </label>

                    <input
                      name="expiryDate"
                      type="datetime-local"
                      value={form.expiryDate}
                      onChange={handleChange}
                      className="w-full text-xs border border-slate-200 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                    />
                  </div>

                  <div className="flex items-end">
                    <label className="flex items-center gap-2 cursor-pointer border border-slate-200 rounded-lg px-3 py-2.5 w-full">
                      <input
                        name="isActive"
                        type="checkbox"
                        checked={form.isActive}
                        onChange={handleChange}
                        className="w-4 h-4 accent-slate-900"
                      />

                      <span className="text-xs font-bold text-slate-700">
                        Coupon Active
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Actions */}

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={loading}
                  className="px-4 py-2.5 text-xs font-bold border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  {loading ? (
                    <>
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={14} />
                      {editingCoupon ? "Save Changes" : "Create Coupon"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}