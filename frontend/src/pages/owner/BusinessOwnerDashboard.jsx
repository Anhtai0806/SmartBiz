import React, { useEffect, useRef, useState } from 'react';
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
    const userDropdownRef = useRef(null);
    const userDropdownTriggerRef = useRef(null);
    const closeMenuTimeoutRef = useRef(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [userMenuPosition, setUserMenuPosition] = useState({ top: 0, left: 0 });
    const userName = localStorage.getItem('fullName') || 'Business Owner';

    const updateUserMenuPosition = () => {
        const trigger = userDropdownTriggerRef.current;
        if (!trigger) {
            return;
        }

        const rect = trigger.getBoundingClientRect();
        const menuWidth = 200;
        const viewportPadding = 12;
        const left = Math.min(
            Math.max(viewportPadding, rect.right - menuWidth),
            window.innerWidth - menuWidth - viewportPadding
        );

        setUserMenuPosition({
            top: rect.bottom + 6,
            left
        });
    };

    const openUserMenu = () => {
        if (closeMenuTimeoutRef.current) {
            clearTimeout(closeMenuTimeoutRef.current);
            closeMenuTimeoutRef.current = null;
        }

        updateUserMenuPosition();
        setIsUserMenuOpen(true);
    };

    const scheduleCloseUserMenu = () => {
        if (closeMenuTimeoutRef.current) {
            clearTimeout(closeMenuTimeoutRef.current);
        }

        closeMenuTimeoutRef.current = setTimeout(() => {
            setIsUserMenuOpen(false);
        }, 120);
    };

    useEffect(() => {
        const handlePointerDownOutside = (event) => {
            if (!userDropdownRef.current?.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };

        const handleViewportChange = () => {
            if (isUserMenuOpen) {
                updateUserMenuPosition();
            }
        };

        document.addEventListener('mousedown', handlePointerDownOutside);
        window.addEventListener('resize', handleViewportChange);
        window.addEventListener('scroll', handleViewportChange, true);

        return () => {
            document.removeEventListener('mousedown', handlePointerDownOutside);
            window.removeEventListener('resize', handleViewportChange);
            window.removeEventListener('scroll', handleViewportChange, true);
            if (closeMenuTimeoutRef.current) {
                clearTimeout(closeMenuTimeoutRef.current);
            }
        };
    }, [isUserMenuOpen]);

    const handleLogout = () => {
        setIsUserMenuOpen(false);
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
                    <div
                        ref={userDropdownRef}
                        className={`user-dropdown-container ${isUserMenuOpen ? 'menu-open' : ''}`}
                        onMouseEnter={openUserMenu}
                        onMouseLeave={scheduleCloseUserMenu}
                    >
                        <button
                            ref={userDropdownTriggerRef}
                            type="button"
                            className="user-dropdown-trigger"
                            aria-haspopup="menu"
                            aria-expanded={isUserMenuOpen}
                            onClick={() => {
                                if (isUserMenuOpen) {
                                    setIsUserMenuOpen(false);
                                    return;
                                }

                                openUserMenu();
                            }}
                        >
                            <div className="user-info">
                                <span className="user-name">{userName}</span>
                                <span className="user-role">Business Owner</span>
                            </div>
                            <span className="user-menu-caret">▾</span>
                        </button>

                        <div
                            className="user-dropdown-menu"
                            role="menu"
                            style={isUserMenuOpen ? userMenuPosition : undefined}
                            onMouseEnter={openUserMenu}
                            onMouseLeave={scheduleCloseUserMenu}
                        >
                            <Link
                                to="/owner/profile"
                                className="dropdown-item"
                                role="menuitem"
                                onClick={() => setIsUserMenuOpen(false)}
                            >
                                Tài khoản của tôi
                            </Link>
                            <button className="dropdown-item" role="menuitem" onClick={handleLogout}>
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
