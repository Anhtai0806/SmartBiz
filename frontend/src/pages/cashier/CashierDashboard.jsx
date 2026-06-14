import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import CashierDashboardHome from './CashierDashboardHome';
import CashierTables from './CashierTables';
import CashierOrders from './CashierOrders';
import CashierPayment from './CashierPayment';
import CashierSchedule from './CashierSchedule';
import CashierAvailability from './CashierAvailability';
import EmployeeOnboardingModal from '../../components/EmployeeOnboardingModal';
import './CashierDashboard.css';

const CashierDashboard = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const userName = localStorage.getItem('fullName') || 'Thu ngân';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('fullName');
        localStorage.removeItem('storeName');
        localStorage.removeItem('storeId');
        localStorage.removeItem('onboardingCompleted');
        navigate('/login');
    };

    return (
        <div className="cashier-dashboard">
            <EmployeeOnboardingModal roleLabel="thu ngân" />

            <header className="cashier-header">
                <div className="header-brand">
                    <h1>SmartBiz Thu ngân</h1>
                </div>

                <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <Link to="/cashier/dashboard" className="nav-item">
                        <span className="nav-icon">SB</span>
                        <span>Bảng điều khiển</span>
                    </Link>
                    <Link to="/cashier/tables" className="nav-item">
                        <span className="nav-icon">B</span>
                        <span>Bàn</span>
                    </Link>
                    <Link to="/cashier/orders" className="nav-item">
                        <span className="nav-icon">Đ</span>
                        <span>Đơn hàng</span>
                    </Link>
                    <Link to="/cashier/payment" className="nav-item">
                        <span className="nav-icon">TT</span>
                        <span>Thanh toán</span>
                    </Link>
                    <Link to="/cashier/schedule" className="nav-item">
                        <span className="nav-icon">L</span>
                        <span>Lịch làm việc</span>
                    </Link>
                    <Link to="/cashier/availability" className="nav-item">
                        <span className="nav-icon">LR</span>
                        <span>Lịch rảnh</span>
                    </Link>
                </nav>

                <div className="header-actions">
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <span className="user-role">Thu ngân</span>
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
                    <Route path="/availability" element={<CashierAvailability />} />
                </Routes>
            </main>
        </div>
    );
};

export default CashierDashboard;
