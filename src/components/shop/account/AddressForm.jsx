"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import AccountSidebar from "@/components/shop/account/AccountSidebar";

const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];

export default function AddressFormPage() {
  const router = useRouter();
  const params = useParams();

  const isEdit = params?.id !== undefined;

  const [mounted, setMounted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(isEdit);

  // Pincode states
  const [pincodeLoading, setPincodeLoading] = useState(false);
  const [pincodeMessage, setPincodeMessage] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    number: "",
    street: "",
    city: "",
    state: "",
    zip: "",
    landmark: "",
    isDefault: false,
  });

  // --------------------------------------------------
  // Mount + Page Title
  // --------------------------------------------------

  useEffect(() => {
    setMounted(true);

    document.title = isEdit
      ? "Edit Address | BouncyBucket"
      : "Add New Address | BouncyBucket";
  }, [isEdit]);

  // --------------------------------------------------
  // Fetch Existing Address in Edit Mode
  // --------------------------------------------------

  useEffect(() => {
    if (!mounted || !isEdit) return;

    const fetchCurrentAddress = async () => {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token")
          : null;

      if (!token) {
        setFetching(false);
        return;
      }

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

        if (
          !contentType ||
          !contentType.includes("application/json")
        ) {
          throw new TypeError(
            "Oops, we didn't get JSON from the server!"
          );
        }

        const data = await res.json();

        if (res.ok) {
          const target = data.user.addresses.find(
            (address) => address._id === params.id
          );

          if (target) {
            setForm({
              name: target.name || "",
              email: target.email || "",
              number: target.number || "",
              street: target.street || "",
              city: target.city || "",
              state: target.state || "",
              zip: target.zip || "",
              landmark: target.landmark || "",
              isDefault: target.isDefault || false,
            });
          }
        }
      } catch (err) {
        console.error(
          "Error fetching address details:",
          err
        );
      } finally {
        setFetching(false);
      }
    };

    fetchCurrentAddress();
  }, [mounted, params.id, isEdit]);

  // --------------------------------------------------
  // Automatically Fetch City + State from Pincode
  // --------------------------------------------------

  useEffect(() => {
    const pincode = form.zip.trim();

    // Don't search until exactly 6 digits
    if (
      pincode.length !== 6 ||
      !/^\d{6}$/.test(pincode)
    ) {
      setPincodeMessage("");
      return;
    }

    const fetchPincodeDetails = async () => {
      setPincodeLoading(true);
      setPincodeMessage("");

      try {
        const res = await fetch(
          `https://api.postalpincode.in/pincode/${pincode}`
        );

        const data = await res.json();

        if (
          data?.[0]?.Status === "Success" &&
          data?.[0]?.PostOffice?.length > 0
        ) {
          const postOffice = data[0].PostOffice[0];

          setForm((prev) => ({
            ...prev,
            city: postOffice.District || prev.city,
            state: postOffice.State || prev.state,
          }));

          const count = data[0].PostOffice.length;

          setPincodeMessage(
            `${count} post office${
              count > 1 ? "s" : ""
            } found`
          );
        } else {
          setPincodeMessage("Invalid pincode");

          setForm((prev) => ({
            ...prev,
            city: "",
            state: "",
          }));
        }
      } catch (error) {
        console.error(
          "Pincode lookup failed:",
          error
        );

        setPincodeMessage(
          "Unable to fetch pincode details"
        );
      } finally {
        setPincodeLoading(false);
      }
    };

    fetchPincodeDetails();
  }, [form.zip]);

  // --------------------------------------------------
  // Handle Form Submit
  // --------------------------------------------------

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    const endpoint = isEdit
      ? `${process.env.NEXT_PUBLIC_API_URL}/edit-address/${params.id}`
      : `${process.env.NEXT_PUBLIC_API_URL}/add-address`;

    const method = isEdit ? "PUT" : "POST";

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login again.");
        setLoading(false);
        return;
      }

      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `JWT ${token}`,
        },
        body: JSON.stringify(form),
      });

      const contentType = res.headers.get("content-type");

      let data = {};

      if (
        contentType &&
        contentType.includes("application/json")
      ) {
        data = await res.json();
      }

      if (res.ok) {
        router.push("/account/addresses");
        router.refresh();
      } else {
        alert(
          data.message ||
            "Failed to save address"
        );
      }
    } catch (err) {
      console.error(
        "Error saving address:",
        err
      );

      alert(
        "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------------
  // Prevent Hydration Mismatch
  // --------------------------------------------------

  if (!mounted) {
    return null;
  }

  // --------------------------------------------------
  // Loading Existing Address
  // --------------------------------------------------

  if (fetching) {
    return (
      <div className="loading-state">
        Loading address details...
      </div>
    );
  }

  // --------------------------------------------------
  // Page
  // --------------------------------------------------

  return (
    <div className="account-layout-container">
      <AccountSidebar active="addresses" />

      <main className="account-main-content">

        {/* -------------------------------- */}
        {/* Header */}
        {/* -------------------------------- */}

        <div className="content-header">
          <button
            className="back-link"
            onClick={() =>
              router.push("/account/addresses")
            }
          >
            ←{" "}
            {isEdit
              ? "Cancel Editing"
              : "Back to Addresses"}
          </button>

          <h1>
            {isEdit
              ? "Edit Address"
              : "Add New Address"}
          </h1>
        </div>

        {/* -------------------------------- */}
        {/* Form Card */}
        {/* -------------------------------- */}

        <div className="info-card">
          <form
            onSubmit={handleSubmit}
            className="address-form"
          >

            {/* -------------------------------- */}
            {/* Name + Email */}
            {/* -------------------------------- */}

            <div className="form-row">
              <div className="form-group">
                <label>
                  Receiver's Name*
                </label>

                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      name: e.target.value,
                    })
                  }
                  placeholder="Full Name"
                />
              </div>

              <div className="form-group">
                <label>
                  Email Address*
                </label>

                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      email: e.target.value,
                    })
                  }
                  placeholder="email@example.com"
                />
              </div>
            </div>

            {/* -------------------------------- */}
            {/* Contact + Street */}
            {/* -------------------------------- */}

            <div className="form-row">
              <div className="form-group">
                <label>
                  Contact Number*
                </label>

                <input
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  maxLength={10}
                  inputMode="numeric"
                  value={form.number}
                  onChange={(e) => {
                    const value =
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 10);

                    setForm({
                      ...form,
                      number: value,
                    });
                  }}
                  placeholder="10-digit mobile number"
                />
              </div>

              <div className="form-group">
                <label>
                  House no., Street, Area*
                </label>

                <input
                  type="text"
                  required
                  value={form.street}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      street: e.target.value,
                    })
                  }
                  placeholder="House No. 123, ABC Street"
                />
              </div>
            </div>

            {/* -------------------------------- */}
            {/* Pincode + City */}
            {/* -------------------------------- */}

            <div className="form-row">
              <div className="form-group">
                <label>
                  Pincode*
                </label>

                <input
                  type="text"
                  required
                  pattern="[0-9]{6}"
                  maxLength={6}
                  inputMode="numeric"
                  value={form.zip}
                  onChange={(e) => {
                    const value =
                      e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 6);

                    setForm({
                      ...form,
                      zip: value,
                    });
                  }}
                  placeholder="6-digit pincode"
                />

                {/* Pincode status */}

                {pincodeLoading && (
                  <small className="pincode-status">
                    Fetching location...
                  </small>
                )}

                {!pincodeLoading &&
                  pincodeMessage && (
                    <small
                      className={
                        pincodeMessage ===
                        "Invalid pincode"
                          ? "pincode-status error"
                          : "pincode-status success"
                      }
                    >
                      {pincodeMessage}
                    </small>
                  )}
              </div>

              <div className="form-group">
                <label>
                  Town/City*
                </label>

                <input
                  type="text"
                  required
                  value={form.city}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      city: e.target.value,
                    })
                  }
                  placeholder="Town / City"
                />
              </div>
            </div>

            {/* -------------------------------- */}
            {/* State + Landmark */}
            {/* -------------------------------- */}

            <div className="form-row">
              <div className="form-group">
                <label>
                  State*
                </label>

                <select
                  required
                  value={form.state}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      state: e.target.value,
                    })
                  }
                >
                  <option
                    value=""
                    disabled
                  >
                    Select State
                  </option>

                  {INDIAN_STATES.map(
                    (state) => (
                      <option
                        key={state}
                        value={state}
                      >
                        {state}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="form-group">
                <label>
                  Landmark (Optional)
                </label>

                <input
                  type="text"
                  value={form.landmark}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      landmark: e.target.value,
                    })
                  }
                  placeholder="E.g. Near Big Bazaar"
                />
              </div>
            </div>

            {/* -------------------------------- */}
            {/* Default Address */}
            {/* -------------------------------- */}

            <div className="default-toggle-row">
              <input
                type="checkbox"
                id="isDefault"
                checked={form.isDefault}
                onChange={(e) =>
                  setForm({
                    ...form,
                    isDefault:
                      e.target.checked,
                  })
                }
              />

              <label htmlFor="isDefault">
                Set as default shipping address
              </label>
            </div>

            {/* -------------------------------- */}
            {/* Submit */}
            {/* -------------------------------- */}

            <div className="form-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={loading}
              >
                {loading
                  ? "Saving..."
                  : isEdit
                  ? "Update Address"
                  : "Save Address"}
              </button>
            </div>

          </form>
        </div>
      </main>
    </div>
  );
}