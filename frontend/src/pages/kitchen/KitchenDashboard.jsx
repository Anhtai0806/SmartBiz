import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import KitchenDashboardHome from './KitchenDashboardHome';
import KitchenOrders from './KitchenOrders';
import './KitchenDashboard.css';

const KitchenDashboard = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const userName = localStorage.getItem('fullName') || 'Kitchen';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('fullName');
        localStorage.removeItem('storeId');
        navigate('/login');
    };

    return (
        <div className="kitchen-dashboard">
            <header className="kitchen-header">
                <div className="header-brand">
                    <h1>🍳 SmartBiz Kitchen</h1>
                </div>

                <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <Link to="/kitchen/dashboard" className="nav-item">
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/kitchen/orders" className="nav-item">
                        <span className="nav-icon">📋</span>
                        <span>Đơn hàng</span>
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
                </Routes>
            </main>
        </div>
    );
};

export default KitchenDashboard;
