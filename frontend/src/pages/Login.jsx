import React, { useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import './Login.css';

const GOOGLE_AUTH_URL = 'http://localhost:8080/oauth2/authorization/google';

const Login = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        rememberMe: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);

    const redirectByRole = useCallback((role) => {
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
                navigate('/');
                break;
        }
    }, [navigate]);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const oauthError = params.get('error');
        const oauthToken = params.get('token');
        const oauthRole = params.get('role');

        if (oauthError) {
            setErrors({ general: oauthError });
            return;
        }

        if (oauthToken && oauthRole) {
            localStorage.setItem('token', oauthToken);
            localStorage.setItem('role', oauthRole);
            localStorage.setItem('email', params.get('email') || '');
            localStorage.setItem('userId', params.get('userId') || '');
            localStorage.setItem('fullName', params.get('fullName') || '');
            const storeId = params.get('storeId');
            if (storeId && storeId !== 'null') {
                localStorage.setItem('storeId', storeId);
            } else {
                localStorage.removeItem('storeId');
            }
            localStorage.setItem('rememberMe', 'true');
            redirectByRole(oauthRole);
            return;
        }

    }, [location.search, redirectByRole]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));

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
            const { login } = await import('../api/authApi');
            const response = await login({
                username: formData.username,
                password: formData.password
            });

            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.role);
            localStorage.setItem('email', response.email);
            localStorage.setItem('userId', response.id);
            localStorage.setItem('fullName', response.fullName || '');
            if (response.storeId) {
                localStorage.setItem('storeId', response.storeId);
            }
            localStorage.setItem('rememberMe', formData.rememberMe.toString());

            redirectByRole(response.role);
        } catch (error) {
            setErrors({
                general: error.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="login-page auth-page">
            <Link to="/" className="auth-brand-link" aria-label="Về trang chủ SmartBiz">
                <span className="auth-brand-icon">📊</span>
                <span className="auth-brand-text">SmartBiz</span>
            </Link>

            <div className="auth-card auth-card-login">
                <section className="auth-welcome-panel auth-welcome-left" aria-label="Đăng ký tài khoản">
                    <div className="auth-welcome-content">
                        <h2>Hello, Welcome!</h2>
                        <p>Don't have an account?</p>
                        <Link to="/register" className="auth-outline-link">Register</Link>
                    </div>
                </section>

                <section className="auth-form-panel">
                    <div className="login-header auth-header">
                        <h1 className="login-title auth-title">Login</h1>
                    </div>

                    {errors.general && (
                        <div className="auth-error-message">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="login-form auth-form">
                        <Input
                            label="Email hoặc số điện thoại"
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            error={errors.username}
                            icon="👤"
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
                            <button type="button" className="forgot-password">Quên mật khẩu?</button>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="large"
                            disabled={isLoading}
                            className="auth-submit-btn"
                        >
                            {isLoading ? 'Đang đăng nhập...' : 'Login'}
                        </Button>
                    </form>

                    <div className="login-divider auth-divider">
                        <span>hoặc đăng nhập nhanh</span>
                    </div>

                    <div className="social-login auth-socials">
                        <a href={GOOGLE_AUTH_URL} className="google-auth-btn" aria-label="Đăng nhập bằng Google">
                            <span className="google-auth-icon">G</span>
                            <span>Đăng nhập bằng Google</span>
                        </a>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Login;
