import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import AdminDashboardHome from './AdminDashboardHome';
import AdminUsers from './AdminUsers';
import AdminStores from './AdminStores';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const userName = localStorage.getItem('fullName') || 'Admin';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('fullName');
        navigate('/login');
    };

    return (
        <div className="admin-dashboard">
            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>SmartBiz Admin</h2>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? '◀' : '▶'}
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/admin/dashboard" className="nav-item">
                        <span className="nav-icon">📊</span>
                        {isSidebarOpen && <span>Dashboard</span>}
                    </Link>
                    <Link to="/admin/users" className="nav-item">
                        <span className="nav-icon">👥</span>
                        {isSidebarOpen && <span>Users</span>}
                    </Link>
                    <Link to="/admin/stores" className="nav-item">
                        <span className="nav-icon">🏪</span>
                        {isSidebarOpen && <span>Stores</span>}
                    </Link>

                </nav>
            </aside>

            <div className="main-content">
                <header className="admin-header">
                    <div className="header-left">
                        <h1>Admin Panel</h1>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span className="user-name">{userName}</span>
                            <span className="user-role">Admin</span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </header>

                <div className="content-area">
                    <Routes>
                        <Route path="/" element={<AdminDashboardHome />} />
                        <Route path="/dashboard" element={<AdminDashboardHome />} />
                        <Route path="/users" element={<AdminUsers />} />
                        <Route path="/stores" element={<AdminStores />} />

                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
