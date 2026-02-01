import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import StaffDashboardHome from './StaffDashboardHome';
import StaffTables from './StaffTables';
import StaffOrders from './StaffOrders';
import StaffSchedule from './StaffSchedule';
import StaffProfile from './StaffProfile';
import './StaffDashboard.css';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const userName = localStorage.getItem('fullName') || 'Staff';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('fullName');
        localStorage.removeItem('storeId');
        navigate('/login');
    };

    return (
        <div className="staff-dashboard">
            <header className="staff-header">
                <div className="header-brand">
                    <h1>SmartBiz Staff</h1>
                </div>

                <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <Link to="/staff/dashboard" className="nav-item">
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/staff/tables" className="nav-item">
                        <span className="nav-icon">🪑</span>
                        <span>Bàn</span>
                    </Link>
                    <Link to="/staff/orders" className="nav-item">
                        <span className="nav-icon">📋</span>
                        <span>Đơn hàng của tôi</span>
                    </Link>
                    <Link to="/staff/schedule" className="nav-item">
                        <span className="nav-icon">📅</span>
                        <span>Lịch làm việc</span>
                    </Link>
                    <Link to="/staff/profile" className="nav-item">
                        <span className="nav-icon">👤</span>
                        <span>Hồ sơ</span>
                    </Link>
                </nav>

                <div className="header-actions">
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <span className="user-role">Staff</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>
                        Đăng xuất
                    </button>
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        ☰
                    </button>
                </div>
            </header>

            <main className="staff-main-content">
                <Routes>
                    <Route path="/" element={<StaffDashboardHome />} />
                    <Route path="/dashboard" element={<StaffDashboardHome />} />
                    <Route path="/tables" element={<StaffTables />} />
                    <Route path="/orders" element={<StaffOrders />} />
                    <Route path="/schedule" element={<StaffSchedule />} />
                    <Route path="/profile" element={<StaffProfile />} />
                </Routes>
            </main>
        </div>
    );
};

export default StaffDashboard;
