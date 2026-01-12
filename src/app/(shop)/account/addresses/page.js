"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AccountSidebar from "@/app/components/AccountSidebar";

export default function AddressPage() {
  const router = useRouter();
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/me`, {
          headers: { Authorization: `JWT ${token}` },
        });
        const data = await res.json();
        if (res.ok) {
          // Assuming your user schema now returns addresses as an array
          setAddresses(data.user.addresses || []);
        }
      } catch (err) {
        console.error("Failed to fetch addresses");
      } finally {
        setLoading(false);
      }
    };
    fetchAddresses();
  }, [router]);

  console.log(addresses)

  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to remove this address?")) return;

    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/remove-address/${addressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const data = await res.json();
        setAddresses(data.addresses); // Update local state with new list
      }
    } catch (err) {
      alert("Error removing address");
    }
  };

  return (
    <div className="profile-container">
      {/* Sidebar - Consistent with Profile & Security */}
      <AccountSidebar />

      <main className="profile-content">
        <div className="content-header">
          <h1>Saved Addresses</h1>
          <p>Manage your shipping addresses for a faster checkout.</p>
        </div>

        <div className="address-grid">
          {/* Add New Address Card */}
          <button className="add-address-card" onClick={() => router.push('/account/addresses/new')}>
            <span className="plus-icon">+</span>
            <span>Add New Address</span>
          </button>

          {loading ? (
            <div className="loader">Loading...</div>
          ) : addresses.length === 0 ? (
            <div className="empty-address">No addresses saved yet.</div>
          ) : (
            addresses.map((addr, index) => (
              <div key={index} className="address-card">
                {index === 0 && <span className="default-badge">Default</span>}
                <div className="address-details">
                  <p className="address-name"><strong>{addr.name}</strong> <span className="addr-tag">Home</span></p>
                  <p className="address-text">{addr.street}, {addr.city}, {addr.state} - {addr.zip}</p>
                  <p className="address-phone">Phone: {addr.number}</p>
                  {addr.landmark && <p className="address-landmark">📍 {addr.landmark}</p>}
                </div>
                <div className="address-actions">
                  <Link href={`/account/addresses/edit/${addr._id}`} className="addr-btn edit">
                    Edit
                  </Link>
                  <button className="addr-btn delete" onClick={() => handleDelete(addr._id)}>
                    Remove
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  );
}