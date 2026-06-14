import React, { useEffect, useState } from 'react';
import Button from './Button';
import Input from './Input';
import { completeOnboarding, getCurrentUser } from '../api/authApi';
import './EmployeeOnboardingModal.css';

const DEFAULT_FORM = {
    fullName: '',
    phone: '',
    newPassword: '',
    confirmPassword: ''
};

const EmployeeOnboardingModal = ({ roleLabel }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        const loadCurrentUser = async () => {
            try {
                const user = await getCurrentUser();
                const onboardingCompleted = user.onboardingCompleted !== false;

                localStorage.setItem('fullName', user.fullName || '');
                localStorage.setItem('email', user.email || '');
                localStorage.setItem('storeName', user.storeName || '');
                localStorage.setItem('onboardingCompleted', String(onboardingCompleted));
                if (user.storeId) {
                    localStorage.setItem('storeId', user.storeId);
                } else {
                    localStorage.removeItem('storeId');
                }

                setFormData((previousState) => ({
                    ...previousState,
                    fullName: user.fullName || '',
                    phone: user.phone || ''
                }));
                setIsVisible(!onboardingCompleted);
            } catch (error) {
                setErrorMessage(error.message || 'Không thể tải thông tin tài khoản.');
                setIsVisible(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadCurrentUser();
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previousState) => ({
            ...previousState,
            [name]: value
        }));
        if (errorMessage) {
            setErrorMessage('');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        try {
            const updatedUser = await completeOnboarding(formData);
            localStorage.setItem('fullName', updatedUser.fullName || '');
            localStorage.setItem('email', updatedUser.email || '');
            localStorage.setItem('storeName', updatedUser.storeName || '');
            localStorage.setItem('onboardingCompleted', 'true');
            if (updatedUser.storeId) {
                localStorage.setItem('storeId', updatedUser.storeId);
            } else {
                localStorage.removeItem('storeId');
            }
            setIsVisible(false);
        } catch (error) {
            setErrorMessage(error.message || 'Không thể cập nhật thông tin tài khoản.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading || !isVisible) {
        return null;
    }

    return (
        <div className="employee-onboarding-overlay">
            <div className="employee-onboarding-card">
                <h2>Hoàn tất thiết lập tài khoản</h2>
                <p>
                    Tài khoản {roleLabel} này vừa được cấp. Vui lòng cập nhật họ tên, số điện thoại và đổi mật khẩu
                    trước khi tiếp tục sử dụng hệ thống.
                </p>

                {errorMessage && <div className="employee-onboarding-error">{errorMessage}</div>}

                <form className="employee-onboarding-form" onSubmit={handleSubmit}>
                    <Input
                        label="Họ và tên"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Số điện thoại"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Mật khẩu mới"
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Xác nhận mật khẩu mới"
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    <Button type="submit" fullWidth disabled={isSubmitting}>
                        {isSubmitting ? 'Đang cập nhật...' : 'Hoàn tất thiết lập'}
                    </Button>
                </form>
            </div>
        </div>
    );
};

export default EmployeeOnboardingModal;
