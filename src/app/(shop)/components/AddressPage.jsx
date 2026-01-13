"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AccountSidebar from "@/app/components/AccountSidebar";

export default function AddressPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setMounted(true);
    document.title = "Saved Addresses | BouncyBucket";
  }, []);

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
            headers: { Authorization: `JWT ${token}` },
          }
        );

        const contentType = res.headers.get("content-type");
        if (!contentType?.includes("application/json")) return;

        const data = await res.json();
        if (res.ok) {
          setAddresses(data?.user?.addresses || []);
        }
      } catch (err) {
        console.error("Failed to fetch addresses", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAddresses();
  }, [mounted, router]);

  const handleDelete = async (addressId) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const token = localStorage.getItem("token");

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/remove-address/${addressId}`,
        {
          method: "DELETE",
          headers: { Authorization: `JWT ${token}` },
        }
      );

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) return;

      const data = await res.json();

      if (res.ok) {
        setAddresses(data.addresses || []);
      } else {
        alert(data.message || "Failed to delete");
      }
    } catch {
      alert("Error deleting address");
    }
  };

  if (!mounted) return null;

  return (
    <div className="profile-container">
      <AccountSidebar active="addresses" />

      <main className="profile-content">
        <div className="content-header">
          <h1>Saved Addresses</h1>
          <p>Manage your shipping addresses.</p>
        </div>

        <div className="address-grid">
          <button
            className="add-address-card"
            onClick={() => router.push("/account/addresses/new")}
          >
            <span className="plus-icon">+</span>
            <span>Add New Address</span>
          </button>

          {loading ? (
            <div>Loading...</div>
          ) : addresses.length === 0 ? (
            <p>No addresses saved.</p>
          ) : (
            addresses.map((addr, i) => (
              <div key={addr._id} className="address-card">
                {i === 0 && <span className="default-badge">Default</span>}

                <p><strong>{addr.name}</strong></p>
                <p>{addr.street}, {addr.city}</p>
                <p>{addr.state} - {addr.zip}</p>

                <div className="address-actions">
                  <Link href={`/account/addresses/edit/${addr._id}`}>
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(addr._id)}>
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
