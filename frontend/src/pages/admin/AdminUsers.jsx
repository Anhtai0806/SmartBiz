import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserStatus } from '../../api/adminApi';
import StatusBadge from '../../components/StatusBadge';
import Modal from '../../components/Modal';
import './AdminUsers.css';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusToggle = async (userId, currentStatus) => {
        const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
        try {
            await updateUserStatus(userId, newStatus);
            // Refresh users list
            await fetchUsers();
        } catch (err) {
            alert('Failed to update user status: ' + err.message);
        }
    };

    const handleViewDetails = (user) => {
        setSelectedUser(user);
        setShowModal(true);
    };

    const filteredUsers = users.filter(user =>
        user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div className="loading">Loading users...</div>;
    }

    if (error) {
        return <div className="error">Error: {error}</div>;
    }

    return (
        <div className="admin-users">
            <div className="users-header">
                <h1>User Management</h1>
                <div className="search-bar">
                    <input
                        type="text"
                        placeholder="Search by email or name..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="users-table-container">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th>Email</th>
                            <th>Full Name</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Created At</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredUsers.map(user => (
                            <tr key={user.id}>
                                <td>{user.email}</td>
                                <td>{user.fullName || 'N/A'}</td>
                                <td>
                                    <StatusBadge status={user.role} type="role" />
                                </td>
                                <td>
                                    <StatusBadge status={user.status} type="status" />
                                </td>
                                <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                <td>
                                    <div className="action-buttons">
                                        <button
                                            className="btn-view"
                                            onClick={() => handleViewDetails(user)}
                                        >
                                            View
                                        </button>
                                        {user.role === 'BUSINESS_OWNER' && (
                                            <button
                                                className={`btn-toggle ${user.status === 'ACTIVE' ? 'btn-lock' : 'btn-unlock'}`}
                                                onClick={() => handleStatusToggle(user.id, user.status)}
                                            >
                                                {user.status === 'ACTIVE' ? 'Lock' : 'Unlock'}
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="User Details"
            >
                {selectedUser && (
                    <div className="user-details">
                        <div className="detail-row">
                            <span className="detail-label">Email:</span>
                            <span className="detail-value">{selectedUser.email}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Full Name:</span>
                            <span className="detail-value">{selectedUser.fullName || 'N/A'}</span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Role:</span>
                            <span className="detail-value">
                                <StatusBadge status={selectedUser.role} type="role" />
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Status:</span>
                            <span className="detail-value">
                                <StatusBadge status={selectedUser.status} type="status" />
                            </span>
                        </div>
                        <div className="detail-row">
                            <span className="detail-label">Created At:</span>
                            <span className="detail-value">
                                {new Date(selectedUser.createdAt).toLocaleString()}
                            </span>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default AdminUsers;
