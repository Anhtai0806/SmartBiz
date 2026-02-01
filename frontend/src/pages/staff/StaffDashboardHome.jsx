import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStaffDashboardStats, getMyTodayShift } from '../../api/staffApi';
import './StaffDashboardHome.css';

const StaffDashboardHome = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState(null);
    const [todayShift, setTodayShift] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);

            const storeId = localStorage.getItem('storeId') || '1';

            // Fetch dashboard stats and today's shift
            const [statsData, shiftData] = await Promise.all([
                getStaffDashboardStats(storeId),
                getMyTodayShift()
            ]);

            setStats(statsData);
            setTodayShift(shiftData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Không thể tải dữ liệu dashboard. Vui lòng thử lại.');
            setLoading(false);
        }
    };

    const formatTime = (time) => {
        if (!time) return '';
        return time.substring(0, 5); // HH:MM
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
        <div className="staff-dashboard-home">
            <div className="page-header">
                <h2>Dashboard</h2>
                <p className="page-subtitle">Chào mừng trở lại!</p>
            </div>

            {/* Today's Shift Info */}
            {todayShift ? (
                <div className="shift-info-card">
                    <div className="shift-header">
                        <span className="shift-icon">📅</span>
                        <h3>Ca làm việc hôm nay</h3>
                    </div>
                    <div className="shift-details">
                        <div className="shift-time">
                            <span className="time-label">Giờ bắt đầu:</span>
                            <span className="time-value">{formatTime(todayShift.startTime)}</span>
                        </div>
                        <div className="shift-time">
                            <span className="time-label">Giờ kết thúc:</span>
                            <span className="time-value">{formatTime(todayShift.endTime)}</span>
                        </div>
                        <div className="shift-store">
                            <span className="store-label">Cửa hàng:</span>
                            <span className="store-value">{todayShift.storeName || 'N/A'}</span>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="no-shift-card">
                    <span className="no-shift-icon">📅</span>
                    <p>Bạn không có ca làm việc hôm nay</p>
                </div>
            )}

            {/* Quick Stats */}
            <div className="stats-grid">
                <div className="stat-card stat-tables">
                    <div className="stat-icon">🪑</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.tablesServing || 0}</div>
                        <div className="stat-label">Bàn đang phục vụ</div>
                    </div>
                </div>

                <div className="stat-card stat-orders">
                    <div className="stat-icon">📋</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.ordersToday || 0}</div>
                        <div className="stat-label">Đơn hàng hôm nay</div>
                    </div>
                </div>

                <div className="stat-card stat-active">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <div className="stat-value">{stats?.activeOrders || 0}</div>
                        <div className="stat-label">Đơn đang xử lý</div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <h3>Thao tác nhanh</h3>
                <div className="actions-grid">
                    <button
                        className="action-card action-tables"
                        onClick={() => navigate('/staff/tables')}
                    >
                        <span className="action-icon">🪑</span>
                        <span className="action-label">Xem bàn</span>
                        <span className="action-arrow">→</span>
                    </button>

                    <button
                        className="action-card action-orders"
                        onClick={() => navigate('/staff/orders')}
                    >
                        <span className="action-icon">📋</span>
                        <span className="action-label">Đơn hàng của tôi</span>
                        <span className="action-arrow">→</span>
                    </button>

                    <button
                        className="action-card action-schedule"
                        onClick={() => navigate('/staff/schedule')}
                    >
                        <span className="action-icon">📅</span>
                        <span className="action-label">Lịch làm việc</span>
                        <span className="action-arrow">→</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StaffDashboardHome;
