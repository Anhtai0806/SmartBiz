import React from 'react';
import './Footer.css';

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    {/* Company Info */}
                    <div className="footer-section">
                        <h3 className="footer-logo">
                            <span className="logo-icon">📊</span>
                            SmartBiz
                        </h3>
                        <p className="footer-description">
                            Giải pháp quản lý kinh doanh thông minh, giúp doanh nghiệp tối ưu hóa
                            hoạt động và tăng trưởng bền vững.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4 className="footer-title">Liên kết</h4>
                        <ul className="footer-links">
                            <li><a href="/">Trang chủ</a></li>
                            <li><a href="/login">Đăng nhập</a></li>
                            <li><a href="/register">Đăng ký</a></li>
                        </ul>
                    </div>

                    {/* Contact */}
                    <div className="footer-section">
                        <h4 className="footer-title">Liên hệ</h4>
                        <ul className="footer-links">
                            <li>📧 contact@smartbiz.vn</li>
                            <li>📞 +84 123 456 789</li>
                            <li>📍 Hà Nội, Việt Nam</li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div className="footer-section">
                        <h4 className="footer-title">Theo dõi chúng tôi</h4>
                        <div className="social-links">
                            <a href="#" className="social-link" aria-label="Facebook">
                                <span>📘</span>
                            </a>
                            <a href="#" className="social-link" aria-label="Twitter">
                                <span>🐦</span>
                            </a>
                            <a href="#" className="social-link" aria-label="LinkedIn">
                                <span>💼</span>
                            </a>
                            <a href="#" className="social-link" aria-label="Instagram">
                                <span>📷</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Copyright */}
                <div className="footer-bottom">
                    <p>&copy; {currentYear} SmartBiz. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
