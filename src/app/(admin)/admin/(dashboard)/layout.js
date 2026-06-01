"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminTopbar from "@/components/admin/layout/AdminTopbar";

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    const token = localStorage.getItem("adminToken");

    // 1. If trying to access any admin sub-route without credentials
    if (pathname !== "/admin" && (!token || isAdmin !== "true")) {
      router.replace("/admin");
    } 
    // 2. If a regular user tries to sneak in (optional if role is strictly checked)
    else {
      setAuthorized(true);
    }
  }, [pathname, router]);

  // If it's the login page, just show the login page
  if (pathname === "/admin") {
    return <>{children}</>;
  }

  // While checking auth, show a clean loader so the sidebar doesn't "flicker"
  if (!authorized) {
    return (
      <div className="admin-loader-screen">
        <div className="admin-spinner"></div>
        <p>Verifying Authority...</p>
      </div>
    );
  }

  return (
    <div className="admin-container">
      <AdminSidebar />
      <div className="admin-main-wrapper">
        <AdminTopbar />
        <main className="admin-content-area">
          {children}
        </main>
      </div>
    </div>
  );
}