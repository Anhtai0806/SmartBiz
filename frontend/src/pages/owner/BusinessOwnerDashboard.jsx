import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import BusinessOwnerDashboardHome from './BusinessOwnerDashboardHome';
import OwnerStores from './OwnerStores';
import StoreDetail from './StoreDetail';
import OwnerReports from './OwnerReports';
import SchedulePage from './SchedulePage';
import OwnerCategories from './OwnerCategories';
import './BusinessOwnerDashboard.css';

const BusinessOwnerDashboard = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
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
            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>SmartBiz Owner</h2>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? '◀' : '▶'}
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/owner/dashboard" className="nav-item">
                        <span className="nav-icon">📊</span>
                        {isSidebarOpen && <span>Dashboard</span>}
                    </Link>
                    <Link to="/owner/stores" className="nav-item">
                        <span className="nav-icon">🏪</span>
                        {isSidebarOpen && <span>Cửa hàng</span>}
                    </Link>
                    <Link to="/owner/categories" className="nav-item">
                        <span className="nav-icon">📂</span>
                        {isSidebarOpen && <span>Danh mục</span>}
                    </Link>
                    <Link to="/owner/reports" className="nav-item">
                        <span className="nav-icon">📈</span>
                        {isSidebarOpen && <span>Báo cáo</span>}
                    </Link>
                    <Link to="/owner/schedule" className="nav-item">
                        <span className="nav-icon">📅</span>
                        {isSidebarOpen && <span>Lịch làm việc</span>}
                    </Link>
                </nav>
            </aside>

            <div className="main-content">
                <header className="owner-header">
                    <div className="header-left">
                        <h1>Business Owner Panel</h1>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span className="user-name">{userName}</span>
                            <span className="user-role">Business Owner</span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            Đăng xuất
                        </button>
                    </div>
                </header>

                <div className="content-area">
                    <Routes>
                        <Route path="/" element={<BusinessOwnerDashboardHome />} />
                        <Route path="/dashboard" element={<BusinessOwnerDashboardHome />} />
                        <Route path="/stores" element={<OwnerStores />} />
                        <Route path="/stores/:storeId" element={<StoreDetail />} />
                        <Route path="/categories" element={<OwnerCategories />} />
                        <Route path="/reports" element={<OwnerReports />} />
                        <Route path="/schedule" element={<SchedulePage />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default BusinessOwnerDashboard;
