// src/app/admin/products/page.js
"use client";
import { useState, useEffect } from "react";
import Link from "next/link";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch products from your API
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?limit=100`);
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

  console.log(products)

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/product/delete/${id}`, {
        method: "DELETE",
        headers: {
          "Authorization": `JWT ${localStorage.getItem("token")}`
        }
      });

      if (res.ok) {
        // Remove from local state so it disappears instantly
        setProducts(products.filter(p => p._id !== id));
      } else {
        alert("Failed to delete");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="admin-products-container">
      <div className="admin-page-header">
        <div>
          <h1>Product Inventory</h1>
          <p>Manage your bottles, stock levels, and pricing.</p>
        </div>
        <Link href="/admin/products/new" className="admin-primary-btn">
          + Add New Product
        </Link>
      </div>

      <div className="admin-table-card">
        <div className="table-filters">
          <input type="text" placeholder="Search product name..." className="table-search" />
          <select className="table-select">
            <option>All Categories</option>
            <option>Steel</option>
            <option>Glass</option>
          </select>
        </div>

        <table className="admin-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="7">Loading products...</td></tr>
            ) : products.map((product) => (
              <tr key={product._id}>
                <td>
                  <img src={product.thumbnail || '/placeholder.png'} alt="" className="table-img" />
                </td>
                <td><strong>{product.title}</strong></td>
                <td>{product.category}</td>
                <td>₹{product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <span className={`status-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                    {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td>
                  <div className="table-actions">
                    <Link href={`/admin/products/edit/${product._id}`} className="action-link edit">✏️</Link>
                    <button 
                      className="action-btn delete" 
                      onClick={() => handleDelete(product._id)} 
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}