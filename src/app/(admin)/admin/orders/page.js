"use client";
import { useState, useEffect } from "react";
import { 
    RefreshCcw, ExternalLink, Search, 
    TrendingUp, ShoppingCart, UserCheck, CreditCard 
} from "lucide-react";

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    const fetchAllOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/orders/admin/all`, {
                headers: { "Authorization": `JWT ${localStorage.getItem("token")}` }
            });
            const data = await res.json();
            if (data.success) setOrders(data.orders);
        } catch (err) {
            console.error("Admin fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAllOrders(); }, []);

    const filteredOrders = orders.filter(o => 
        o.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
        o.razorpayOrderId.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="admin-page-bg">
            <div className="admin-max-container">
                
                {/* Top Stat Bar */}
                <header className="admin-top-bar">
                    <div className="title-section">
                        <h1>Operations Dashboard</h1>
                        <p>Real-time order management and analytics</p>
                    </div>
                    <div className="action-section">
                        <div className="search-wrapper">
                            <Search size={18} />
                            <input 
                                type="text" 
                                placeholder="Search by name or ID..." 
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <button onClick={fetchAllOrders} className="modern-refresh-btn">
                            <RefreshCcw size={16} className={loading ? "spin" : ""} />
                        </button>
                    </div>
                </header>

                {/* Metric Grid */}
                <div className="metrics-grid">
                    <div className="metric-card">
                        <div className="m-icon revenue"><TrendingUp size={20}/></div>
                        <div className="m-data">
                            <span>Total Revenue</span>
                            <h3>₹{orders.reduce((acc, curr) => acc + (curr.paymentStatus === 'Paid' ? curr.totalAmount : 0), 0).toLocaleString()}</h3>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="m-icon orders"><ShoppingCart size={20}/></div>
                        <div className="m-data">
                            <span>Total Orders</span>
                            <h3>{orders.length}</h3>
                        </div>
                    </div>
                    <div className="metric-card">
                        <div className="m-icon users"><UserCheck size={20}/></div>
                        <div className="m-data">
                            <span>Unique Customers</span>
                            <h3>{new Set(orders.map(o => o.user?._id)).size}</h3>
                        </div>
                    </div>
                </div>

                {/* Modern Table Section */}
                <div className="modern-table-card">
                    <div className="table-header">
                        <h2>Recent Transactions</h2>
                        <span className="count-tag">{filteredOrders.length} Orders</span>
                    </div>
                    <div className="table-responsive">
                        <table className="admin-glass-table">
                            <thead>
                                <tr>
                                    <th>Reference</th>
                                    <th>Customer</th>
                                    <th>Amount</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredOrders.map((order) => (
                                    <tr key={order._id}>
                                        <td className="font-mono text-sm">
                                            <span className="id-txt">{order.razorpayOrderId.slice(-8)}</span>
                                        </td>
                                        <td>
                                            <div className="user-cell">
                                                <div className="avatar">{order.user?.name?.charAt(0) || "G"}</div>
                                                <div className="u-info">
                                                    <strong>{order.user?.name || "Guest"}</strong>
                                                    <span>{order.user?.email}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="amt-cell">₹{order.totalAmount}</td>
                                        <td className="date-cell">{new Date(order.createdAt).toLocaleDateString('en-GB')}</td>
                                        <td>
                                            <span className={`status-pill ${order.paymentStatus.toLowerCase()}`}>
                                                <span className="dot"></span>
                                                {order.paymentStatus}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="view-details-btn">
                                                <ExternalLink size={14}/>
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}