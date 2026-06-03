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
    const [message, setMessage] = useState(location.state?.message || 'Ma OTP da duoc gui den email cua ban.');
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
            setSecondsLeft(prev => Math.max(prev - 1, 0));
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
            setError('Vui long nhap dung 6 chu so OTP.');
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
            setMessage('Xac nhan dang ky thanh cong. Dang chuyen den trang dang nhap...');
            setTimeout(() => {
                navigate('/login', {
                    replace: true,
                    state: { message: 'Dang ky thanh cong. Vui long dang nhap.' }
                });
            }, 1600);
        } catch (err) {
            setError(err.message || 'Xac nhan OTP that bai.');
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
            setMessage('Ma OTP moi da duoc gui. Ma cu khong con hieu luc.');
        } catch (err) {
            setError(err.message || 'Khong the gui lai OTP.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <div className="register-verify-page auth-page">
            <Link to="/" className="auth-brand-link" aria-label="Ve trang chu SmartBiz">
                <span className="auth-brand-icon">SB</span>
                <span className="auth-brand-text">SmartBiz</span>
            </Link>

            <div className="auth-card auth-card-verify">
                <section className="auth-form-panel otp-form-panel">
                    <div className="register-header auth-header">
                        <h1 className="register-title auth-title">Verify OTP</h1>
                        <p className="otp-subtitle">Nhap ma 6 chu so da gui den {email}</p>
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
                            label="Ma OTP"
                            type="text"
                            name="otpCode"
                            value={otpCode}
                            onChange={handleOtpChange}
                            error=""
                            icon="#"
                            required
                        />

                        <div className="otp-meta">
                            <span>Hieu luc: {formattedTime}</span>
                            <button
                                type="button"
                                className="otp-resend-btn"
                                onClick={handleResend}
                                disabled={isResending || isVerified}
                            >
                                {isResending ? 'Dang gui...' : 'Gui lai ma'}
                            </button>
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            size="large"
                            disabled={isVerifying || isVerified}
                            className="auth-submit-btn"
                        >
                            {isVerifying ? 'Dang xac nhan...' : 'Xac nhan dang ky'}
                        </Button>
                    </form>

                    <div className="otp-back-link">
                        <Link to="/register">Dung email khac</Link>
                    </div>
                </section>

                <section className="auth-welcome-panel auth-welcome-right" aria-label="Dang nhap">
                    <div className="auth-welcome-content">
                        <h2>Almost Done</h2>
                        <p>Xac thuc email de hoan tat tai khoan.</p>
                        <Link to="/login" className="auth-outline-link">Login</Link>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default RegisterOtpVerify;
