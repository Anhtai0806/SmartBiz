import React, { useState } from 'react';
import { createStaff, assignStaffToStore, removeStaffFromStore, updateStaffStatus, updateStaff } from '../../api/businessOwnerApi';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import StatusBadge from '../../components/StatusBadge';
import './StaffTab.css';

const StaffTab = ({ storeId, staffMembers, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        role: 'STAFF',
        salaryType: 'MONTHLY',
        salaryAmount: ''
    });

    const handleOpenModal = (staff = null) => {
        if (staff) {
            setEditingStaff(staff);
            // Password is not filled for security, and it's optional in update
            setFormData({
                fullName: staff.fullName,
                email: staff.email,
                password: '',
                role: staff.role,
                salaryType: staff.salaryType || 'MONTHLY',
                salaryAmount: staff.salaryAmount || ''
            });
        } else {
            setEditingStaff(null);
            setFormData({ fullName: '', email: '', password: '', role: 'STAFF', salaryType: 'MONTHLY', salaryAmount: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingStaff) {
                await updateStaff(editingStaff.id, formData);
            } else {
                // Create staff
                const newStaff = await createStaff(formData);
                // Assign to store
                await assignStaffToStore(storeId, newStaff.id);
            }
            setIsModalOpen(false);
            onUpdate();
        } catch (err) {
            console.error('Error saving staff:', err);
            alert('Không thể lưu thông tin nhân viên: ' + (err.message || 'Lỗi không xác định'));
        }
    };

    const handleRemove = async (staffId) => {
        if (window.confirm('Bạn có chắc muốn xóa nhân viên này khỏi cửa hàng?')) {
            try {
                await removeStaffFromStore(storeId, staffId);
                onUpdate();
            } catch (err) {
                console.error('Error removing staff:', err);
                alert('Không thể xóa nhân viên');
            }
        }
    };

    const handleToggleStatus = async (staffId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
            await updateStaffStatus(staffId, newStatus);
            onUpdate();
        } catch (err) {
            console.error('Error updating status:', err);
            alert('Không thể cập nhật trạng thái');
        }
    };

    return (
        <div className="staff-tab">
            <div className="tab-header">
                <h3>Danh sách Nhân viên</h3>
                <Button onClick={() => handleOpenModal()}>➕ Thêm nhân viên</Button>
            </div>

            {staffMembers && staffMembers.length > 0 ? (
                <div className="staff-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Họ tên</th>
                                <th>Email</th>
                                <th>Vai trò</th>
                                <th>Mức lương</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {staffMembers.map(staff => (
                                <tr key={staff.id}>
                                    <td className="staff-name">{staff.fullName}</td>
                                    <td>{staff.email}</td>
                                    <td>
                                        <span className={`role-badge ${staff.role.toLowerCase()}`}>
                                            {staff.role === 'STAFF' ? 'Nhân viên' : 'Thu ngân'}
                                        </span>
                                    </td>
                                    <td>
                                        {staff.salaryAmount ? (
                                            <span>
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(staff.salaryAmount)}
                                                <small className="text-muted">/{staff.salaryType === 'HOURLY' ? 'giờ' : 'tháng'}</small>
                                            </span>
                                        ) : (
                                            <span className="text-muted">Chưa cập nhật</span>
                                        )}
                                    </td>
                                    <td>
                                        <StatusBadge status={staff.status === 'ACTIVE' ? 'active' : 'inactive'}>
                                            {staff.status === 'ACTIVE' ? 'Hoạt động' : 'Ngừng'}
                                        </StatusBadge>
                                    </td>
                                    <td className="actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleOpenModal(staff)}
                                            title="Chỉnh sửa"
                                        >
                                            ✏️
                                        </button>

                                        <button
                                            className="btn-toggle"
                                            onClick={() => handleToggleStatus(staff.id, staff.status)}
                                            title={staff.status === 'ACTIVE' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                        >
                                            {staff.status === 'ACTIVE' ? '🔴' : '🟢'}
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleRemove(staff.id)}
                                            title="Xóa khỏi cửa hàng"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <p>📭 Chưa có nhân viên nào</p>
                    <Button onClick={handleOpenModal}>Thêm nhân viên đầu tiên</Button>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingStaff ? "Chỉnh sửa nhân viên" : "Thêm nhân viên mới"}>
                <form onSubmit={handleSubmit} className="staff-form">
                    <Input
                        label="Họ tên"
                        type="text"
                        value={formData.fullName}
                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                        required
                    />
                    <Input
                        label="Email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        required
                    />
                    <Input
                        label="Mật khẩu"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                    />
                    <div className="form-group">
                        <label>Vai trò</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        >
                            <option value="STAFF">Nhân viên</option>
                            <option value="CASHIER">Thu ngân</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Hình thức trả lương</label>
                        <select
                            value={formData.salaryType}
                            onChange={(e) => setFormData({ ...formData, salaryType: e.target.value })}
                        >
                            <option value="MONTHLY">Theo tháng</option>
                            <option value="HOURLY">Theo giờ</option>
                        </select>
                    </div>
                    <Input
                        label="Mức lương (VNĐ)"
                        type="number"
                        min="0"
                        value={formData.salaryAmount}
                        onChange={(e) => setFormData({ ...formData, salaryAmount: e.target.value })}
                        placeholder="Nhập số tiền"
                    />
                    <div className="form-actions">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="submit">{editingStaff ? 'Cập nhật' : 'Tạo mới'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StaffTab;
