import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './Index.css';

const Index = () => {
    const [isVisible, setIsVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        setIsVisible(true);

        // Auto-redirect if already logged in
        const token = localStorage.getItem('token');
        const role = localStorage.getItem('role');
        
        if (token && role) {
            switch (role) {
                case 'ADMIN':
                    navigate('/admin/dashboard');
                    break;
                case 'BUSINESS_OWNER':
                    navigate('/owner/dashboard');
                    break;
                case 'CASHIER':
                    navigate('/cashier/dashboard');
                    break;
                case 'STAFF':
                    navigate('/staff/dashboard');
                    break;
                case 'KITCHEN':
                    navigate('/kitchen/dashboard');
                    break;
                default:
                    break;
            }
        }
    }, [navigate]);

    const features = [
        {
            icon: '📊',
            title: 'Quản lý Doanh thu',
            description: 'Theo dõi doanh thu theo thời gian thực, phân tích xu hướng và tối ưu hóa lợi nhuận'
        },
        {
            icon: '👥',
            title: 'Quản lý Nhân viên',
            description: 'Quản lý ca làm việc, theo dõi hiệu suất và tối ưu hóa nhân sự'
        },
        {
            icon: '📦',
            title: 'Quản lý Kho hàng',
            description: 'Kiểm soát tồn kho, cảnh báo hết hàng và quản lý nhập xuất tự động'
        },
        {
            icon: '🏪',
            title: 'Đa Chi nhánh',
            description: 'Quản lý nhiều cửa hàng từ một nền tảng duy nhất'
        },
        {
            icon: '📈',
            title: 'Báo cáo Thông minh',
            description: 'Phân tích dữ liệu chi tiết với biểu đồ trực quan và insights'
        },
        {
            icon: '🔒',
            title: 'Bảo mật Cao',
            description: 'Mã hóa dữ liệu và phân quyền người dùng chặt chẽ'
        }
    ];

    const stats = [
        { number: '1000+', label: 'Doanh nghiệp' },
        { number: '50K+', label: 'Người dùng' },
        { number: '99.9%', label: 'Uptime' },
        { number: '24/7', label: 'Hỗ trợ' }
    ];

    return (
        <div className="index-page">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="hero-gradient"></div>
                    <div className="hero-particles">
                        {[...Array(20)].map((_, i) => (
                            <div key={i} className="particle" style={{
                                left: `${Math.random() * 100}%`,
                                animationDelay: `${Math.random() * 3}s`,
                                animationDuration: `${3 + Math.random() * 4}s`
                            }}></div>
                        ))}
                    </div>
                </div>

                <div className="container">
                    <div className={`hero-content ${isVisible ? 'fade-in-up' : ''}`}>
                        <h1 className="hero-title">
                            Quản lý Kinh doanh
                            <span className="gradient-text"> Thông minh</span>
                        </h1>
                        <p className="hero-subtitle">
                            SmartBiz - Giải pháp toàn diện giúp doanh nghiệp tối ưu hóa vận hành,
                            tăng trưởng doanh thu và quản lý hiệu quả mọi hoạt động kinh doanh
                        </p>
                        <div className="hero-buttons">
                            <Link to="/register">
                                <Button size="large">Bắt đầu miễn phí</Button>
                            </Link>
                            <Link to="/login">
                                <Button variant="outline" size="large">Đăng nhập</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div
                                key={index}
                                className="stat-card scale-in"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="stat-number">{stat.number}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="section-header fade-in-up">
                        <h2 className="section-title">Tính năng nổi bật</h2>
                        <p className="section-subtitle">
                            Tất cả những gì bạn cần để quản lý doanh nghiệp hiệu quả
                        </p>
                    </div>

                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className="feature-card fade-in-up"
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                <div className="feature-icon float">{feature.icon}</div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content fade-in-up">
                        <h2 className="cta-title">Sẵn sàng bắt đầu?</h2>
                        <p className="cta-subtitle">
                            Tham gia cùng hàng nghìn doanh nghiệp đang sử dụng SmartBiz
                        </p>
                        <Link to="/register">
                            <Button size="large">Đăng ký ngay</Button>
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default Index;
