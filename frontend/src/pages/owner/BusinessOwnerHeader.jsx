import React, { useEffect, useMemo, useRef, useState } from 'react';
import { NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import BusinessOwnerDashboardHome from './BusinessOwnerDashboardHome';
import OwnerStores from './OwnerStores';
import StoreDetail from './StoreDetail';
import OwnerReports from './OwnerReports';
import SchedulePage from './SchedulePage';
import OwnerCategories from './OwnerCategories';
import OwnerQRPayment from './OwnerQRPayment';
import OwnerStaff from './OwnerStaff';
import Profile from './Profile';
import './BusinessOwnerHeader.css';

const NAV_ITEMS = [
    { to: '/owner/dashboard', icon: 'TQ', label: 'Tổng quan' },
    { to: '/owner/stores', icon: 'CH', label: 'Cửa hàng' },
    { to: '/owner/staff', icon: 'NS', label: 'Nhân sự' },
    { to: '/owner/categories', icon: 'DM', label: 'Danh mục' },
    { to: '/owner/qr-payment', icon: 'QR', label: 'Mã QR' },
    { to: '/owner/reports', icon: 'BC', label: 'Báo cáo' },
    { to: '/owner/schedule', icon: 'CL', label: 'Lịch làm' }
];

const QUICK_PILLS = [
    { label: 'Đồng bộ dữ liệu', tone: 'green' },
    { label: 'Owner workspace', tone: 'blue' }
];

const BusinessOwnerHeader = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dropdownRef = useRef(null);
    const triggerRef = useRef(null);
    const closeMenuTimeoutRef = useRef(null);
    const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [userMenuPosition, setUserMenuPosition] = useState({ top: 0, left: 0 });

    const userName = localStorage.getItem('fullName') || 'Chủ cửa hàng';

    const currentSection = useMemo(() => {
        const matchedItem = NAV_ITEMS.find((item) => location.pathname.startsWith(item.to));
        return matchedItem?.label || 'Tổng quan';
    }, [location.pathname]);

    const updateUserMenuPosition = () => {
        const trigger = triggerRef.current;
        if (!trigger) {
            return;
        }

        const rect = trigger.getBoundingClientRect();
        const menuWidth = 220;
        const viewportPadding = 12;
        const left = Math.min(
            Math.max(viewportPadding, rect.right - menuWidth),
            window.innerWidth - menuWidth - viewportPadding
        );

        setUserMenuPosition({
            top: rect.bottom + 8,
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
            if (!dropdownRef.current?.contains(event.target)) {
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

    useEffect(() => {
        setIsMobileNavOpen(false);
    }, [location.pathname]);

    const handleLogout = () => {
        setIsUserMenuOpen(false);
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
        <div className="owner-header-shell">
            <header className="owner-topbar">
                <div className="owner-topbar__brand">
                    <div className="owner-topbar__brand-copy">
                        <h1>SmartBiz</h1>
                    </div>
                </div>

                <nav className="owner-topbar__nav" aria-label="Điều hướng business owner">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={({ isActive }) =>
                                `owner-topbar__nav-link ${isActive ? 'is-active' : ''}`
                            }
                        >
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="owner-topbar__actions">
                    <button type="button" className="owner-topbar__notice" aria-label="Thông báo">
                        <span className="owner-topbar__notice-icon">!</span>
                        <span className="owner-topbar__notice-dot" />
                    </button>

                    <div
                        ref={dropdownRef}
                        className={`owner-topbar__user ${isUserMenuOpen ? 'is-open' : ''}`}
                        onMouseEnter={openUserMenu}
                        onMouseLeave={scheduleCloseUserMenu}
                    >
                        <button
                            ref={triggerRef}
                            type="button"
                            className="owner-topbar__user-trigger"
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
                            <div className="owner-topbar__avatar">
                                {userName.trim().charAt(0).toUpperCase()}
                            </div>
                            <div className="owner-topbar__user-meta">
                                <span className="owner-topbar__user-name">{userName}</span>
                                <span className="owner-topbar__user-role">Chủ cửa hàng</span>
                            </div>
                            <span className="owner-topbar__caret">▾</span>
                        </button>

                        <div
                            className="owner-topbar__user-menu"
                            role="menu"
                            style={isUserMenuOpen ? userMenuPosition : undefined}
                            onMouseEnter={openUserMenu}
                            onMouseLeave={scheduleCloseUserMenu}
                        >
                            <NavLink
                                to="/owner/profile"
                                className="owner-topbar__user-link"
                                role="menuitem"
                                onClick={() => setIsUserMenuOpen(false)}
                            >
                                Thông tin cá nhân
                            </NavLink>
                            <button
                                type="button"
                                className="owner-topbar__user-link owner-topbar__user-link--danger"
                                role="menuitem"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>

                    <button
                        type="button"
                        className="owner-topbar__menu-toggle"
                        onClick={() => setIsMobileNavOpen((current) => !current)}
                        aria-expanded={isMobileNavOpen}
                        aria-label="Mở menu điều hướng"
                    >
                        {isMobileNavOpen ? 'Đóng' : 'Menu'}
                    </button>
                </div>
            </header>

            <div className={`owner-mobile-nav ${isMobileNavOpen ? 'is-open' : ''}`}>
                {NAV_ITEMS.map((item) => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `owner-mobile-nav__link ${isActive ? 'is-active' : ''}`
                        }
                    >
                        <span className="owner-mobile-nav__icon">{item.icon}</span>
                        <span>{item.label}</span>
                    </NavLink>
                ))}
            </div>

            <main className="owner-workspace">
                <section className="owner-workspace__intro">
                    <div className="owner-workspace__section-copy">
                        <div className="owner-workspace__accent" />
                        <div>
                            <h2>{currentSection}</h2>
                            <p>
                                Khu vực làm việc của business owner, tối ưu cho quản lý cửa hàng,
                                nhân sự, mã QR, báo cáo và lịch làm việc.
                            </p>
                        </div>
                    </div>

                    <div className="owner-workspace__pills">
                        {QUICK_PILLS.map((pill) => (
                            <span
                                key={pill.label}
                                className={`owner-workspace__pill owner-workspace__pill--${pill.tone}`}
                            >
                                {pill.label}
                            </span>
                        ))}
                    </div>
                </section>

                <section className="owner-workspace__content">
                    <Routes>
                        <Route path="/" element={<BusinessOwnerDashboardHome />} />
                        <Route path="/dashboard" element={<BusinessOwnerDashboardHome />} />
                        <Route path="/stores" element={<OwnerStores />} />
                        <Route path="/stores/:storeId" element={<StoreDetail />} />
                        <Route path="/staff" element={<OwnerStaff />} />
                        <Route path="/categories" element={<OwnerCategories />} />
                        <Route path="/qr-payment" element={<OwnerQRPayment />} />
                        <Route path="/reports" element={<OwnerReports />} />
                        <Route path="/schedule" element={<SchedulePage />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </section>
            </main>
        </div>
    );
};

export default BusinessOwnerHeader;
