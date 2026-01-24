import React, { useState, useEffect } from 'react';
import StatCard from '../../components/StatCard';
import { useNavigate } from 'react-router-dom';
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

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            // TODO: Replace with actual API calls
            // For now, using mock data
            setStats({
                totalOrders: 24,
                completedOrders: 18,
                pendingPayments: 6,
                todayRevenue: 2450000
            });

            setRecentOrders([
                { id: 1, tableName: 'Bàn 1', status: 'PROCESSING', total: 150000, time: '10:30' },
                { id: 2, tableName: 'Bàn 3', status: 'WAITING_PAYMENT', total: 280000, time: '11:15' },
                { id: 3, tableName: 'Bàn 5', status: 'DONE', total: 320000, time: '11:45' },
            ]);

            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
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
        return <div className="loading">Đang tải...</div>;
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
                            {recentOrders.map(order => (
                                <tr key={order.id}>
                                    <td>#{order.id}</td>
                                    <td>{order.tableName}</td>
                                    <td>{getStatusBadge(order.status)}</td>
                                    <td className="amount">{formatCurrency(order.total)}</td>
                                    <td>{order.time}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default CashierDashboardHome;
