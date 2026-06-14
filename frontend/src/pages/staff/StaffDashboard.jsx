import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import StaffDashboardHome from './StaffDashboardHome';
import StaffTables from './StaffTables';
import StaffOrders from './StaffOrders';
import StaffSchedule from './StaffSchedule';
import StaffAvailability from './StaffAvailability';
import StaffProfile from './StaffProfile';
import EmployeeOnboardingModal from '../../components/EmployeeOnboardingModal';
import './StaffDashboard.css';

const StaffDashboard = () => {
    const navigate = useNavigate();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const userName = localStorage.getItem('fullName') || 'Nhân viên';

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
        <div className="staff-dashboard">
            <EmployeeOnboardingModal roleLabel="nhân viên" />

            <header className="staff-header">
                <div className="header-brand">
                    <h1>SmartBiz Nhân viên</h1>
                </div>

                <nav className={`header-nav ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    <Link to="/staff/dashboard" className="nav-item">
                        <span className="nav-icon">SB</span>
                        <span>Bảng điều khiển</span>
                    </Link>
                    <Link to="/staff/tables" className="nav-item">
                        <span className="nav-icon">B</span>
                        <span>Bàn</span>
                    </Link>
                    <Link to="/staff/schedule" className="nav-item">
                        <span className="nav-icon">L</span>
                        <span>Lịch làm việc</span>
                    </Link>
                    <Link to="/staff/availability" className="nav-item">
                        <span className="nav-icon">LR</span>
                        <span>Lịch rảnh</span>
                    </Link>
                </nav>

                <div className="header-actions">
                    <div className="user-info">
                        <span className="user-name">{userName}</span>
                        <span className="user-role">Nhân viên</span>
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
                    <Route path="/availability" element={<StaffAvailability />} />
                    <Route path="/profile" element={<StaffProfile />} />
                </Routes>
            </main>
        </div>
    );
};

export default StaffDashboard;
