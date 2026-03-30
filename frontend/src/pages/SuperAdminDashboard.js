import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { superAdminAPI } from '../services/api';
import {
    FiUsers, FiClock, FiCheckCircle, FiXCircle,
    FiSearch, FiLogOut, FiCpu, FiCheck, FiX,
    FiCalendar, FiMail, FiPhone, FiHome, FiRefreshCw
} from 'react-icons/fi';
import { toast } from 'react-toastify';

const SuperAdminDashboard = () => {
    const [requests, setRequests] = useState([]);
    const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });
    const [activeFilter, setActiveFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const fetchData = useCallback(async () => {
        try {
            setLoading(true);
            const params = {};
            if (activeFilter !== 'all') params.status = activeFilter;
            if (searchTerm) params.search = searchTerm;

            const [reqRes, statsRes] = await Promise.all([
                superAdminAPI.getRequests(params),
                superAdminAPI.getStats()
            ]);
            setRequests(reqRes.data);
            setStats(statsRes.data);
        } catch (error) {
            toast.error('Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [activeFilter, searchTerm]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleApprove = async (id) => {
        if (!window.confirm('Approve this registration? A user account will be created.')) return;
        try {
            setActionLoading(id);
            await superAdminAPI.approveRequest(id);
            toast.success('Registration approved!');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to approve');
        } finally {
            setActionLoading(null);
        }
    };

    const handleReject = async (id) => {
        if (!window.confirm('Reject this registration?')) return;
        try {
            setActionLoading(id);
            await superAdminAPI.rejectRequest(id);
            toast.success('Registration rejected');
            fetchData();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to reject');
        } finally {
            setActionLoading(null);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getStatusBadge = (status) => {
        const config = {
            pending: { icon: <FiClock />, className: 'badge-pending' },
            approved: { icon: <FiCheckCircle />, className: 'badge-approved' },
            rejected: { icon: <FiXCircle />, className: 'badge-rejected' }
        };
        const c = config[status] || config.pending;
        return (
            <span className={`sa-badge ${c.className}`}>
                {c.icon} {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    const filterTabs = [
        { key: 'all', label: 'All', count: stats.total, icon: <FiUsers /> },
        { key: 'pending', label: 'Pending', count: stats.pending, icon: <FiClock /> },
        { key: 'approved', label: 'Approved', count: stats.approved, icon: <FiCheckCircle /> },
        { key: 'rejected', label: 'Rejected', count: stats.rejected, icon: <FiXCircle /> }
    ];

    return (
        <div className="sa-dashboard">
            {/* Header */}
            <header className="sa-header">
                <div className="sa-header-left">
                    <FiCpu className="sa-logo-icon" />
                    <div>
                        <h1>PetPooja<span className="logo-plus">+</span> <span className="sa-title-tag">Super Admin</span></h1>
                        <p className="sa-subtitle">Manage restaurant registrations</p>
                    </div>
                </div>
                <div className="sa-header-right">
                    <div className="sa-user-info">
                        <div className="sa-user-avatar">{user?.name?.[0] || 'S'}</div>
                        <span>{user?.name}</span>
                    </div>
                    <button className="sa-logout-btn" onClick={handleLogout} title="Logout">
                        <FiLogOut />
                    </button>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="sa-stats-grid">
                <div className="sa-stat-card sa-stat-total">
                    <div className="sa-stat-icon"><FiUsers /></div>
                    <div className="sa-stat-info">
                        <span className="sa-stat-number">{stats.total}</span>
                        <span className="sa-stat-label">Total Requests</span>
                    </div>
                </div>
                <div className="sa-stat-card sa-stat-pending">
                    <div className="sa-stat-icon"><FiClock /></div>
                    <div className="sa-stat-info">
                        <span className="sa-stat-number">{stats.pending}</span>
                        <span className="sa-stat-label">Pending</span>
                    </div>
                </div>
                <div className="sa-stat-card sa-stat-approved">
                    <div className="sa-stat-icon"><FiCheckCircle /></div>
                    <div className="sa-stat-info">
                        <span className="sa-stat-number">{stats.approved}</span>
                        <span className="sa-stat-label">Approved</span>
                    </div>
                </div>
                <div className="sa-stat-card sa-stat-rejected">
                    <div className="sa-stat-icon"><FiXCircle /></div>
                    <div className="sa-stat-info">
                        <span className="sa-stat-number">{stats.rejected}</span>
                        <span className="sa-stat-label">Rejected</span>
                    </div>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="sa-controls">
                <div className="sa-filter-tabs">
                    {filterTabs.map(tab => (
                        <button
                            key={tab.key}
                            className={`sa-filter-tab ${activeFilter === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveFilter(tab.key)}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                            <span className="sa-tab-count">{tab.count}</span>
                        </button>
                    ))}
                </div>
                <div className="sa-search-bar">
                    <FiSearch className="sa-search-icon" />
                    <input
                        type="text"
                        placeholder="Search by name, email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button className="sa-refresh-btn" onClick={fetchData} title="Refresh">
                        <FiRefreshCw className={loading ? 'spinning' : ''} />
                    </button>
                </div>
            </div>

            {/* Requests Table */}
            <div className="sa-table-container">
                {loading ? (
                    <div className="sa-loading">
                        <div className="spinner"></div>
                        <p>Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="sa-empty">
                        <FiUsers className="sa-empty-icon" />
                        <h3>No requests found</h3>
                        <p>
                            {activeFilter !== 'all'
                                ? `No ${activeFilter} requests`
                                : 'No registration requests yet'}
                        </p>
                    </div>
                ) : (
                    <table className="sa-table">
                        <thead>
                            <tr>
                                <th><FiHome /> Restaurant</th>
                                <th><FiUsers /> Owner</th>
                                <th><FiMail /> Email</th>
                                <th><FiPhone /> Phone</th>
                                <th>Type</th>
                                <th><FiCalendar /> Registered</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req._id} className={`sa-row sa-row-${req.status}`}>
                                    <td className="sa-cell-restaurant">
                                        <div className="sa-restaurant-avatar">
                                            {req.restaurantName?.[0] || 'R'}
                                        </div>
                                        <span>{req.restaurantName}</span>
                                    </td>
                                    <td>{req.ownerName}</td>
                                    <td className="sa-cell-email">{req.email}</td>
                                    <td>{req.phone}</td>
                                    <td>
                                        <span className="sa-type-badge">{req.restaurantType}</span>
                                    </td>
                                    <td className="sa-cell-date">{formatDate(req.createdAt)}</td>
                                    <td>{getStatusBadge(req.status)}</td>
                                    <td className="sa-cell-actions">
                                        {req.status === 'pending' ? (
                                            <div className="sa-action-buttons">
                                                <button
                                                    className="sa-btn-approve"
                                                    onClick={() => handleApprove(req._id)}
                                                    disabled={actionLoading === req._id}
                                                    title="Approve"
                                                >
                                                    {actionLoading === req._id ? (
                                                        <div className="btn-spinner-sm"></div>
                                                    ) : (
                                                        <><FiCheck /> Approve</>
                                                    )}
                                                </button>
                                                <button
                                                    className="sa-btn-reject"
                                                    onClick={() => handleReject(req._id)}
                                                    disabled={actionLoading === req._id}
                                                    title="Reject"
                                                >
                                                    <FiX /> Reject
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="sa-action-done">—</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default SuperAdminDashboard;
