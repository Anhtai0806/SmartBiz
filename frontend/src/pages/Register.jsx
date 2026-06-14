import React, { useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../components/Input';
import Button from '../components/Button';
import './Register.css';

const GOOGLE_AUTH_URL = 'http://localhost:8080/oauth2/authorization/google';

const Register = () => {
    const navigate = useNavigate();
    const formRef = useRef(null);
    const [formData, setFormData] = useState({
        fullName: '',
        storeName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        agreeTerms: false
    });
    const [generalError, setGeneralError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

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

    const syncConfirmPasswordValidity = (password, confirmPassword) => {
        const confirmInput = formRef.current?.elements?.confirmPassword;
        if (!confirmInput) {
            return;
        }

        if (!confirmPassword) {
            confirmInput.setCustomValidity('');
            return;
        }

        confirmInput.setCustomValidity(
            password === confirmPassword ? '' : 'Mật khẩu xác nhận không khớp.'
        );
    };

    const setValidationMessage = (target) => {
        const { name, validity } = target;
        let message = '';

        if (validity.customError) {
            return;
        }

        if (validity.valueMissing) {
            switch (name) {
                case 'fullName':
                    message = 'Vui lòng nhập họ và tên.';
                    break;
                case 'storeName':
                    message = 'Vui lòng nhập tên cửa hàng.';
                    break;
                case 'email':
                    message = 'Vui lòng nhập email.';
                    break;
                case 'phone':
                    message = 'Vui lòng nhập số điện thoại.';
                    break;
                case 'password':
                    message = 'Vui lòng nhập mật khẩu.';
                    break;
                case 'confirmPassword':
                    message = 'Vui lòng xác nhận mật khẩu.';
                    break;
                case 'agreeTerms':
                    message = 'Vui lòng đồng ý với điều khoản để tiếp tục.';
                    break;
                default:
                    break;
            }
        } else if (validity.typeMismatch && name === 'email') {
            message = 'Vui lòng nhập địa chỉ email hợp lệ.';
        } else if (validity.patternMismatch && name === 'phone') {
            message = 'Số điện thoại phải gồm 10 hoặc 11 chữ số.';
        } else if (validity.tooShort && name === 'password') {
            message = 'Mật khẩu phải có ít nhất 6 ký tự.';
        }

        target.setCustomValidity(message);
    };

    const showServerFieldError = (fieldName, message) => {
        const target = formRef.current?.elements?.[fieldName];
        if (!target) {
            setGeneralError(message);
            return;
        }

        target.setCustomValidity(message);
        target.reportValidity();
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;
        const nextValue = type === 'checkbox' ? checked : value;

        event.target.setCustomValidity('');
        setGeneralError('');

        setFormData((prev) => {
            const nextFormData = {
                ...prev,
                [name]: nextValue
            };

            if (name === 'password') {
                calculatePasswordStrength(value);
                syncConfirmPasswordValidity(value, prev.confirmPassword);
            }

            if (name === 'confirmPassword') {
                syncConfirmPasswordValidity(prev.password, value);
            }

            return nextFormData;
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        const form = event.currentTarget;

        syncConfirmPasswordValidity(formData.password, formData.confirmPassword);
        if (!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        setIsLoading(true);
        setGeneralError('');

        try {
            const { register } = await import('../api/authApi');
            const response = await register({
                fullName: formData.fullName,
                storeName: formData.storeName,
                email: formData.email,
                phone: formData.phone,
                password: formData.password
            });

            sessionStorage.setItem('pendingRegisterEmail', response.email || formData.email);
            navigate('/register/verify', {
                state: {
                    email: response.email || formData.email,
                    expiresAt: response.expiresAt,
                    expiresInSeconds: response.expiresInSeconds,
                    message: response.message
                }
            });
        } catch (error) {
            const message = error.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại thông tin.';

            if (message.includes('Email already exists')) {
                showServerFieldError('email', 'Email này đã được sử dụng.');
                return;
            }

            if (message.includes('Phone already exists')) {
                showServerFieldError('phone', 'Số điện thoại này đã được sử dụng.');
                return;
            }

            if (message.includes('Email and phone are already associated')) {
                showServerFieldError('email', 'Email này đã được sử dụng.');
                showServerFieldError('phone', 'Số điện thoại này đã được sử dụng.');
                return;
            }

            setGeneralError(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="register-page auth-page">
            <Link to="/" className="auth-brand-link" aria-label="Về trang chủ SmartBiz">
                <span className="auth-brand-icon">SB</span>
                <span className="auth-brand-text">SmartBiz</span>
            </Link>

            <div className="auth-card auth-card-register">
                <section className="auth-form-panel">
                    <div className="register-header auth-header">
                        <h1 className="register-title auth-title">Đăng ký</h1>
                    </div>

                    {generalError && (
                        <div className="auth-error-message">
                            {generalError}
                        </div>
                    )}

                    <form ref={formRef} onSubmit={handleSubmit} className="register-form auth-form">
                        <Input
                            label="Họ và tên"
                            type="text"
                            name="fullName"
                            value={formData.fullName}
                            onChange={handleChange}
                            onInvalid={(event) => setValidationMessage(event.target)}
                            icon="U"
                            required
                        />

                        <Input
                            label="Email"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            onInvalid={(event) => setValidationMessage(event.target)}
                            icon="@"
                            required
                        />

                        <Input
                            label="Tên cửa hàng"
                            type="text"
                            name="storeName"
                            value={formData.storeName}
                            onChange={handleChange}
                            onInvalid={(event) => setValidationMessage(event.target)}
                            icon="S"
                            required
                        />

                        <Input
                            label="Số điện thoại"
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                            onInvalid={(event) => setValidationMessage(event.target)}
                            pattern="[0-9]{10,11}"
                            icon="P"
                            required
                        />

                        <div>
                            <Input
                                label="Mật khẩu"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                onInvalid={(event) => setValidationMessage(event.target)}
                                minLength={6}
                                icon="*"
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
                            onInvalid={(event) => setValidationMessage(event.target)}
                            icon="*"
                            required
                        />

                        <div className="terms-checkbox">
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    name="agreeTerms"
                                    checked={formData.agreeTerms}
                                    onChange={handleChange}
                                    onInvalid={(event) => setValidationMessage(event.target)}
                                    required
                                />
                                <span>
                                    Tôi đồng ý với <a href="/terms">Điều khoản dịch vụ</a> và <a href="/privacy">Chính sách bảo mật</a>
                                </span>
                            </label>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="large"
                            disabled={isLoading}
                            className="auth-submit-btn"
                        >
                            {isLoading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
                        </Button>
                    </form>

                    <div className="register-divider auth-divider">
                        <span>hoặc tiếp tục với</span>
                    </div>

                    <div className="social-register auth-socials">
                        <a href={GOOGLE_AUTH_URL} className="google-auth-btn" aria-label="Tiếp tục với Google">
                            <span className="google-auth-icon">G</span>
                            <span>Tiếp tục với Google</span>
                        </a>
                    </div>
                </section>

                <section className="auth-welcome-panel auth-welcome-right" aria-label="Đăng nhập">
                    <div className="auth-welcome-content">
                        <h2>Chào mừng trở lại!</h2>
                        <p>Bạn đã có tài khoản?</p>
                        <Link to="/login" className="auth-outline-link">Đăng nhập</Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Register;
