import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import CashierDashboardHome from './CashierDashboardHome';
import CashierTables from './CashierTables';
import CashierOrders from './CashierOrders';
import CashierPayment from './CashierPayment';
import CashierSchedule from './CashierSchedule';
import './CashierDashboard.css';

const CashierDashboard = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const userName = localStorage.getItem('fullName') || 'Cashier';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('fullName');
        localStorage.removeItem('storeId');
        navigate('/login');
    };

    return (
        <div className="cashier-dashboard">
            <header className="cashier-header">
                <div className="header-brand">
                    <h1>SmartBiz Cashier</h1>
                </div>

                <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <Link to="/cashier/dashboard" className="nav-item">
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/cashier/tables" className="nav-item">
                        <span className="nav-icon">🪑</span>
                        <span>Bàn</span>
                    </Link>
                    <Link to="/cashier/orders" className="nav-item">
                        <span className="nav-icon">📋</span>
                        <span>Đơn hàng</span>
                    </Link>
                    <Link to="/cashier/payment" className="nav-item">
                        <span className="nav-icon">💳</span>
                        <span>Thanh toán</span>
                    </Link>
                    <Link to="/cashier/schedule" className="nav-item">
                        <span className="nav-icon">📅</span>
                        <span>Lịch làm việc</span>
                    </Link>
                </nav>

                <div className="header-actions">
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <span className="user-role">Cashier</span>
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

            <main className="cashier-main-content">
                <Routes>
                    <Route path="/" element={<CashierDashboardHome />} />
                    <Route path="/dashboard" element={<CashierDashboardHome />} />
                    <Route path="/tables" element={<CashierTables />} />
                    <Route path="/orders" element={<CashierOrders />} />
                    <Route path="/payment" element={<CashierPayment />} />
                    <Route path="/schedule" element={<CashierSchedule />} />
                </Routes>
            </main>
        </div>
    );
};

export default CashierDashboard;
