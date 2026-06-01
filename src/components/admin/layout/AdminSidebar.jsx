'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { label: 'Orders', path: '/admin/orders', icon: '📦' },
    { label: 'Products', path: '/admin/products', icon: '🍾' },
    { label: 'Customers', path: '/admin/users', icon: '👥' },
    { label: 'Storefront', path: '/admin/settings', icon: '🎨' },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <div className="admin-badge">Admin</div>
        <span className="brand-name">BottleShop</span>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.path} 
              href={item.path} 
              className={`sidebar-link ${isActive ? 'active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
              {isActive && <div className="active-indicator" />}
            </Link>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <Link href="/" className="exit-link">
          ⬅ Back to Shop
        </Link>
      </div>
    </aside>
  );
}