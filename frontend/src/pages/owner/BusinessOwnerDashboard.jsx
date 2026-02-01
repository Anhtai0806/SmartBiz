import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import BusinessOwnerDashboardHome from './BusinessOwnerDashboardHome';
import OwnerStores from './OwnerStores';
import StoreDetail from './StoreDetail';
import OwnerReports from './OwnerReports';
import SchedulePage from './SchedulePage';
import OwnerCategories from './OwnerCategories';
import OwnerQRPayment from './OwnerQRPayment';
import Profile from './Profile';
import './BusinessOwnerDashboard.css';

const BusinessOwnerDashboard = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const userName = localStorage.getItem('fullName') || 'Business Owner';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('fullName');
        navigate('/login');
    };

    return (
        <div className="owner-dashboard">
            <header className="owner-header">
                <div className="header-brand">
                    <h1>SmartBiz Owner</h1>
                </div>

                <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <Link to="/owner/dashboard" className="nav-item">
                        <span className="nav-icon">📊</span>
                        <span>Dashboard</span>
                    </Link>
                    <Link to="/owner/stores" className="nav-item">
                        <span className="nav-icon">🏪</span>
                        <span>Cửa hàng</span>
                    </Link>
                    <Link to="/owner/categories" className="nav-item">
                        <span className="nav-icon">📂</span>
                        <span>Danh mục</span>
                    </Link>
                    <Link to="/owner/qr-payment" className="nav-item">
                        <span className="nav-icon">💳</span>
                        <span>Mã QR</span>
                    </Link>
                    <Link to="/owner/reports" className="nav-item">
                        <span className="nav-icon">📈</span>
                        <span>Báo cáo</span>
                    </Link>
                    <Link to="/owner/schedule" className="nav-item">
                        <span className="nav-icon">📅</span>
                        <span>Lịch làm việc</span>
                    </Link>
                </nav>

                <div className="header-actions">
                    <div className="user-dropdown-container">
                        <div className="user-info">
                            <span className="user-name">{userName}</span>
                            <span className="user-role">Business Owner</span>
                        </div>
                        <div className="user-dropdown-menu">
                            <Link to="/owner/profile" className="dropdown-item">Tài khoản của tôi</Link>
                            <button className="dropdown-item" onClick={handleLogout}>
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                    <button
                        className="mobile-menu-toggle"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        ☰
                    </button>
                </div>
            </header>

            <main className="owner-main-content">
                <Routes>
                    <Route path="/" element={<BusinessOwnerDashboardHome />} />
                    <Route path="/dashboard" element={<BusinessOwnerDashboardHome />} />
                    <Route path="/stores" element={<OwnerStores />} />
                    <Route path="/stores/:storeId" element={<StoreDetail />} />
                    <Route path="/categories" element={<OwnerCategories />} />
                    <Route path="/qr-payment" element={<OwnerQRPayment />} />
                    <Route path="/reports" element={<OwnerReports />} />
                    <Route path="/schedule" element={<SchedulePage />} />
                    <Route path="/profile" element={<Profile />} />
                </Routes>
            </main>
        </div>
    );
};

export default BusinessOwnerDashboard;
