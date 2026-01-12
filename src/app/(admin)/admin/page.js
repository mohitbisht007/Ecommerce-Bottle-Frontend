export default function AdminDashboard() {
  return (
    <div className="admin-dashboard-overview">
      <div className="header-flex">
        <h1>Dashboard Overview</h1>
        <p>Welcome back, Admin. Here is what's happening today.</p>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        <div className="stat-card">
          <span className="label">Total Revenue</span>
          <h2 className="value">₹1,24,500</h2>
          <span className="trend positive">+12% from last month</span>
        </div>
        <div className="stat-card">
          <span className="label">Active Orders</span>
          <h2 className="value">42</h2>
          <span className="trend positive">5 pending fulfillment</span>
        </div>
        <div className="stat-card">
          <span className="label">Total Products</span>
          <h2 className="value">156</h2>
          <span className="trend">12 out of stock</span>
        </div>
      </div>

      {/* Recent Activity Table placeholder */}
      <div className="admin-section-card">
        <h3>Recent Orders</h3>
        <div className="dummy-table">
            {/* We will build the actual table component next */}
            <p>Order data will be listed here...</p>
        </div>
      </div>
    </div>
  );
}