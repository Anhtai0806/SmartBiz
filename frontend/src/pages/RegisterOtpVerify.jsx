import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Input from '../components/Input';
import { resendRegisterOtp, verifyRegisterOtp } from '../api/authApi';
import './Register.css';
import './RegisterOtpVerify.css';

const DEFAULT_EXPIRES_IN_SECONDS = 180;

const RegisterOtpVerify = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const queryEmail = useMemo(() => new URLSearchParams(location.search).get('email'), [location.search]);
    const initialEmail = location.state?.email || queryEmail || sessionStorage.getItem('pendingRegisterEmail') || '';
    const [email, setEmail] = useState(initialEmail);
    const [otpCode, setOtpCode] = useState('');
    const [secondsLeft, setSecondsLeft] = useState(location.state?.expiresInSeconds || DEFAULT_EXPIRES_IN_SECONDS);
    const [message, setMessage] = useState(location.state?.message || 'Mã OTP đã được gửi đến email của bạn.');
    const [error, setError] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
        if (!email) {
            navigate('/register', { replace: true });
            return;
        }

        sessionStorage.setItem('pendingRegisterEmail', email);
    }, [email, navigate]);

    useEffect(() => {
        if (isVerified || secondsLeft <= 0) {
            return undefined;
        }

        const timer = setInterval(() => {
            setSecondsLeft((prev) => Math.max(prev - 1, 0));
        }, 1000);

        return () => clearInterval(timer);
    }, [isVerified, secondsLeft]);

    const formattedTime = useMemo(() => {
        const minutes = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
        const seconds = String(secondsLeft % 60).padStart(2, '0');
        return `${minutes}:${seconds}`;
    }, [secondsLeft]);

    const handleOtpChange = (event) => {
        const value = event.target.value.replace(/\D/g, '').slice(0, 6);
        setOtpCode(value);
        if (error) {
            setError('');
        }
    };

    const handleVerify = async (event) => {
        event.preventDefault();

        if (!/^\d{6}$/.test(otpCode)) {
            setError('Vui lòng nhập đúng 6 chữ số OTP.');
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            await verifyRegisterOtp({ email, otpCode });
            sessionStorage.removeItem('pendingRegisterEmail');
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            localStorage.removeItem('email');
            localStorage.removeItem('userId');
            localStorage.removeItem('fullName');
            localStorage.removeItem('storeId');
            setIsVerified(true);
            setMessage('Xác nhận đăng ký thành công. Đang chuyển đến trang đăng nhập...');
            setTimeout(() => {
                navigate('/login', {
                    replace: true,
                    state: { message: 'Đăng ký thành công. Vui lòng đăng nhập.' }
                });
            }, 1600);
        } catch (err) {
            setError(err.message || 'Xác nhận OTP thất bại.');
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        setIsResending(true);
        setError('');

        try {
            const response = await resendRegisterOtp(email);
            setEmail(response.email || email);
            setOtpCode('');
            setSecondsLeft(response.expiresInSeconds || DEFAULT_EXPIRES_IN_SECONDS);
            setMessage('Mã OTP mới đã được gửi. Mã cũ không còn hiệu lực.');
        } catch (err) {
            setError(err.message || 'Không thể gửi lại OTP.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="register-verify-page auth-page">
            <Link to="/" className="auth-brand-link" aria-label="Về trang chủ SmartBiz">
                <span className="auth-brand-icon">SB</span>
                <span className="auth-brand-text">SmartBiz</span>
            </Link>

            <div className="auth-card auth-card-verify">
                <section className="auth-form-panel otp-form-panel">
                    <div className="register-header auth-header">
                        <h1 className="register-title auth-title">Xác thực OTP</h1>
                        <p className="otp-subtitle">Nhập mã 6 chữ số đã gửi đến {email}</p>
                    </div>

                    {message && (
                        <div className={`otp-message ${isVerified ? 'otp-message-success' : ''}`}>
                            {message}
                        </div>
                    )}

                    {error && (
                        <div className="auth-error-message">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="register-form auth-form otp-form">
                        <Input
                            label="Mã OTP"
                            type="text"
                            name="otpCode"
                            value={otpCode}
                            onChange={handleOtpChange}
                            error=""
                            icon="#"
                            required
                        />

                        <div className="otp-meta">
                            <span>Hiệu lực: {formattedTime}</span>
                            <button
                                type="button"
                                className="otp-resend-btn"
                                onClick={handleResend}
                                disabled={isResending || isVerified}
                            >
                                {isResending ? 'Đang gửi...' : 'Gửi lại mã'}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="large"
                            disabled={isVerifying || isVerified}
                            className="auth-submit-btn"
                        >
                            {isVerifying ? 'Đang xác nhận...' : 'Xác nhận đăng ký'}
                        </Button>
                    </form>

                    <div className="otp-back-link">
                        <Link to="/register">Dùng email khác</Link>
                    </div>
                </section>

                <section className="auth-welcome-panel auth-welcome-right" aria-label="Đăng nhập">
                    <div className="auth-welcome-content">
                        <h2>Sắp xong rồi</h2>
                        <p>Xác thực email để hoàn tất tài khoản.</p>
                        <Link to="/login" className="auth-outline-link">Đăng nhập</Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default RegisterOtpVerify;
