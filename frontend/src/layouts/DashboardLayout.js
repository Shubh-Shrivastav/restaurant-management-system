import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    FiHome, FiMenu, FiShoppingCart, FiMonitor, FiBox,
    FiUsers, FiBarChart2, FiLogOut, FiChevronLeft, FiChevronRight,
    FiCpu, FiGrid
} from 'react-icons/fi';

const DashboardLayout = ({ children }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const menuItems = [
        { path: '/dashboard', icon: FiHome, label: 'Dashboard', roles: ['Admin', 'Manager', 'Cashier'] },
        { path: '/menu', icon: FiMenu, label: 'Menu', roles: ['Admin', 'Manager'] },
        { path: '/orders', icon: FiShoppingCart, label: 'Orders', roles: ['Admin', 'Manager', 'Cashier'] },
        { path: '/kitchen', icon: FiMonitor, label: 'Kitchen', roles: ['Admin', 'Manager', 'Kitchen Staff'] },
        { path: '/inventory', icon: FiBox, label: 'Inventory', roles: ['Admin', 'Manager'] },
        { path: '/customers', icon: FiUsers, label: 'Customers', roles: ['Admin', 'Manager', 'Cashier'] },
        { path: '/reports', icon: FiBarChart2, label: 'Reports', roles: ['Admin', 'Manager'] },
        { path: '/qr-manage', icon: FiGrid, label: 'QR Codes', roles: ['Admin', 'Manager'] },
    ];

    const filteredItems = menuItems.filter(item => item.roles.includes(user?.role));

    return (
        <div className="dashboard-layout">
            <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
                <div className="sidebar-header">
                    {!collapsed && (
                        <div className="logo">
                            <FiCpu className="logo-icon" />
                            <span>PetPooja<span className="logo-plus">+</span></span>
                        </div>
                    )}
                    <button className="collapse-btn" onClick={() => setCollapsed(!collapsed)}>
                        {collapsed ? <FiChevronRight /> : <FiChevronLeft />}
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {filteredItems.map(item => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                            title={collapsed ? item.label : ''}
                        >
                            <item.icon className="nav-icon" />
                            {!collapsed && <span>{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className={`user-info ${collapsed ? 'collapsed' : ''}`}>
                        <div className="user-avatar">{user?.name?.[0] || 'U'}</div>
                        {!collapsed && (
                            <div className="user-details">
                                <span className="user-name">{user?.name}</span>
                                <span className="user-role">{user?.role}</span>
                            </div>
                        )}
                    </div>
                    <button className="logout-btn" onClick={handleLogout} title="Logout">
                        <FiLogOut />
                        {!collapsed && <span>Logout</span>}
                    </button>
                </div>
            </aside>

            <main className="main-content">
                <div className="content-wrapper">
                    {children}
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;
