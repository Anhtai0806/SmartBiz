import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import KitchenDashboardHome from './KitchenDashboardHome';
import KitchenOrders from './KitchenOrders';
import KitchenAvailability from './KitchenAvailability';
import EmployeeOnboardingModal from '../../components/EmployeeOnboardingModal';
import './KitchenDashboard.css';

const KitchenDashboard = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const userName = localStorage.getItem('fullName') || 'Bếp';

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
        <div className="kitchen-dashboard">
            <EmployeeOnboardingModal roleLabel="nhân viên bếp" />

            <header className="kitchen-header">
                <div className="header-brand">
                    <h1>SmartBiz Bếp</h1>
                </div>

                <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <Link to="/kitchen/dashboard" className="nav-item">
                        <span className="nav-icon">SB</span>
                        <span>Bảng điều khiển</span>
                    </Link>
                    <Link to="/kitchen/orders" className="nav-item">
                        <span className="nav-icon">Đ</span>
                        <span>Đơn hàng</span>
                    </Link>
                    <Link to="/kitchen/availability" className="nav-item">
                        <span className="nav-icon">LR</span>
                        <span>Lịch rảnh</span>
                    </Link>
                </nav>

                <div className="header-actions">
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <span className="user-role">Bếp</span>
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

            <main className="kitchen-main-content">
                <Routes>
                    <Route path="/" element={<KitchenDashboardHome />} />
                    <Route path="/dashboard" element={<KitchenDashboardHome />} />
                    <Route path="/orders" element={<KitchenOrders />} />
                    <Route path="/availability" element={<KitchenAvailability />} />
                </Routes>
            </main>
        </div>
    );
};

export default KitchenDashboard;
