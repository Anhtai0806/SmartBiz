import React, { useEffect, useMemo, useState } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import StatusBadge from '../../components/StatusBadge';
import {
    createStaff,
    getAllStaff,
    getStores,
    updateStaff,
    updateStaffStatus
} from '../../api/businessOwnerApi';
import './OwnerStaff.css';

const DEFAULT_FORM = {
    email: '',
    role: 'STAFF',
    salaryType: 'MONTHLY',
    salaryAmount: '',
    storeId: ''
};

const ROLE_LABELS = {
    STAFF: 'Nhân viên',
    CASHIER: 'Thu ngân',
    KITCHEN: 'Bếp'
};

const SALARY_LABELS = {
    MONTHLY: 'Theo tháng',
    HOURLY: 'Theo giờ',
    DAILY: 'Theo ngày',
    SHIFT: 'Theo ca'
};

const OwnerStaff = () => {
    const [staff, setStaff] = useState([]);
    const [stores, setStores] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStoreId, setFilterStoreId] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const loadData = async () => {
        setIsLoading(true);
        setErrorMessage('');

        try {
            const [staffData, storesData] = await Promise.all([
                getAllStaff(),
                getStores()
            ]);
            setStaff(Array.isArray(staffData) ? staffData : []);
            setStores(Array.isArray(storesData) ? storesData : []);
        } catch (error) {
            setErrorMessage(error.message || 'Không thể tải danh sách nhân viên.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const storeOptions = useMemo(() => {
        return stores.map((store) => ({
            id: store.id,
            label: store.name || store.address || `Cửa hàng #${store.id}`
        }));
    }, [stores]);

    const storeLookup = useMemo(() => {
        return new Map(storeOptions.map((store) => [String(store.id), store.label]));
    }, [storeOptions]);

    const handleOpenModal = (staffMember = null) => {
        setErrorMessage('');

        if (staffMember) {
            setEditingStaff(staffMember);
            setFormData({
                email: staffMember.email || '',
                role: staffMember.role || 'STAFF',
                salaryType: staffMember.salaryType || 'MONTHLY',
                salaryAmount: staffMember.salaryAmount || '',
                storeId: staffMember.storeId || ''
            });
        } else {
            setEditingStaff(null);
            setFormData({
                ...DEFAULT_FORM,
                storeId: storeOptions[0]?.id || ''
            });
        }

        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        if (isSubmitting) {
            return;
        }

        setIsModalOpen(false);
        setEditingStaff(null);
        setFormData(DEFAULT_FORM);
        setErrorMessage('');
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((previousState) => ({
            ...previousState,
            [name]: value
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');

        const payload = {
            email: formData.email.trim(),
            role: formData.role,
            salaryType: formData.salaryType || null,
            salaryAmount: formData.salaryAmount === '' ? null : Number(formData.salaryAmount),
            storeId: Number(formData.storeId)
        };

        try {
            if (editingStaff) {
                await updateStaff(editingStaff.id, payload);
            } else {
                await createStaff(payload);
            }

            await loadData();
            handleCloseModal();
        } catch (error) {
            const serverMessage = error.response?.data?.message;
            if (serverMessage && (serverMessage.includes('already exists') || serverMessage.includes('đã tồn tại'))) {
                setErrorMessage('Email này đã được sử dụng bởi một tài khoản khác. Vui lòng nhập email khác.');
            } else {
                setErrorMessage(serverMessage || error.message || 'Không thể lưu thông tin nhân viên.');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleToggleStatus = async (staffMember) => {
        const nextStatus = staffMember.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

        try {
            await updateStaffStatus(staffMember.id, nextStatus);
            await loadData();
        } catch (error) {
            alert(error.message || 'Không thể cập nhật trạng thái nhân viên.');
        }
    };

    const filteredStaff = useMemo(() => {
        const keyword = searchTerm.trim().toLowerCase();

        return staff.filter((staffMember) => {
            const matchesStore = filterStoreId === 'all'
                || String(staffMember.storeId || '') === String(filterStoreId);

            if (!matchesStore) {
                return false;
            }

            if (!keyword) {
                return true;
            }

            const fields = [
                staffMember.fullName || '',
                staffMember.email || '',
                staffMember.phone || '',
                staffMember.storeAddress || '',
                storeLookup.get(String(staffMember.storeId || '')) || '',
                ROLE_LABELS[staffMember.role] || staffMember.role || '',
                staffMember.generatedPassword || ''
            ];

            return fields.some((field) => field.toLowerCase().includes(keyword));
        });
    }, [filterStoreId, searchTerm, staff, storeLookup]);

    const summary = useMemo(() => {
        const total = filteredStaff.length;
        const active = filteredStaff.filter((staffMember) => staffMember.status === 'ACTIVE').length;
        const hourly = filteredStaff.filter((staffMember) => staffMember.salaryType === 'HOURLY').length;

        return { total, active, hourly };
    }, [filteredStaff]);

    return (
        <div className="owner-staff-page">
            <section className="owner-staff-page__header">
                <div>
                    <nav className="owner-staff-page__breadcrumb" aria-label="Điều hướng">
                        <span>Dashboard</span>
                        <span className="owner-staff-page__breadcrumb-separator">›</span>
                        <span className="is-current">Nhân viên</span>
                    </nav>
                    <h1>Quản lý nhân viên</h1>
                </div>

                <div className="owner-staff-page__header-actions">
                    <div className="owner-staff-toolbar">
                        <div className="owner-staff-toolbar__search">
                            <span className="owner-staff-toolbar__search-icon">⌕</span>
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhân viên..."
                                value={searchTerm}
                                onChange={(event) => setSearchTerm(event.target.value)}
                            />
                        </div>

                        <div className="owner-staff-toolbar__select">
                            <select
                                value={filterStoreId}
                                onChange={(event) => setFilterStoreId(event.target.value)}
                            >
                                <option value="all">Tất cả cửa hàng</option>
                                {storeOptions.map((store) => (
                                    <option key={store.id} value={store.id}>
                                        {store.label}
                                    </option>
                                ))}
                            </select>
                            <span className="owner-staff-toolbar__select-caret">▾</span>
                        </div>
                    </div>

                    <Button onClick={() => handleOpenModal()}>
                        Thêm nhân viên
                    </Button>
                </div>
            </section>

            <section className="owner-staff-summary">
                <div className="owner-staff-summary__card">
                    <span>Tổng nhân viên đang hiển thị</span>
                    <strong>{summary.total}</strong>
                </div>
                <div className="owner-staff-summary__card">
                    <span>Đang hoạt động</span>
                    <strong>{summary.active}</strong>
                </div>
                <div className="owner-staff-summary__card">
                    <span>Trả lương theo giờ</span>
                    <strong>{summary.hourly}</strong>
                </div>
            </section>

            {isLoading ? (
                <div className="owner-staff-empty">
                    <p>Đang tải danh sách nhân viên...</p>
                </div>
            ) : errorMessage ? (
                <div className="owner-staff-empty owner-staff-empty--error">
                    <p>{errorMessage}</p>
                </div>
            ) : (
                <section className="owner-staff-table-card">
                    <div className="owner-staff-table-card__inner">
                        <table className="owner-staff-table">
                            <thead>
                                <tr>
                                    <th>Họ tên</th>
                                    <th>Số điện thoại</th>
                                    <th>Vai trò</th>
                                    <th>Hình thức lương</th>
                                    <th className="is-right">Mức lương</th>
                                    <th>Cửa hàng</th>
                                    <th className="is-center">Trạng thái</th>
                                    <th>Mật khẩu</th>
                                    <th className="is-right">Hành động</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredStaff.map((staffMember) => (
                                    <tr key={staffMember.id}>
                                        <td>
                                            <div className="owner-staff-person">
                                                <div className="owner-staff-person__avatar">
                                                    {(staffMember.fullName || staffMember.email || 'S')
                                                        .trim()
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </div>
                                                <div>
                                                    <p className="owner-staff-person__name">
                                                        {staffMember.fullName || 'Chưa cập nhật'}
                                                    </p>
                                                    <p className="owner-staff-person__email">{staffMember.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>{staffMember.phone || 'Chưa cập nhật'}</td>
                                        <td>
                                            <span className={`owner-staff-role ${(staffMember.role || '').toLowerCase()}`}>
                                                {ROLE_LABELS[staffMember.role] || staffMember.role}
                                            </span>
                                        </td>
                                        <td>{SALARY_LABELS[staffMember.salaryType] || 'Chưa cập nhật'}</td>
                                        <td className="is-right owner-staff-mono">
                                            {staffMember.salaryAmount != null
                                                ? new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(staffMember.salaryAmount)
                                                : 'Chưa cập nhật'}
                                        </td>
                                        <td>
                                            {storeLookup.get(String(staffMember.storeId || ''))
                                                || staffMember.storeAddress
                                                || 'Chưa phân cửa hàng'}
                                        </td>
                                        <td className="is-center">
                                            <button
                                                type="button"
                                                className={`owner-staff-status-toggle ${staffMember.status === 'ACTIVE' ? 'is-active' : ''}`}
                                                onClick={() => handleToggleStatus(staffMember)}
                                                aria-label="Đổi trạng thái nhân viên"
                                            >
                                                <span className="owner-staff-status-toggle__track">
                                                    <span className="owner-staff-status-toggle__thumb" />
                                                </span>
                                            </button>
                                            <StatusBadge status={staffMember.status === 'ACTIVE' ? 'active' : 'inactive'}>
                                                {staffMember.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
                                            </StatusBadge>
                                        </td>
                                        <td className="owner-staff-password">
                                            <span class="badge-password">
                                                {staffMember.generatedPassword || 'Nhân viên đã đổi mật khẩu'}
                                            </span>
                                        </td>
                                        <td className="is-right">
                                            <div className="owner-staff-actions">
                                                <button
                                                    type="button"
                                                    className="owner-staff-actions__btn"
                                                    onClick={() => handleOpenModal(staffMember)}
                                                >
                                                    Sửa
                                                </button>
                                                <button
                                                    type="button"
                                                    className="owner-staff-actions__btn owner-staff-actions__btn--warn"
                                                    onClick={() => handleToggleStatus(staffMember)}
                                                >
                                                    {staffMember.status === 'ACTIVE' ? 'Tạm ngưng' : 'Kích hoạt'}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredStaff.length === 0 && (
                            <div className="owner-staff-empty">
                                <p>Không tìm thấy nhân viên phù hợp với bộ lọc hiện tại.</p>
                            </div>
                        )}
                    </div>

                    <div className="owner-staff-table-card__footer">
                        <span>
                            Hiển thị 1-{filteredStaff.length} trong số {staff.length} nhân viên
                        </span>
                        <span>
                            Bộ lọc cửa hàng: {filterStoreId === 'all'
                                ? 'Tất cả cửa hàng'
                                : storeLookup.get(String(filterStoreId))}
                        </span>
                    </div>
                </section>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                title={editingStaff ? 'Cập nhật nhân viên' : 'Thêm nhân viên mới'}
            >
                <form onSubmit={handleSubmit} className="owner-staff-form">
                    {errorMessage && (
                        <div className="owner-staff-form__message owner-staff-form__message--error">
                            {errorMessage}
                        </div>
                    )}

                    <Input
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />

                    <div className="owner-staff-form__grid">
                        <div className="owner-staff-form__field">
                            <label htmlFor="role">Vai trò</label>
                            <select id="role" name="role" value={formData.role} onChange={handleChange} required>
                                <option value="STAFF">Nhân viên</option>
                                <option value="CASHIER">Thu ngân</option>
                                <option value="KITCHEN">Bếp</option>
                            </select>
                        </div>

                        <div className="owner-staff-form__field">
                            <label htmlFor="salaryType">Hình thức trả lương</label>
                            <select
                                id="salaryType"
                                name="salaryType"
                                value={formData.salaryType}
                                onChange={handleChange}
                            >
                                <option value="MONTHLY">Theo tháng</option>
                                <option value="HOURLY">Theo giờ</option>
                                <option value="DAILY">Theo ngày</option>
                                <option value="SHIFT">Theo ca</option>
                            </select>
                        </div>
                    </div>

                    <div className="owner-staff-form__grid">
                        <Input
                            label="Mức lương"
                            name="salaryAmount"
                            type="number"
                            min="0"
                            value={formData.salaryAmount}
                            onChange={handleChange}
                        />

                        <div className="owner-staff-form__field">
                            <label htmlFor="storeId">Cửa hàng làm việc</label>
                            <select
                                id="storeId"
                                name="storeId"
                                value={formData.storeId}
                                onChange={handleChange}
                                required
                            >
                                <option value="">Chọn cửa hàng</option>
                                {storeOptions.map((store) => (
                                    <option key={store.id} value={store.id}>
                                        {store.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="owner-staff-form__actions">
                        <Button type="button" variant="outline" onClick={handleCloseModal}>
                            Đóng
                        </Button>
                        <Button type="submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Đang lưu...' : editingStaff ? 'Cập nhật' : 'Tạo tài khoản'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default OwnerStaff;
