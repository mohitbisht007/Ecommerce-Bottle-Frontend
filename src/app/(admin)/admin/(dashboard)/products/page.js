// src/app/admin/products/page.js
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");

  // ---------------------------------------
  // FETCH PRODUCTS
  // ---------------------------------------

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/products?limit=100`
        );

        const data = await res.json();

        setProducts(data.items || []);
      } catch (err) {
        console.error("Failed to fetch products", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // ---------------------------------------
  // DELETE PRODUCT
  // ---------------------------------------

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/product/delete/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `JWT ${localStorage.getItem("token")}`,
          },
        }
      );

      if (res.ok) {
        setProducts((prev) => prev.filter((product) => product._id !== id));
      } else {
        alert("Failed to delete product");
      }
    } catch (err) {
      console.error("Delete product error:", err);
      alert("Something went wrong while deleting the product");
    }
  };

  // ---------------------------------------
  // INVENTORY STATS
  // ---------------------------------------

  const totalProducts = products.length;

  const inStockProducts = products.filter(
    (product) => Number(product.stock || 0) > 5
  ).length;

  const lowStockProducts = products.filter((product) => {
    const stock = Number(product.stock || 0);

    return stock > 0 && stock <= 5;
  }).length;

  const outOfStockProducts = products.filter(
    (product) => Number(product.stock || 0) <= 0
  ).length;

  // ---------------------------------------
  // CATEGORY LIST
  // ---------------------------------------

  const categories = [
    "All",
    ...new Set(
      products
        .map((product) => product.category)
        .filter(Boolean)
    ),
  ];

  // ---------------------------------------
  // FILTER PRODUCTS
  // ---------------------------------------

  const filteredProducts = products.filter((product) => {
    const searchValue = search.trim().toLowerCase();

    const matchesSearch =
      !searchValue ||
      product.title?.toLowerCase().includes(searchValue) ||
      product.category?.toLowerCase().includes(searchValue) ||
      product.sku?.toLowerCase().includes(searchValue);

    const matchesCategory =
      category === "All" ||
      product.category?.toLowerCase() === category.toLowerCase();

    return matchesSearch && matchesCategory;
  });

  // ---------------------------------------
  // CLEAR FILTERS
  // ---------------------------------------

  const clearFilters = () => {
    setSearch("");
    setCategory("All");
  };

  return (
    <div className="w-full max-w-[1400px] mx-auto space-y-6">

      {/* =====================================================
          PAGE HEADER
      ===================================================== */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">

        <div className="min-w-0">

          <div className="mb-2 flex items-center gap-2">

            <span className="h-2 w-2 rounded-full bg-emerald-500" />

            <span className="text-xs font-semibold uppercase tracking-[0.15em] text-gray-400">
              Inventory Management
            </span>

          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Product Inventory
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your bottles, pricing, stock levels and product status.
          </p>

        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gray-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-gray-800"
        >
          <span className="text-lg leading-none">
            +
          </span>

          Add New Product
        </Link>

      </div>


      {/* =====================================================
          INVENTORY STATS
      ===================================================== */}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">

        {/* TOTAL PRODUCTS */}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Total Products
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {loading ? "—" : totalProducts}
              </p>

            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-lg">
              📦
            </div>

          </div>

          <p className="mt-3 text-xs text-gray-500">
            Products in your catalog
          </p>

        </div>


        {/* IN STOCK */}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                In Stock
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {loading ? "—" : inStockProducts}
              </p>

            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg">
              ✓
            </div>

          </div>

          <p className="mt-3 text-xs text-emerald-600">
            More than 5 units
          </p>

        </div>


        {/* LOW STOCK */}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Low Stock
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {loading ? "—" : lowStockProducts}
              </p>

            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-lg">
              ⚠️
            </div>

          </div>

          <p className="mt-3 text-xs text-amber-600">
            5 units or fewer
          </p>

        </div>


        {/* OUT OF STOCK */}

        <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

          <div className="flex items-start justify-between gap-3">

            <div className="min-w-0">

              <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
                Out of Stock
              </p>

              <p className="mt-2 text-2xl font-bold text-gray-900">
                {loading ? "—" : outOfStockProducts}
              </p>

            </div>

            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-lg">
              !
            </div>

          </div>

          <p className="mt-3 text-xs text-red-500">
            Needs restocking
          </p>

        </div>

      </div>


      {/* =====================================================
          SEARCH + FILTER
      ===================================================== */}

      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">

          {/* SEARCH */}

          <div className="relative min-w-0 flex-1">

            <svg
              className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-4-4" />
            </svg>

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by product name, category or SKU..."
              className="h-12 w-full rounded-xl border border-gray-200 bg-gray-50 pl-12 pr-10 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/5"
            />

            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-400 transition hover:bg-gray-200 hover:text-gray-700"
                aria-label="Clear search"
              >
                ✕
              </button>
            )}

          </div>


          {/* CATEGORY */}

          <div className="relative w-full lg:w-56">

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="h-12 w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 px-4 pr-10 text-sm font-medium text-gray-700 outline-none transition focus:border-gray-900 focus:bg-white focus:ring-2 focus:ring-gray-900/5"
            >
              {categories.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All Categories" : item}
                </option>
              ))}
            </select>

            <svg
              className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>

          </div>

        </div>


        {/* RESULTS INFO */}

        <div className="mt-3 flex flex-col gap-2 text-xs text-gray-400 sm:flex-row sm:items-center sm:justify-between">

          <p>
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {filteredProducts.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700">
              {products.length}
            </span>{" "}
            products
          </p>

          {(search || category !== "All") && (
            <button
              type="button"
              onClick={clearFilters}
              className="font-medium text-gray-700 transition hover:text-black"
            >
              Clear filters
            </button>
          )}

        </div>

      </div>


      {/* =====================================================
          PRODUCT CONTAINER
      ===================================================== */}

      <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">


        {/* ===================================================
            DESKTOP / TABLET TABLE
        =================================================== */}

        <div className="hidden md:block">

          <table className="w-full table-fixed text-left">

            <thead>

              <tr className="border-b border-gray-100 bg-gray-50/70">

                <th className="w-[34%] px-4 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400 lg:px-5">
                  Product
                </th>

                <th className="w-[15%] px-3 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Category
                </th>

                <th className="w-[12%] px-3 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Price
                </th>

                <th className="w-[10%] px-3 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Stock
                </th>

                <th className="w-[17%] px-3 py-4 text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Status
                </th>

                <th className="w-[12%] px-3 py-4 text-right text-xs font-semibold uppercase tracking-wider text-gray-400">
                  Actions
                </th>

              </tr>

            </thead>


            <tbody className="divide-y divide-gray-100">

              {/* LOADING */}

              {loading && (
                <tr>

                  <td colSpan="6" className="px-5 py-16 text-center">

                    <div className="flex flex-col items-center justify-center">

                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

                      <p className="mt-3 text-sm text-gray-500">
                        Loading products...
                      </p>

                    </div>

                  </td>

                </tr>
              )}


              {/* EMPTY */}

              {!loading && filteredProducts.length === 0 && (
                <tr>

                  <td colSpan="6" className="px-5 py-16 text-center">

                    <div className="mx-auto flex max-w-sm flex-col items-center">

                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                        🔍
                      </div>

                      <h3 className="mt-4 text-sm font-semibold text-gray-900">
                        No products found
                      </h3>

                      <p className="mt-1 text-sm text-gray-500">
                        Try changing your search or category filter.
                      </p>

                      <button
                        type="button"
                        onClick={clearFilters}
                        className="mt-4 text-sm font-semibold text-gray-900 underline underline-offset-4"
                      >
                        Clear filters
                      </button>

                    </div>

                  </td>

                </tr>
              )}


              {/* PRODUCTS */}

              {!loading &&
                filteredProducts.length > 0 &&
                filteredProducts.map((product) => {

                  const stock = Number(product.stock || 0);

                  return (
                    <tr
                      key={product._id}
                      className="transition hover:bg-gray-50/70"
                    >

                      {/* PRODUCT */}

                      <td className="px-4 py-4 lg:px-5">

                        <div className="flex min-w-0 items-center gap-3">

                          <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">

                            <img
                              src={
                                product.thumbnail ||
                                "/placeholder.png"
                              }
                              alt={product.title || "Product"}
                              className="h-full w-full object-cover"
                            />

                          </div>

                          <div className="min-w-0">

                            <p className="truncate text-sm font-semibold text-gray-900">
                              {product.title}
                            </p>

                            {product.sku && (
                              <p className="mt-0.5 truncate text-xs text-gray-400">
                                SKU: {product.sku}
                              </p>
                            )}

                          </div>

                        </div>

                      </td>


                      {/* CATEGORY */}

                      <td className="px-3 py-4">

                        <span className="inline-block max-w-full truncate rounded-lg bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
                          {product.category || "—"}
                        </span>

                      </td>


                      {/* PRICE */}

                      <td className="px-3 py-4">

                        <span className="whitespace-nowrap text-sm font-semibold text-gray-900">
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString("en-IN")}
                        </span>

                      </td>


                      {/* STOCK */}

                      <td className="px-3 py-4">

                        <span
                          className={`text-sm font-semibold ${
                            stock <= 0
                              ? "text-red-600"
                              : stock <= 5
                              ? "text-amber-600"
                              : "text-gray-900"
                          }`}
                        >
                          {stock}
                        </span>

                      </td>


                      {/* STATUS */}

                      <td className="px-3 py-4">

                        {stock <= 0 ? (

                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-600">

                            <span className="h-1.5 w-1.5 rounded-full bg-red-500" />

                            Out of Stock

                          </span>

                        ) : stock <= 5 ? (

                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-600">

                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />

                            Low Stock

                          </span>

                        ) : (

                          <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">

                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />

                            In Stock

                          </span>

                        )}

                      </td>


                      {/* ACTIONS */}

                      <td className="px-3 py-4">

                        <div className="flex justify-end gap-1.5">

                          <Link
                            href={`/admin/products/edit/${product._id}`}
                            title="Edit product"
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm transition hover:border-gray-300 hover:bg-gray-50"
                          >
                            ✏️
                          </Link>

                          <button
                            type="button"
                            title="Delete product"
                            onClick={() =>
                              handleDelete(product._id)
                            }
                            className="flex h-8 w-8 items-center justify-center rounded-lg border border-gray-200 bg-white text-sm transition hover:border-red-200 hover:bg-red-50"
                          >
                            🗑️
                          </button>

                        </div>

                      </td>

                    </tr>
                  );
                })}

            </tbody>

          </table>

        </div>


        {/* ===================================================
            MOBILE PRODUCT CARDS
        =================================================== */}

        <div className="divide-y divide-gray-100 md:hidden">

          {/* LOADING */}

          {loading && (
            <div className="flex flex-col items-center justify-center px-5 py-16">

              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />

              <p className="mt-3 text-sm text-gray-500">
                Loading products...
              </p>

            </div>
          )}


          {/* EMPTY */}

          {!loading && filteredProducts.length === 0 && (
            <div className="flex flex-col items-center px-5 py-16 text-center">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gray-100 text-2xl">
                🔍
              </div>

              <h3 className="mt-4 text-sm font-semibold text-gray-900">
                No products found
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Try changing your search or category filter.
              </p>

              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 text-sm font-semibold text-gray-900 underline underline-offset-4"
              >
                Clear filters
              </button>

            </div>
          )}


          {/* PRODUCTS */}

          {!loading &&
            filteredProducts.length > 0 &&
            filteredProducts.map((product) => {

              const stock = Number(product.stock || 0);

              return (
                <div
                  key={product._id}
                  className="p-4"
                >

                  {/* PRODUCT INFORMATION */}

                  <div className="flex items-start gap-3">

                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">

                      <img
                        src={
                          product.thumbnail ||
                          "/placeholder.png"
                        }
                        alt={product.title || "Product"}
                        className="h-full w-full object-cover"
                      />

                    </div>


                    <div className="min-w-0 flex-1">

                      <div className="flex items-start justify-between gap-2">

                        <div className="min-w-0">

                          <h3 className="truncate text-sm font-semibold text-gray-900">
                            {product.title}
                          </h3>

                          {product.sku && (
                            <p className="mt-0.5 truncate text-xs text-gray-400">
                              SKU: {product.sku}
                            </p>
                          )}

                        </div>

                        <span className="shrink-0 text-sm font-bold text-gray-900">
                          ₹
                          {Number(
                            product.price || 0
                          ).toLocaleString("en-IN")}
                        </span>

                      </div>


                      <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">

                        <span className="max-w-full truncate rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-medium text-gray-600">
                          {product.category ||
                            "Uncategorized"}
                        </span>


                        {stock <= 0 ? (

                          <span className="rounded-full bg-red-50 px-2 py-1 text-[11px] font-semibold text-red-600">
                            Out of Stock
                          </span>

                        ) : stock <= 5 ? (

                          <span className="rounded-full bg-amber-50 px-2 py-1 text-[11px] font-semibold text-amber-600">
                            Low Stock
                          </span>

                        ) : (

                          <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-600">
                            In Stock
                          </span>

                        )}

                      </div>

                    </div>

                  </div>


                  {/* MOBILE FOOTER */}

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">

                    <div>

                      <p className="text-[11px] uppercase tracking-wide text-gray-400">
                        Stock
                      </p>

                      <p
                        className={`mt-0.5 text-sm font-semibold ${
                          stock <= 0
                            ? "text-red-600"
                            : stock <= 5
                            ? "text-amber-600"
                            : "text-gray-900"
                        }`}
                      >
                        {stock} units
                      </p>

                    </div>


                    <div className="flex gap-2">

                      <Link
                        href={`/admin/products/edit/${product._id}`}
                        className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition hover:bg-gray-50"
                      >
                        ✏️
                        <span>Edit</span>
                      </Link>

                      <button
                        type="button"
                        onClick={() =>
                          handleDelete(product._id)
                        }
                        className="flex h-9 items-center gap-1.5 rounded-lg border border-gray-200 px-3 text-xs font-semibold text-gray-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                      >
                        🗑️
                        <span>Delete</span>
                      </button>

                    </div>

                  </div>

                </div>
              );
            })}

        </div>

      </div>

    </div>
  );
}