import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import './Login.css';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        // Clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.username) {
            newErrors.username = 'Email hoặc số điện thoại không được để trống';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu không được để trống';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newErrors = validateForm();
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setIsLoading(true);

        try {
            // Import the login API function
            const { login } = await import('../api/authApi');

            // Call backend API
            const response = await login({
                username: formData.username,
                password: formData.password
            });

            // Store user data in localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.role);
            localStorage.setItem('email', response.email);
            localStorage.setItem('userId', response.id);
            localStorage.setItem('fullName', response.fullName || '');
            if (response.storeId) {
                localStorage.setItem('storeId', response.storeId);
            }

            // Role-based redirection
            switch (response.role) {
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
                default:
                    navigate('/');
            }
        } catch (error) {
            setErrors({
                general: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page">
            <div className="login-background">
                <div className="login-gradient"></div>
                <div className="login-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
            </div>

            <div className="login-container">
                <div className="login-card scale-in">
                    <div className="login-header">
                        <h1 className="login-title">Đăng nhập</h1>
                        <p className="login-subtitle">Chào mừng trở lại! Vui lòng đăng nhập vào tài khoản của bạn</p>
                    </div>

                    {errors.general && (
                        <div className="error-message">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form">
                        <Input
                            label="Email hoặc Số điện thoại"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            error={errors.username}
                            icon="📧"
                            required
                        />

                        <Input
                            label="Mật khẩu"
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            error={errors.password}
                            icon="🔒"
                            required
                        />

                        <div className="login-options">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="rememberMe"
                                    checked={formData.rememberMe}
                                    onChange={handleChange}
                                />
                                <span>Ghi nhớ đăng nhập</span>
                            </label>
                            <a href="#" className="forgot-password">Quên mật khẩu?</a>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="large"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </Button>
                    </form>

                    <div className="login-divider">
                        <span>hoặc</span>
                    </div>

                    <div className="social-login">
                        <button className="social-btn">
                            <span>🔵</span> Google
                        </button>
                        <button className="social-btn">
                            <span>📘</span> Facebook
                        </button>
                    </div>

                    <div className="login-footer">
                        <p>
                            Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
