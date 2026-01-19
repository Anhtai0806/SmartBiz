import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 50);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const isActive = (path) => location.pathname === path;

    return (
        <nav className={`navbar ${isScrolled ? 'navbar-scrolled' : ''}`}>
            <div className="container">
                <div className="navbar-content">
                    {/* Logo */}
                    <Link to="/" className="navbar-logo">
                        <span className="logo-icon">📊</span>
                        <span className="logo-text">SmartBiz</span>
                    </Link>

                    {/* Desktop Menu */}
                    <div className="navbar-menu">
                        <Link
                            to="/"
                            className={`nav-link ${isActive('/') ? 'active' : ''}`}
                        >
                            Trang chủ
                        </Link>
                        <Link
                            to="/login"
                            className={`nav-link ${isActive('/login') ? 'active' : ''}`}
                        >
                            Đăng nhập
                        </Link>
                        <Link
                            to="/register"
                            className="nav-link nav-link-cta"
                        >
                            Đăng ký
                        </Link>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className={`mobile-menu-btn ${isMobileMenuOpen ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span></span>
                        <span></span>
                        <span></span>
                    </button>
                </div>

                {/* Mobile Menu */}
                <div className={`mobile-menu ${isMobileMenuOpen ? 'active' : ''}`}>
                    <Link
                        to="/"
                        className={`mobile-nav-link ${isActive('/') ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Trang chủ
                    </Link>
                    <Link
                        to="/login"
                        className={`mobile-nav-link ${isActive('/login') ? 'active' : ''}`}
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Đăng nhập
                    </Link>
                    <Link
                        to="/register"
                        className="mobile-nav-link"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        Đăng ký
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
