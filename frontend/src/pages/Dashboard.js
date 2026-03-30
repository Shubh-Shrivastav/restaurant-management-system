import React, { useState, useEffect } from 'react';
import { dashboardAPI, aiAPI } from '../services/api';
import { useSocket } from '../context/SocketContext';
import { FiDollarSign, FiShoppingCart, FiAlertTriangle, FiClock, FiTrendingUp, FiActivity } from 'react-icons/fi';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [predictions, setPredictions] = useState(null);
    const [loading, setLoading] = useState(true);
    const { socket } = useSocket();

    const fetchData = async () => {
        try {
            const [statsRes, predRes] = await Promise.all([
                dashboardAPI.getStats(),
                aiAPI.getPredictions().catch(() => ({ data: null }))
            ]);
            setStats(statsRes.data);
            setPredictions(predRes.data);
        } catch (error) {
            console.error('Dashboard error:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        if (socket) {
            socket.emit('join-dashboard');
            socket.on('new-order', () => fetchData());
            socket.on('order-updated', () => fetchData());
            return () => {
                socket.off('new-order');
                socket.off('order-updated');
            };
        }
    }, [socket]);

    if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

    const statusData = {
        labels: (stats?.ordersByStatus || []).map(s => s._id),
        datasets: [{
            data: (stats?.ordersByStatus || []).map(s => s.count),
            backgroundColor: ['#f59e0b', '#3b82f6', '#10b981', '#8b5cf6', '#06b6d4', '#ef4444'],
            borderWidth: 0
        }]
    };

    const predictionData = predictions?.topItems ? {
        labels: predictions.topItems.slice(0, 6).map(i => i.name),
        datasets: [{
            label: 'Predicted Daily Demand',
            data: predictions.topItems.slice(0, 6).map(i => i.predictedDemand),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderRadius: 8
        }]
    } : null;

    return (
        <div className="dashboard-page">
            <div className="page-header">
                <h1><FiActivity /> Dashboard</h1>
                <span className="header-subtitle">Real-time overview</span>
            </div>

            <div className="stats-grid">
                <div className="stat-card stat-sales">
                    <div className="stat-icon"><FiDollarSign /></div>
                    <div className="stat-info">
                        <span className="stat-value">₹{stats?.todaySales?.totalSales?.toLocaleString() || 0}</span>
                        <span className="stat-label">Today's Sales</span>
                    </div>
                </div>
                <div className="stat-card stat-orders">
                    <div className="stat-icon"><FiShoppingCart /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.todaySales?.orderCount || 0}</span>
                        <span className="stat-label">Total Orders</span>
                    </div>
                </div>
                <div className="stat-card stat-pending">
                    <div className="stat-icon"><FiClock /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.pendingOrders || 0}</span>
                        <span className="stat-label">Pending Orders</span>
                    </div>
                </div>
                <div className="stat-card stat-lowstock">
                    <div className="stat-icon"><FiAlertTriangle /></div>
                    <div className="stat-info">
                        <span className="stat-value">{stats?.lowStockCount || 0}</span>
                        <span className="stat-label">Low Stock Items</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card">
                    <h3><FiTrendingUp /> AI Demand Prediction</h3>
                    {predictionData ? (
                        <Bar data={predictionData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { y: { beginAtZero: true, grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } }, x: { grid: { display: false }, ticks: { color: '#94a3b8' } } } }} />
                    ) : (
                        <p className="no-data">No prediction data yet. Orders are needed for analysis.</p>
                    )}
                    {predictions?.tomorrowPrediction && (
                        <div className="prediction-summary">
                            <span>Tomorrow's Forecast: <strong>{predictions.tomorrowPrediction.expectedOrders} orders</strong></span>
                            <span>Expected Revenue: <strong>₹{predictions.tomorrowPrediction.expectedRevenue?.toLocaleString()}</strong></span>
                        </div>
                    )}
                </div>

                <div className="dashboard-card">
                    <h3><FiShoppingCart /> Order Status</h3>
                    {stats?.ordersByStatus?.length > 0 ? (
                        <div className="chart-container-sm">
                            <Doughnut data={statusData} options={{ responsive: true, plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 15 } } } }} />
                        </div>
                    ) : (
                        <p className="no-data">No orders today</p>
                    )}
                </div>

                <div className="dashboard-card full-width">
                    <h3><FiAlertTriangle /> Low Stock Alerts</h3>
                    {stats?.lowStockItems?.length > 0 ? (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Item</th><th>Category</th><th>Qty</th><th>Unit</th><th>Threshold</th><th>Status</th></tr>
                                </thead>
                                <tbody>
                                    {stats.lowStockItems.map(item => (
                                        <tr key={item._id}>
                                            <td>{item.name}</td>
                                            <td>{item.category}</td>
                                            <td className="text-danger">{item.quantity}</td>
                                            <td>{item.unit}</td>
                                            <td>{item.lowStockThreshold}</td>
                                            <td><span className="badge badge-danger">Low</span></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="no-data">All items are well stocked! ✅</p>
                    )}
                </div>

                <div className="dashboard-card full-width">
                    <h3><FiClock /> Recent Orders</h3>
                    {stats?.recentOrders?.length > 0 ? (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead>
                                    <tr><th>Order #</th><th>Type</th><th>Items</th><th>Total</th><th>Status</th><th>Time</th></tr>
                                </thead>
                                <tbody>
                                    {stats.recentOrders.map(order => (
                                        <tr key={order._id}>
                                            <td className="text-primary">{order.orderNumber}</td>
                                            <td>{order.orderType}</td>
                                            <td>{order.items?.length || 0} items</td>
                                            <td>₹{order.total}</td>
                                            <td><span className={`badge badge-${order.status === 'Completed' ? 'success' : order.status === 'Cancelled' ? 'danger' : 'warning'}`}>{order.status}</span></td>
                                            <td>{new Date(order.createdAt).toLocaleTimeString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="no-data">No orders yet</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
