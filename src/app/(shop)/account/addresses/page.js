"use client";

export const dynamic = "force-dynamic";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AccountSidebar from "@/app/components/AccountSidebar";

export default function AddressPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mount + title
  useEffect(() => {
    setMounted(true);
    document.title = "Saved Addresses | BouncyBucket";
  }, []);

  // Fetch addresses (client-only, guarded)
  useEffect(() => {
    if (!mounted) return;

    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      router.replace("/login");
      return;
    }

    const fetchAddresses = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/me`,
          {
            headers: {
              Authorization: `JWT ${token}`,
            },
          }
        );

        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
          throw new Error("Non-JSON response");
        }

        const data = await res.json();

        if (res.ok) {
          setAddresses(data?.user?.addresses || []);
        }
      } catch (error) {
        console.error("Failed to fetch addresses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [mounted, router]);

  // Delete address
  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure you want to remove this address?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/remove-address/${addressId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `JWT ${token}`,
          },
        }
      );

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) {
        throw new Error("Non-JSON response");
      }

      const data = await res.json();

      if (res.ok) {
        setAddresses(data.addresses || []);
      } else {
        alert(data.message || "Error removing address");
      }
    } catch (error) {
      alert("Error removing address");
    }
  };

  // Prevent hydration mismatch
  if (!mounted) return null;

  return (
    <div className="profile-container">
      <AccountSidebar active="addresses" />

      <main className="profile-content">
        <div className="content-header">
          <h1>Saved Addresses</h1>
          <p>Manage your shipping addresses for a faster checkout.</p>
        </div>

        <div className="address-grid">
          {/* Add New Address */}
          <button
            className="add-address-card"
            onClick={() => router.push("/account/addresses/new")}
            aria-label="Add a new shipping address"
          >
            <span className="plus-icon">+</span>
            <span>Add New Address</span>
          </button>

          {loading ? (
            <div className="address-skeleton-wrapper">
              <div className="loader">Loading your addresses...</div>
            </div>
          ) : addresses.length === 0 ? (
            <div className="empty-address-state">
              <p>No addresses saved yet.</p>
            </div>
          ) : (
            addresses.map((addr, index) => (
              <div key={addr._id} className="address-card">
                {index === 0 && (
                  <span className="default-badge">Default</span>
                )}

                <div className="address-details">
                  <p className="address-name">
                    <strong>{addr.name}</strong>
                  </p>

                  <p className="address-text">
                    {addr.street}, {addr.city}
                    <br />
                    {addr.state} - {addr.zip}
                  </p>

                  <p className="address-phone">📞 {addr.number}</p>

                  {addr.landmark && (
                    <p className="address-landmark">📍 {addr.landmark}</p>
                  )}
                </div>

                <div className="address-actions">
                  <Link
                    href={`/account/addresses/edit/${addr._id}`}
                    className="addr-btn edit"
                  >
                    Edit
                  </Link>

                  <button
                    className="addr-btn delete"
                    onClick={() => handleDelete(addr._id)}
                  >
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
