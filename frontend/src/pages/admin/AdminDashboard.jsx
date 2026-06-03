import React from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import AdminDashboardHome from './AdminDashboardHome';
import AdminUsers from './AdminUsers';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const navigate = useNavigate();
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
            <header className="admin-top-header">
                <div className="header-brand">
                    <h1>SmartBiz Admin</h1>
                </div>

                <nav className="header-nav">
                    <Link to="/admin/dashboard" className="nav-item">
                        <span className="nav-icon">DB</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/admin/users" className="nav-item">
                        <span className="nav-icon">BO</span>
                        <span>Business Owners</span>
                    </Link>
                </nav>

                <div className="header-actions">
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <span className="user-role">Admin</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        Logout
                    </button>
                </div>
            </header>

            <main className="main-content">
                <div className="content-area">
                    <Routes>
                        <Route path="/" element={<AdminDashboardHome />} />
                        <Route path="/dashboard" element={<AdminDashboardHome />} />
                        <Route path="/users" element={<AdminUsers />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
};

export default AdminDashboard;
