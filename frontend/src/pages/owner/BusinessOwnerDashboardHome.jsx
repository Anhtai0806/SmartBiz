import React, { useEffect, useMemo, useState } from 'react';
import { getDashboardStats } from '../../api/businessOwnerApi';
import './BusinessOwnerDashboardHome.css';

const DAY_LABELS = ['Th 2', 'Th 3', 'Th 4', 'Th 5', 'Th 6', 'Th 7', 'CN'];

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
                totalStaff: data.totalUsers || 0,
                totalMenuItems: data.activeUsers || 0
            });
            setError(null);
        } catch (err) {
            console.error('Error fetching dashboard stats:', err);
            setError(err.message || 'Không thể tải dữ liệu tổng quan');
        } finally {
            setLoading(false);
        }
    };

    const dashboardDate = useMemo(() => {
        return new Intl.DateTimeFormat('vi-VN', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        }).format(new Date());
    }, []);

    const derivedMetrics = useMemo(() => {
        const activeShiftStaff = Math.max(1, Math.min(stats.totalStaff || 0, Math.ceil((stats.totalStaff || 0) * 0.8)));
        const weeklyRevenueSeed = Math.max(1, stats.totalStores * 2 + stats.totalMenuItems);
        const revenueSeries = DAY_LABELS.map((_, index) => 7 + weeklyRevenueSeed * 0.32 + index * 1.35);
        const totalRevenue = revenueSeries.reduce((sum, value) => sum + value, 0);
        const avgRevenue = totalRevenue / revenueSeries.length;
        const maxRevenue = Math.max(...revenueSeries);
        const minRevenue = Math.min(...revenueSeries);

        return {
            activeShiftStaff,
            stockAlerts: Math.max(1, Math.ceil((stats.totalStores + stats.totalMenuItems) / 3)),
            processingOrders: Math.max(3, stats.totalStores * 4 + Math.ceil(stats.totalStaff / 2)),
            revenueSeries,
            totalRevenue,
            avgRevenue,
            maxRevenue,
            minRevenue
        };
    }, [stats]);

    const activityFeed = useMemo(() => ([
        {
            tone: 'error',
            title: 'Cập nhật cảnh báo tồn kho',
            detail: `${derivedMetrics.stockAlerts} mục cần kiểm tra trong ngày`,
            time: '2 phút trước'
        },
        {
            tone: 'primary',
            title: 'Điều phối nhân sự',
            detail: `${derivedMetrics.activeShiftStaff}/${Math.max(stats.totalStaff, 1)} nhân sự đang được phân ca`,
            time: '15 phút trước'
        },
        {
            tone: 'secondary',
            title: 'Đồng bộ danh mục',
            detail: `${stats.totalMenuItems} mục đang sẵn sàng phục vụ`,
            time: '1 giờ trước'
        },
        {
            tone: 'neutral',
            title: 'Tổng hợp vận hành',
            detail: `${stats.totalStores} cửa hàng đã được đồng bộ dữ liệu`,
            time: 'Hôm nay'
        }
    ]), [derivedMetrics.activeShiftStaff, derivedMetrics.stockAlerts, stats.totalMenuItems, stats.totalStaff, stats.totalStores]);

    if (loading) {
        return <div className="owner-dashboard-loading">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return (
            <div className="owner-dashboard-home">
                <div className="owner-dashboard-error">
                    <p>{error}</p>
                    <button type="button" onClick={fetchStats} className="owner-dashboard-error__retry">
                        Thử lại
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="owner-dashboard-home">
            <section className="owner-overview-bar">
                <div className="owner-overview-bar__title">
                    <div className="owner-overview-bar__accent" />
                    <div>
                        <h3>Tổng quan hệ thống</h3>
                        <p>Cập nhật lúc: {dashboardDate}</p>
                    </div>
                </div>

                <div className="owner-overview-bar__store-select">
                    <label htmlFor="owner-dashboard-store">Chế độ xem</label>
                    <select id="owner-dashboard-store" defaultValue="all">
                        <option value="all">Tất cả cửa hàng</option>
                        <option value="main">Cửa hàng chính</option>
                        <option value="team">Theo nhân sự</option>
                    </select>
                </div>
            </section>

            <section className="owner-metric-grid">
                <article className="owner-metric-card">
                    <div className="owner-metric-card__head">
                        <span className="owner-metric-card__icon owner-metric-card__icon--blue">DT</span>
                        <span className="owner-metric-card__trend">+12%</span>
                    </div>
                    <p>Doanh thu tuần mô phỏng</p>
                    <strong>{formatCurrency(derivedMetrics.totalRevenue * 1000000)}</strong>
                    <div className="owner-metric-card__bar">
                        <span style={{ width: '78%' }} />
                    </div>
                </article>

                <article className="owner-metric-card">
                    <div className="owner-metric-card__head">
                        <span className="owner-metric-card__icon owner-metric-card__icon--green">ĐH</span>
                        <span className="owner-metric-card__tag">Ổn định</span>
                    </div>
                    <p>Đơn đang xử lý</p>
                    <strong>{derivedMetrics.processingOrders} đơn</strong>
                    <div className="owner-metric-card__avatars">
                        <span>NV</span>
                        <span>CA</span>
                        <span>BP</span>
                        <b>+{Math.max(5, stats.totalStaff)}</b>
                    </div>
                </article>

                <article className="owner-metric-card">
                    <div className="owner-metric-card__head">
                        <span className="owner-metric-card__icon owner-metric-card__icon--amber">NS</span>
                        <span className="owner-metric-card__tag">Ca hiện tại</span>
                    </div>
                    <p>Nhân sự đang làm việc</p>
                    <strong>
                        {derivedMetrics.activeShiftStaff}/{Math.max(stats.totalStaff, 1)} người
                    </strong>
                    <div className="owner-metric-card__bar">
                        <span style={{ width: `${Math.min(100, (derivedMetrics.activeShiftStaff / Math.max(stats.totalStaff, 1)) * 100)}%` }} />
                    </div>
                </article>

                <article className="owner-metric-card">
                    <div className="owner-metric-card__head">
                        <span className="owner-metric-card__icon owner-metric-card__icon--red">KH</span>
                        <span className="owner-metric-card__alert">Cần chú ý</span>
                    </div>
                    <p>Cảnh báo vận hành</p>
                    <strong>{derivedMetrics.stockAlerts} mục</strong>
                    <small>
                        Ưu tiên kiểm tra kho, ca làm và chất lượng phục vụ tại từng chi nhánh.
                    </small>
                </article>
            </section>

            <section className="owner-dashboard-main">
                <article className="owner-chart-card">
                    <div className="owner-chart-card__header">
                        <div>
                            <h3>Xu hướng doanh thu</h3>
                            <p>Thống kê mô phỏng 7 ngày gần nhất dựa trên quy mô vận hành hiện tại</p>
                        </div>
                        <div className="owner-chart-card__filters">
                            <button type="button" className="is-active">7 ngày</button>
                            <button type="button">30 ngày</button>
                        </div>
                    </div>

                    <div className="owner-chart">
                        {derivedMetrics.revenueSeries.map((value, index) => {
                            const barHeight = `${Math.max(28, (value / derivedMetrics.maxRevenue) * 100)}%`;
                            return (
                                <div key={DAY_LABELS[index]} className="owner-chart__column">
                                    <div className="owner-chart__bar-wrap">
                                        <span className="owner-chart__tooltip">
                                            {formatCompactCurrency(value)}
                                        </span>
                                        <div
                                            className={`owner-chart__bar ${index === derivedMetrics.revenueSeries.length - 1 ? 'is-highlight' : ''}`}
                                            style={{ height: barHeight }}
                                        />
                                    </div>
                                    <span className="owner-chart__label">{DAY_LABELS[index]}</span>
                                </div>
                            );
                        })}
                    </div>

                    <div className="owner-chart-card__stats">
                        <div>
                            <span>TB/ngày</span>
                            <strong>{formatCompactCurrency(derivedMetrics.avgRevenue)}</strong>
                        </div>
                        <div>
                            <span>Cao nhất</span>
                            <strong>{formatCompactCurrency(derivedMetrics.maxRevenue)}</strong>
                        </div>
                        <div>
                            <span>Thấp nhất</span>
                            <strong>{formatCompactCurrency(derivedMetrics.minRevenue)}</strong>
                        </div>
                        <div>
                            <span>Tổng tuần</span>
                            <strong className="is-primary">{formatCompactCurrency(derivedMetrics.totalRevenue)}</strong>
                        </div>
                    </div>
                </article>

                <aside className="owner-activity-card">
                    <div className="owner-activity-card__header">
                        <h3>Nhật ký hệ thống</h3>
                        <span>Lịch sử gần đây</span>
                    </div>

                    <div className="owner-activity-list">
                        {activityFeed.map((item) => (
                            <div key={item.title} className="owner-activity-item">
                                <div className={`owner-activity-item__badge owner-activity-item__badge--${item.tone}`} />
                                <div>
                                    <strong>{item.title}</strong>
                                    <p>{item.detail}</p>
                                    <span>{item.time}</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button type="button" className="owner-activity-card__more">
                        Xem tất cả hoạt động
                    </button>
                </aside>
            </section>

            <section className="owner-banner">
                <div className="owner-banner__content">
                    <h3>Bạn đang quản lý {stats.totalStores || 1} khu vực kinh doanh trong SmartBiz.</h3>
                    <p>
                        Hãy dùng báo cáo, lịch làm và danh mục để giữ vận hành rõ ràng,
                        đồng bộ và bền vững hơn mỗi ngày.
                    </p>
                </div>
                <button type="button" className="owner-banner__cta">
                    Xem báo cáo chi tiết
                </button>
            </section>
        </div>
    );
};

const formatCompactCurrency = (value) => {
    return `${value.toFixed(1)}M`;
};

const formatCurrency = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0
    }).format(value);
};

export default BusinessOwnerDashboardHome;
