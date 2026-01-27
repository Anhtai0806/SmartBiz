import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import StatusBadge from '../../components/StatusBadge';
import { createStaff, updateStaff, updateStaffStatus } from '../../api/businessOwnerApi';
import './OwnerStaff.css';

const OwnerStaff = () => {
    const [staff, setStaff] = useState([]);
    const [stores, setStores] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'STAFF',
        salaryType: 'MONTHLY',
        salaryAmount: '',
        storeId: '',
        isActive: true
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        // TODO: Fetch staff and stores from backend API
        setStores([
            { id: 1, name: 'Chi nhánh Quận 1' },
            { id: 2, name: 'Chi nhánh Quận 3' },
            { id: 3, name: 'Chi nhánh Thủ Đức' }
        ]);

        setStaff([
            { id: 1, fullName: 'Nguyễn Văn A', email: 'nva@example.com', phoneNumber: '0901111111', role: 'STAFF', storeName: 'Chi nhánh Quận 1', isActive: true },
            { id: 2, fullName: 'Trần Thị B', email: 'ttb@example.com', phoneNumber: '0902222222', role: 'CASHIER', storeName: 'Chi nhánh Quận 1', isActive: true },
            { id: 3, fullName: 'Lê Văn C', email: 'lvc@example.com', phoneNumber: '0903333333', role: 'STAFF', storeName: 'Chi nhánh Quận 3', isActive: false }
        ]);
    }, []);

    const handleOpenModal = (staffMember = null) => {
        if (staffMember) {
            setEditingStaff(staffMember);
            setFormData({ ...staffMember, password: '' });
        } else {
            setEditingStaff(null);
            setFormData({
                fullName: '',
                email: '',
                password: '',
                phoneNumber: '',
                role: 'STAFF',
                salaryType: 'MONTHLY',
                salaryAmount: '',
                storeId: '',
                isActive: true
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingStaff(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: Call backend API to create/update staff
        try {
            if (editingStaff) {
                await updateStaff(editingStaff.id, formData);
                setStaff(staff.map(s => s.id === editingStaff.id ? { ...s, ...formData } : s));
            } else {
                const newStaff = await createStaff(formData);
                setStaff([...staff, newStaff]);
            }
            handleCloseModal();
        } catch (error) {
            console.error("Error saving staff:", error);
            alert("Có lỗi xảy ra: " + (error.message || "Không xác định"));
        }
    };

    const handleToggleStatus = async (id) => {
        // TODO: Call backend API to activate/deactivate staff
        setStaff(staff.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
            // TODO: Call backend API to delete staff
            setStaff(staff.filter(s => s.id !== id));
        }
    };

    const filteredStaff = staff.filter(s =>
        s.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="owner-staff">
            <div className="page-header">
                <div>
                    <h1>Quản lý Nhân viên</h1>
                    <p>Quản lý tài khoản nhân viên và phân công cửa hàng</p>
                </div>
                <Button onClick={() => handleOpenModal()}>
                    ➕ Thêm nhân viên
                </Button>
            </div>

            <div className="search-bar">
                <Input
                    type="text"
                    placeholder="🔍 Tìm kiếm nhân viên..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="staff-table">
                <table>
                    <thead>
                        <tr>
                            <th>Họ tên</th>
                            <th>Email</th>
                            <th>Số điện thoại</th>
                            <th>Vai trò</th>
                            <th>Mức lương</th>
                            <th>Cửa hàng</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredStaff.map(staffMember => (
                            <tr key={staffMember.id}>
                                <td className="staff-name">{staffMember.fullName}</td>
                                <td>{staffMember.email}</td>
                                <td>{staffMember.phoneNumber}</td>
                                <td>
                                    <span className={`role-badge ${staffMember.role.toLowerCase()}`}>
                                        {staffMember.role === 'STAFF' ? 'Nhân viên' : 'Thu ngân'}
                                    </span>
                                </td>
                                <td>
                                    {staffMember.salaryAmount ? (
                                        <span>
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(staffMember.salaryAmount)}
                                            <small className="text-muted">/{staffMember.salaryType === 'HOURLY' ? 'giờ' : 'tháng'}</small>
                                        </span>
                                    ) : (
                                        <span className="text-muted">Chưa cập nhật</span>
                                    )}
                                </td>
                                <td>{staffMember.storeName}</td>
                                <td>
                                    <StatusBadge status={staffMember.isActive ? 'active' : 'inactive'}>
                                        {staffMember.isActive ? 'Hoạt động' : 'Ngừng hoạt động'}
                                    </StatusBadge>
                                </td>
                                <td className="actions">
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleOpenModal(staffMember)}
                                        title="Chỉnh sửa"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-toggle"
                                        onClick={() => handleToggleStatus(staffMember.id)}
                                        title={staffMember.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                                    >
                                        {staffMember.isActive ? '🔴' : '🟢'}
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(staffMember.id)}
                                        title="Xóa"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredStaff.length === 0 && (
                    <div className="empty-state">
                        <p>Không tìm thấy nhân viên nào</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingStaff ? 'Chỉnh sửa nhân viên' : 'Thêm nhân viên mới'}>
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
                    {!editingStaff && (
                        <Input
                            label="Mật khẩu"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                        />
                    )}
                    <Input
                        label="Số điện thoại"
                        type="tel"
                        value={formData.phoneNumber}
                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                        required
                    />
                    <div className="form-group">
                        <label>Vai trò</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            required
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
                    <div className="form-group">
                        <label>Cửa hàng</label>
                        <select
                            value={formData.storeId}
                            onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                            required
                        >
                            <option value="">Chọn cửa hàng</option>
                            {stores.map(store => (
                                <option key={store.id} value={store.id}>{store.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="outline" onClick={handleCloseModal}>
                            Hủy
                        </Button>
                        <Button type="submit">
                            {editingStaff ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default OwnerStaff;
