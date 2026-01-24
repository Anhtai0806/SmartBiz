import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../api/businessOwnerApi';
import StatCard from '../../components/StatCard';
import './BusinessOwnerDashboardHome.css';

const BusinessOwnerDashboardHome = () => {
    const [stats, setStats] = useState({
        totalStores: 0,
        totalStaff: 0,
        totalMenuItems: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await getDashboardStats();
            setStats({
                totalStores: data.totalStores || 0,
                totalStaff: data.totalUsers || 0, // Backend reuses this field
                totalMenuItems: data.activeUsers || 0 // Backend reuses this field
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError(err.message || 'Không thể tải dữ liệu dashboard');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return (
            <div className="owner-dashboard-home">
                <div className="error-message">
                    <p>❌ {error}</p>
                    <button onClick={fetchStats} className="retry-btn">Thử lại</button>
                </div>
            </div>
        );
    }

    return (
        <div className="owner-dashboard-home">
            <div className="dashboard-header">
                <h1>Tổng quan Dashboard</h1>
                <p>Chào mừng đến với SmartBiz Business Owner Panel</p>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Tổng Cửa hàng"
                    value={stats.totalStores}
                    icon="🏪"
                    color="blue"
                />
                <StatCard
                    title="Tổng Nhân viên"
                    value={stats.totalStaff}
                    icon="👥"
                    color="purple"
                />
                <StatCard
                    title="Tổng Sản phẩm"
                    value={stats.totalMenuItems}
                    icon="📦"
                    color="green"
                />
            </div>

            <div className="dashboard-content">
                <div className="welcome-card">
                    <h3>🎉 Chào mừng đến với SmartBiz!</h3>
                    <p>Quản lý cửa hàng, nhân viên và kho hàng của bạn một cách dễ dàng.</p>
                    <ul>
                        <li>✅ Xem danh sách cửa hàng trong mục "Cửa hàng"</li>
                        <li>✅ Click vào cửa hàng để quản lý nhân viên và kho hàng</li>
                        <li>✅ Xem báo cáo trong mục "Báo cáo"</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default BusinessOwnerDashboardHome;
