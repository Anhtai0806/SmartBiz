import React, { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard';
import { useNavigate } from 'react-router-dom';
import { getCashierDashboardStats, getTodayOrders } from '../../api/cashierApi';
import './CashierDashboardHome.css';

const CashierDashboardHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        totalOrders: 0,
        completedOrders: 0,
        pendingPayments: 0,
        todayRevenue: 0
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get storeId from localStorage (set during login or store selection)
            const storeId = localStorage.getItem('storeId') || '1'; // Default to store 1 for testing

            // Fetch dashboard statistics
            const statsData = await getCashierDashboardStats(storeId);
            setStats(statsData);

            // Fetch today's orders (limit to 5 most recent)
            const ordersData = await getTodayOrders(storeId);
            const recentOrdersData = ordersData
                .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                .slice(0, 5)
                .map(order => ({
                    id: order.id,
                    tableName: order.tableName,
                    status: order.status,
                    total: order.totalAmount,
                    time: formatTime(order.createdAt)
                }));
            setRecentOrders(recentOrdersData);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'NEW': { label: 'Mới', className: 'status-new' },
            'PROCESSING': { label: 'Đang xử lý', className: 'status-processing' },
            'WAITING_PAYMENT': { label: 'Chờ thanh toán', className: 'status-waiting' },
            'DONE': { label: 'Hoàn thành', className: 'status-done' },
            'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled' }
        };
        const statusInfo = statusMap[status] || { label: status, className: '' };
        return <span className={`status-badge ${statusInfo.className}`}>{statusInfo.label}</span>;
    };

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={fetchDashboardData} className="retry-btn">Thử lại</button>
            </div>
        );
    }

    return (
        <div className="cashier-home">
            <div className="page-header">
                <h2>Dashboard Overview</h2>
                <p className="page-subtitle">Tổng quan hoạt động hôm nay</p>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Tổng đơn hàng"
                    value={stats.totalOrders}
                    icon="📋"
                    color="#3b82f6"
                />
                <StatCard
                    title="Đã hoàn thành"
                    value={stats.completedOrders}
                    icon="✅"
                    color="#10b981"
                />
                <StatCard
                    title="Chờ thanh toán"
                    value={stats.pendingPayments}
                    icon="⏳"
                    color="#f59e0b"
                />
                <StatCard
                    title="Doanh thu hôm nay"
                    value={formatCurrency(stats.todayRevenue)}
                    icon="💰"
                    color="#8b5cf6"
                />
            </div>

            <div className="quick-actions">
                <h3>Thao tác nhanh</h3>
                <div className="action-buttons">
                    <button className="action-btn primary" onClick={() => navigate('/cashier/tables')}>
                        <span className="btn-icon">🪑</span>
                        <span className="btn-text">Xem bàn</span>
                    </button>
                    <button className="action-btn success" onClick={() => navigate('/cashier/orders')}>
                        <span className="btn-icon">📋</span>
                        <span className="btn-text">Quản lý đơn hàng</span>
                    </button>
                    <button className="action-btn warning" onClick={() => navigate('/cashier/payment')}>
                        <span className="btn-icon">💳</span>
                        <span className="btn-text">Thanh toán</span>
                    </button>
                </div>
            </div>

            <div className="recent-orders">
                <div className="section-header">
                    <h3>Đơn hàng gần đây</h3>
                    <button className="view-all-btn" onClick={() => navigate('/cashier/orders')}>
                        Xem tất cả →
                    </button>
                </div>
                <div className="orders-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Mã đơn</th>
                                <th>Bàn</th>
                                <th>Trạng thái</th>
                                <th>Tổng tiền</th>
                                <th>Thời gian</th>
                            </tr>
                        </thead>
                        <tbody>
                            {recentOrders.length > 0 ? (
                                recentOrders.map(order => (
                                    <tr key={order.id}>
                                        <td>#{order.id}</td>
                                        <td>{order.tableName}</td>
                                        <td>{getStatusBadge(order.status)}</td>
                                        <td className="amount">{formatCurrency(order.total)}</td>
                                        <td>{order.time}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                        Chưa có đơn hàng nào hôm nay
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CashierDashboardHome;
