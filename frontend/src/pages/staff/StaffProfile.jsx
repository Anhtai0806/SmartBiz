import React, { useState, useEffect } from 'react';
import { getUserProfile, changePassword } from '../../api/staffApi';
import './StaffProfile.css';

const StaffProfile = () => {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            setLoading(true);
            const profileData = await getUserProfile();
            setProfile(profileData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordError('');

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setPasswordError('Mật khẩu mới không khớp!');
            return;
        }

        if (passwordData.newPassword.length < 8) {
            setPasswordError('Mật khẩu phải có ít nhất 8 ký tự!');
            return;
        }

        try {
            await changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            });
            alert('Đổi mật khẩu thành công!');
            setShowChangePassword(false);
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: ''
            });
        } catch (error) {
            console.error('Error changing password:', error);
            setPasswordError(error.response?.data?.message || 'Không thể đổi mật khẩu. Vui lòng thử lại.');
        }
    };

    if (loading) {
        return <div className="loading">Đang tải thông tin...</div>;
    }

    return (
        <div className="staff-profile">
            <div className="page-header">
                <h2>Hồ sơ cá nhân</h2>
            </div>

            <div className="profile-container">
                <div className="profile-card">
                    <div className="profile-avatar">
                        <span className="avatar-icon">👤</span>
                    </div>

                    <div className="profile-info">
                        <div className="info-row">
                            <span className="info-label">Họ tên:</span>
                            <span className="info-value">{profile?.fullName || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Email:</span>
                            <span className="info-value">{profile?.email || 'N/A'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Số điện thoại:</span>
                            <span className="info-value">{profile?.phone || 'Chưa cập nhật'}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Vai trò:</span>
                            <span className="role-badge">Staff</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Trạng thái:</span>
                            <span className="status-badge active">Hoạt động</span>
                        </div>
                    </div>

                    <button
                        className="btn-change-password"
                        onClick={() => setShowChangePassword(!showChangePassword)}
                    >
                        🔒 Đổi mật khẩu
                    </button>
                </div>

                {showChangePassword && (
                    <div className="change-password-card">
                        <h3>Đổi mật khẩu</h3>
                        <form onSubmit={handlePasswordChange}>
                            <div className="form-group">
                                <label>Mật khẩu hiện tại:</label>
                                <input
                                    type="password"
                                    value={passwordData.currentPassword}
                                    onChange={(e) => setPasswordData({
                                        ...passwordData,
                                        currentPassword: e.target.value
                                    })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Mật khẩu mới:</label>
                                <input
                                    type="password"
                                    value={passwordData.newPassword}
                                    onChange={(e) => setPasswordData({
                                        ...passwordData,
                                        newPassword: e.target.value
                                    })}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label>Xác nhận mật khẩu mới:</label>
                                <input
                                    type="password"
                                    value={passwordData.confirmPassword}
                                    onChange={(e) => setPasswordData({
                                        ...passwordData,
                                        confirmPassword: e.target.value
                                    })}
                                    required
                                />
                            </div>

                            {passwordError && (
                                <div className="error-message">{passwordError}</div>
                            )}

                            <div className="form-actions">
                                <button type="button" className="btn-cancel" onClick={() => setShowChangePassword(false)}>
                                    Hủy
                                </button>
                                <button type="submit" className="btn-submit">
                                    Xác nhận
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffProfile;
