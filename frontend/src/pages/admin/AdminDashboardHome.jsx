import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../../api/adminApi';
import StatCard from '../../components/StatCard';
import './AdminDashboardHome.css';

const AdminDashboardHome = () => {
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const data = await getDashboardStats();
            setStats(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Loading dashboard...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    // Calculate max value for chart scaling
    const maxCount = stats?.businessOwnerTrend
        ? Math.max(...stats.businessOwnerTrend.map(item => item.count), 1)
        : 1;

    return (
        <div className="admin-dashboard-home">
            <div className="dashboard-header">
                <h1>Dashboard Overview</h1>
                <p>Welcome to SmartBiz Admin Panel</p>
            </div>

            <div className="stats-grid">
                <StatCard
                    title="Total Users"
                    value={stats?.totalUsers || 0}
                    icon="👥"
                    color="blue"
                />
                <StatCard
                    title="Total Stores"
                    value={stats?.totalStores || 0}
                    icon="🏪"
                    color="purple"
                />
                <StatCard
                    title="Active Users"
                    value={stats?.activeUsers || 0}
                    icon="✅"
                    color="green"
                />
                <StatCard
                    title="Inactive Users"
                    value={stats?.inactiveUsers || 0}
                    icon="❌"
                    color="red"
                />
            </div>

            {stats?.businessOwnerTrend && stats.businessOwnerTrend.length > 0 && (
                <div className="business-owner-trend">
                    <div className="trend-header">
                        <div>
                            <h2>Business Owner Registration Trend</h2>
                            <p className="trend-subtitle">New business owners registered in the last 6 months</p>
                        </div>
                        <div className="new-owners-badge">
                            <span className="badge-label">New This Month</span>
                            <span className="badge-value">{stats?.newBusinessOwnersThisMonth || 0}</span>
                        </div>
                    </div>
                    <div className="chart-container">
                        <svg className="trend-chart" viewBox="0 0 600 300" preserveAspectRatio="xMidYMid meet">
                            {/* Grid lines */}
                            <line x1="50" y1="250" x2="550" y2="250" stroke="#e0e0e0" strokeWidth="1" />
                            <line x1="50" y1="200" x2="550" y2="200" stroke="#e0e0e0" strokeWidth="1" />
                            <line x1="50" y1="150" x2="550" y2="150" stroke="#e0e0e0" strokeWidth="1" />
                            <line x1="50" y1="100" x2="550" y2="100" stroke="#e0e0e0" strokeWidth="1" />
                            <line x1="50" y1="50" x2="550" y2="50" stroke="#e0e0e0" strokeWidth="1" />

                            {/* Y-axis labels */}
                            <text x="40" y="255" fontSize="12" fill="#666" textAnchor="end">0</text>
                            <text x="40" y="205" fontSize="12" fill="#666" textAnchor="end">{Math.round(maxCount * 0.25)}</text>
                            <text x="40" y="155" fontSize="12" fill="#666" textAnchor="end">{Math.round(maxCount * 0.5)}</text>
                            <text x="40" y="105" fontSize="12" fill="#666" textAnchor="end">{Math.round(maxCount * 0.75)}</text>
                            <text x="40" y="55" fontSize="12" fill="#666" textAnchor="end">{maxCount}</text>

                            {/* Bars */}
                            {stats.businessOwnerTrend.map((item, index) => {
                                const barHeight = (item.count / maxCount) * 200;
                                const x = 80 + index * 80;
                                const y = 250 - barHeight;

                                return (
                                    <g key={index}>
                                        <rect
                                            x={x}
                                            y={y}
                                            width="50"
                                            height={barHeight}
                                            fill="#4a90e2"
                                            rx="4"
                                        />
                                        <text
                                            x={x + 25}
                                            y={y - 10}
                                            fontSize="14"
                                            fill="#333"
                                            textAnchor="middle"
                                            fontWeight="bold"
                                        >
                                            {item.count}
                                        </text>
                                        <text
                                            x={x + 25}
                                            y="270"
                                            fontSize="11"
                                            fill="#666"
                                            textAnchor="middle"
                                        >
                                            {item.month}
                                        </text>
                                    </g>
                                );
                            })}
                        </svg>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardHome;
