import React, { useState } from 'react';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import CashierDashboardHome from './CashierDashboardHome';
import CashierTables from './CashierTables';
import CashierOrders from './CashierOrders';
import CashierPayment from './CashierPayment';
import './CashierDashboard.css';

const CashierDashboard = () => {
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const userName = localStorage.getItem('fullName') || 'Cashier';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('email');
        localStorage.removeItem('fullName');
        navigate('/login');
    };

    return (
        <div className="cashier-dashboard">
            <aside className={`sidebar ${isSidebarOpen ? 'open' : 'closed'}`}>
                <div className="sidebar-header">
                    <h2>SmartBiz Cashier</h2>
                    <button
                        className="sidebar-toggle"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    >
                        {isSidebarOpen ? '◀' : '▶'}
                    </button>
                </div>
                <nav className="sidebar-nav">
                    <Link to="/cashier/dashboard" className="nav-item">
                        <span className="nav-icon">📊</span>
                        {isSidebarOpen && <span>Dashboard</span>}
                    </Link>
                    <Link to="/cashier/tables" className="nav-item">
                        <span className="nav-icon">🪑</span>
                        {isSidebarOpen && <span>Bàn</span>}
                    </Link>
                    <Link to="/cashier/orders" className="nav-item">
                        <span className="nav-icon">📋</span>
                        {isSidebarOpen && <span>Đơn hàng</span>}
                    </Link>
                    <Link to="/cashier/payment" className="nav-item">
                        <span className="nav-icon">💳</span>
                        {isSidebarOpen && <span>Thanh toán</span>}
                    </Link>
                </nav>
            </aside>

            <div className="main-content">
                <header className="cashier-header">
                    <div className="header-left">
                        <h1>Cashier Panel</h1>
                    </div>
                    <div className="header-right">
                        <div className="user-info">
                            <span className="user-name">{userName}</span>
                            <span className="user-role">Cashier</span>
                        </div>
                        <button className="logout-btn" onClick={handleLogout}>
                            Đăng xuất
                        </button>
                    </div>
                </header>

                <div className="content-area">
                    <Routes>
                        <Route path="/" element={<CashierDashboardHome />} />
                        <Route path="/dashboard" element={<CashierDashboardHome />} />
                        <Route path="/tables" element={<CashierTables />} />
                        <Route path="/orders" element={<CashierOrders />} />
                        <Route path="/payment" element={<CashierPayment />} />
                    </Routes>
                </div>
            </div>
        </div>
    );
};

export default CashierDashboard;
