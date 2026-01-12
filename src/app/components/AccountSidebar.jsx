"use client";

import { useRouter, usePathname } from "next/navigation";
import { User, Package, MapPin, Shield } from "lucide-react"; // Using lucide for a modern look

export default function AccountSidebar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { name: "Profile Info", path: "/account", icon: <User size={18} /> },
    { name: "My Orders", path: "/account/orders", icon: <Package size={18} /> },
    { name: "Addresses", path: "/account/addresses", icon: <MapPin size={18} /> },
    { name: "Security", path: "/account/security", icon: <Shield size={18} /> },
  ];

  return (
    <aside className="profile-sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => router.push(item.path)}
            className={`nav-item ${pathname === item.path ? "active" : ""}`}
          >
            <span className="nav-icon">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>
    </aside>
  );
}