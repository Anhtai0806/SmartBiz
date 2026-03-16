import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getKitchenStats } from '../../api/kitchenApi';
import './KitchenDashboardHome.css';

const KitchenDashboardHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        // Auto refresh every 30 seconds
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const data = await getKitchenStats();
            setStats(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching stats:', error);
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    return (
        <div className="kitchen-dashboard-home">
            <div className="page-header">
                <h2>Dashboard Bếp</h2>
                <p className="page-subtitle">Chào mừng đến với hệ thống quản lý bếp!</p>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card stat-pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.pendingOrders || 0}</div>
                        <div className="stat-label">Đơn đang chờ</div>
                    </div>
                </div>

                <div className="stat-card stat-completed">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.completedToday || 0}</div>
                        <div className="stat-label">Hoàn thành hôm nay</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Thao tác nhanh</h3>
                <div className="actions-grid">
                    <button
                        className="action-card action-orders"
                        onClick={() => navigate('/kitchen/orders')}
                    >
                        <span className="action-icon">📋</span>
                        <span className="action-label">Xem đơn hàng</span>
                        <span className="action-arrow">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KitchenDashboardHome;
