import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import './Register.css';

const Register = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

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

        // Calculate password strength
        if (name === 'password') {
            calculatePasswordStrength(value);
        }
    };

    const calculatePasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 6) strength += 25;
        if (password.length >= 10) strength += 25;
        if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 15;
        if (/[^a-zA-Z0-9]/.test(password)) strength += 10;
        setPasswordStrength(Math.min(strength, 100));
    };

    const getPasswordStrengthLabel = () => {
        if (passwordStrength < 25) return 'Yếu';
        if (passwordStrength < 50) return 'Trung bình';
        if (passwordStrength < 75) return 'Khá';
        return 'Mạnh';
    };

    const getPasswordStrengthColor = () => {
        if (passwordStrength < 25) return '#ef4444';
        if (passwordStrength < 50) return '#f59e0b';
        if (passwordStrength < 75) return '#3b82f6';
        return '#10b981';
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.fullName) {
            newErrors.fullName = 'Họ tên không được để trống';
        }

        if (!formData.email) {
            newErrors.email = 'Email không được để trống';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email không hợp lệ';
        }

        if (!formData.phone) {
            newErrors.phone = 'Số điện thoại không được để trống';
        } else if (!/^[0-9]{10,11}$/.test(formData.phone)) {
            newErrors.phone = 'Số điện thoại phải có 10-11 chữ số';
        }

        if (!formData.password) {
            newErrors.password = 'Mật khẩu không được để trống';
        } else if (formData.password.length < 6) {
            newErrors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
        }

        if (!formData.confirmPassword) {
            newErrors.confirmPassword = 'Vui lòng xác nhận mật khẩu';
        } else if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        }

        if (!formData.agreeTerms) {
            newErrors.agreeTerms = 'Bạn phải đồng ý với điều khoản sử dụng';
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
            // Import the register API function
            const { register } = await import('../api/authApi');

            // Call backend API
            const response = await register({
                fullName: formData.fullName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            // Store user data in localStorage
            localStorage.setItem('token', response.token);
            localStorage.setItem('role', response.role);
            localStorage.setItem('email', response.email);
            localStorage.setItem('fullName', response.fullName || '');

            // Role-based redirection
            switch (response.role) {
                case 'ADMIN':
                    navigate('/admin/dashboard');
                    break;
                case 'BUSINESS_OWNER':
                    navigate('/owner/dashboard');
                    break;
                case 'STAFF':
                case 'CASHIER':
                    navigate('/staff/dashboard');
                    break;
                default:
                    navigate('/');
            }
        } catch (error) {
            setErrors({
                general: error.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.'
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page">
            <div className="register-background">
                <div className="register-gradient"></div>
                <div className="register-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
            </div>

            <div className="register-container">
                <div className="register-card scale-in">
                    <div className="register-header">
                        <h1 className="register-title">Đăng ký</h1>
                        <p className="register-subtitle">Tạo tài khoản mới để bắt đầu sử dụng SmartBiz</p>
                    </div>

                    {errors.general && (
                        <div className="error-message">
                            {errors.general}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="register-form">
                        <Input
                            label="Họ và tên"
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            error={errors.fullName}
                            icon="👤"
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={errors.email}
                            icon="📧"
                            required
                        />

                        <Input
                            label="Số điện thoại"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            error={errors.phone}
                            icon="📱"
                            required
                        />

                        <div>
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
                            {formData.password && (
                                <div className="password-strength">
                                    <div className="strength-bar">
                                        <div
                                            className="strength-fill"
                                            style={{
                                                width: `${passwordStrength}%`,
                                                backgroundColor: getPasswordStrengthColor()
                                            }}
                                        ></div>
                                    </div>
                                    <span
                                        className="strength-label"
                                        style={{ color: getPasswordStrengthColor() }}
                                    >
                                        {getPasswordStrengthLabel()}
                                    </span>
                                </div>
                            )}
                        </div>

                        <Input
                            label="Xác nhận mật khẩu"
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            error={errors.confirmPassword}
                            icon="🔒"
                            required
                        />

                        <div className="terms-checkbox">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleChange}
                                />
                                <span>
                                    Tôi đồng ý với <a href="#">Điều khoản sử dụng</a> và <a href="#">Chính sách bảo mật</a>
                                </span>
                            </label>
                            {errors.agreeTerms && <span className="error-text">{errors.agreeTerms}</span>}
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="large"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </Button>
                    </form>

                    <div className="register-divider">
                        <span>hoặc</span>
                    </div>

                    <div className="social-register">
                        <button className="social-btn">
                            <span>🔵</span> Google
                        </button>
                        <button className="social-btn">
                            <span>📘</span> Facebook
                        </button>
                    </div>

                    <div className="register-footer">
                        <p>
                            Đã có tài khoản? <Link to="/login">Đăng nhập ngay</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
