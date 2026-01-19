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

            {stats?.usersByRole && (
                <div className="role-breakdown">
                    <h2>Users by Role</h2>
                    <div className="role-cards">
                        {Object.entries(stats.usersByRole).map(([role, count]) => (
                            <div key={role} className="role-card">
                                <div className="role-name">{role.replace('_', ' ')}</div>
                                <div className="role-count">{count}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboardHome;
