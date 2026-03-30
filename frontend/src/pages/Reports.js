import React, { useState, useEffect } from 'react';
import { reportAPI } from '../services/api';
import { FiBarChart2, FiTrendingUp, FiXCircle } from 'react-icons/fi';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, Filler);

const Reports = () => {
    const [dailySales, setDailySales] = useState([]);
    const [topItems, setTopItems] = useState([]);
    const [cancelledData, setCancelledData] = useState({ cancelled: [], stats: [] });
    const [revenueByType, setRevenueByType] = useState([]);
    const [days, setDays] = useState(30);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [salesRes, topRes, cancelRes, revRes] = await Promise.all([
                reportAPI.getDailySales({ days }),
                reportAPI.getTopItems({ days }),
                reportAPI.getCancelled({ days }),
                reportAPI.getRevenueByType({ days })
            ]);
            setDailySales(salesRes.data);
            setTopItems(topRes.data);
            setCancelledData(cancelRes.data);
            setRevenueByType(revRes.data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, [days]);

    const salesChartData = {
        labels: dailySales.map(d => d._id),
        datasets: [{
            label: 'Sales (₹)',
            data: dailySales.map(d => d.totalSales),
            borderColor: '#6366f1',
            backgroundColor: 'rgba(99, 102, 241, 0.1)',
            fill: true,
            tension: 0.4
        }, {
            label: 'Orders',
            data: dailySales.map(d => d.orderCount),
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            fill: true,
            tension: 0.4,
            yAxisID: 'y1'
        }]
    };

    const topItemsData = {
        labels: topItems.map(i => i._id),
        datasets: [{
            label: 'Quantity Sold',
            data: topItems.map(i => i.totalQuantity),
            backgroundColor: [
                '#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe',
                '#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'
            ],
            borderRadius: 8
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: { legend: { labels: { color: '#94a3b8' } } },
        scales: {
            y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: '#94a3b8' } },
            x: { grid: { display: false }, ticks: { color: '#94a3b8' } }
        }
    };

    const dualAxisOptions = {
        ...chartOptions,
        scales: {
            ...chartOptions.scales,
            y1: { position: 'right', grid: { display: false }, ticks: { color: '#10b981' } }
        }
    };

    if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

    const totalRevenue = dailySales.reduce((s, d) => s + d.totalSales, 0);
    const totalOrders = dailySales.reduce((s, d) => s + d.orderCount, 0);
    const cancelledCount = cancelledData.stats?.find(s => s._id === 'Cancelled')?.count || 0;

    return (
        <div className="reports-page">
            <div className="page-header">
                <h1><FiBarChart2 /> Reports</h1>
                <select value={days} onChange={(e) => setDays(e.target.value)} className="filter-select">
                    <option value={7}>Last 7 Days</option>
                    <option value={15}>Last 15 Days</option>
                    <option value={30}>Last 30 Days</option>
                    <option value={90}>Last 90 Days</option>
                </select>
            </div>

            <div className="stats-grid">
                <div className="stat-card stat-sales"><div className="stat-info"><span className="stat-value">₹{totalRevenue.toLocaleString()}</span><span className="stat-label">Total Revenue</span></div></div>
                <div className="stat-card stat-orders"><div className="stat-info"><span className="stat-value">{totalOrders}</span><span className="stat-label">Total Orders</span></div></div>
                <div className="stat-card stat-pending"><div className="stat-info"><span className="stat-value">₹{totalOrders > 0 ? Math.round(totalRevenue / totalOrders) : 0}</span><span className="stat-label">Avg Order Value</span></div></div>
                <div className="stat-card stat-lowstock"><div className="stat-info"><span className="stat-value">{cancelledCount}</span><span className="stat-label">Cancelled</span></div></div>
            </div>

            <div className="dashboard-grid">
                <div className="dashboard-card full-width">
                    <h3><FiTrendingUp /> Daily Sales & Orders</h3>
                    {dailySales.length > 0 ? <Line data={salesChartData} options={dualAxisOptions} /> : <p className="no-data">No data</p>}
                </div>

                <div className="dashboard-card">
                    <h3><FiBarChart2 /> Top Items</h3>
                    {topItems.length > 0 ? <Bar data={topItemsData} options={chartOptions} /> : <p className="no-data">No data</p>}
                </div>

                <div className="dashboard-card">
                    <h3><FiBarChart2 /> Revenue by Type</h3>
                    {revenueByType.length > 0 ? (
                        <div className="revenue-cards">
                            {revenueByType.map(r => (
                                <div key={r._id} className="revenue-type-card">
                                    <h4>{r._id}</h4>
                                    <span className="rev-amount">₹{r.totalRevenue.toLocaleString()}</span>
                                    <span className="rev-count">{r.orderCount} orders</span>
                                </div>
                            ))}
                        </div>
                    ) : <p className="no-data">No data</p>}
                </div>

                <div className="dashboard-card full-width">
                    <h3><FiXCircle /> Cancelled Orders</h3>
                    {cancelledData.cancelled?.length > 0 ? (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <thead><tr><th>Order #</th><th>Type</th><th>Items</th><th>Total</th><th>Date</th></tr></thead>
                                <tbody>{cancelledData.cancelled.map(o => (
                                    <tr key={o._id}><td>{o.orderNumber}</td><td>{o.orderType}</td><td>{o.items?.length} items</td><td>₹{o.total}</td><td>{new Date(o.createdAt).toLocaleDateString()}</td></tr>
                                ))}</tbody>
                            </table>
                        </div>
                    ) : <p className="no-data">No cancelled orders 🎉</p>}
                </div>
            </div>
        </div>
    );
};

export default Reports;
