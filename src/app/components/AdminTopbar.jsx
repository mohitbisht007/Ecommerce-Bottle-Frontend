'use client';

export default function AdminTopbar() {
  return (
    <header className="admin-topbar">
      <div className="topbar-left">
        <div className="search-wrapper">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search orders, products..." />
        </div>
      </div>

      <div className="topbar-right">
        <div className="notification-bell">
          🔔 <span className="notif-dot"></span>
        </div>
        <div className="admin-user-info">
          <div className="admin-text">
            <span className="name">Mohit Kumar</span>
            <span className="role">Super Admin</span>
          </div>
          <div className="admin-avatar">M</div>
        </div>
      </div>
    </header>
  );
}