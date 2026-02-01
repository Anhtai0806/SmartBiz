import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Profile.css';

const Profile = () => {
    const [profile, setProfile] = useState({
        fullName: '',
        email: '',
        phone: '',
        role: ''
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [loading, setLoading] = useState(true);

    const token = localStorage.getItem('token');
    const apiBaseUrl = 'http://localhost:8080/auth';

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const response = await axios.get(`${apiBaseUrl}/me`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setProfile(response.data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching profile:', error);
            setMessage({ type: 'error', text: 'Failed to load profile data' });
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswordData({ ...passwordData, [e.target.name]: e.target.value });
    };

    const handleUpdateProfile = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        try {
            const response = await axios.put(
                `${apiBaseUrl}/profile`,
                {
                    fullName: profile.fullName,
                    phone: profile.phone
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            // Update local storage if needed
            localStorage.setItem('fullName', response.data.fullName);

            setMessage({ type: 'success', text: 'Profile updated successfully' });
            // Refresh window to update header name if needed, or rely on state if header was connected to global state
            // For now, simpler to just show success message
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to update profile'
            });
        }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        setMessage({ type: '', text: '' });

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }

        try {
            await axios.put(
                `${apiBaseUrl}/change-password`,
                passwordData,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setMessage({ type: 'success', text: 'Password changed successfully' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error changing password:', error);
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Failed to change password'
            });
        }
    };

    if (loading) return <div className="loading">Loading...</div>;

    return (
        <div className="profile-container">
            <h2>Account Settings</h2>

            {message.text && (
                <div className={`message-alert ${message.type}`}>
                    {message.text}
                </div>
            )}

            <div className="profile-grid">
                <div className="profile-card">
                    <h3>Profile Information</h3>
                    <form onSubmit={handleUpdateProfile}>
                        <div className="form-group">
                            <label>Email (Cannot be changed)</label>
                            <input
                                type="email"
                                value={profile.email}
                                disabled
                                className="form-control"
                            />
                        </div>

                        <div className="form-group">
                            <label>Full Name</label>
                            <input
                                type="text"
                                name="fullName"
                                value={profile.fullName}
                                onChange={handleProfileChange}
                                required
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>Phone Number</label>
                            <input
                                type="text"
                                name="phone"
                                value={profile.phone}
                                onChange={handleProfileChange}
                                required
                                className="form-control"
                            />
                        </div>
                        <button type="submit" className="btn-primary">Update Profile</button>
                    </form>
                </div>

                <div className="profile-card">
                    <h3>Change Password</h3>
                    <form onSubmit={handleChangePassword}>
                        <div className="form-group">
                            <label>Current Password</label>
                            <input
                                type="password"
                                name="currentPassword"
                                value={passwordData.currentPassword}
                                onChange={handlePasswordChange}
                                required
                                className="form-control"
                            />
                        </div>
                        <div className="form-group">
                            <label>New Password</label>
                            <input
                                type="password"
                                name="newPassword"
                                value={passwordData.newPassword}
                                onChange={handlePasswordChange}
                                required
                                className="form-control"
                                minLength="6"
                            />
                        </div>
                        <div className="form-group">
                            <label>Confirm New Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={passwordData.confirmPassword}
                                onChange={handlePasswordChange}
                                required
                                className="form-control"
                                minLength="6"
                            />
                        </div>
                        <button type="submit" className="btn-warning">Change Password</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
