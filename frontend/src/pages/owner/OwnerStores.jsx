import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createStore, getStores } from '../../api/businessOwnerApi';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import './OwnerStores.css';

const DEFAULT_FORM = {
    branchName: '',
    address: '',
    phone: '',
    taxRate: '',
    openingTime: '',
    closingTime: ''
};

const OwnerStores = () => {
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState(DEFAULT_FORM);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            setLoading(true);
            const data = await getStores();
            setStores(Array.isArray(data) ? data : []);
            setError(null);
        } catch (err) {
            console.error('Error fetching stores:', err);
            setError(err.message || 'Không thể tải danh sách cửa hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData(DEFAULT_FORM);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
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
        try {
            await createStore(formData);
            await fetchStores();
            handleCloseModal();
        } catch (err) {
            console.error('Error creating store:', err);
            alert('Không thể tạo cửa hàng: ' + (err.message || 'Lỗi không xác định'));
        }
    };

    const isStoreActive = (status) => status !== false;

    if (loading) {
        return <div className="loading">Đang tải danh sách cửa hàng...</div>;
    }

    return (
        <div className="owner-stores">
            <div className="page-header">
                <div>
                    <h1>Quản lý cửa hàng</h1>
                    <p>Danh sách các chi nhánh cửa hàng của bạn.</p>
                </div>
                <Button onClick={handleOpenModal}>
                    Thêm cửa hàng
                </Button>
            </div>

            {error && (
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={fetchStores} className="retry-btn">Thử lại</button>
                </div>
            )}

            {!error && stores.length === 0 && (
                <div className="empty-state">
                    <p>Chưa có cửa hàng nào.</p>
                    <Button onClick={handleOpenModal}>Tạo cửa hàng đầu tiên</Button>
                </div>
            )}

            <div className="stores-grid">
                {stores.map((store) => (
                    <div
                        key={store.id}
                        className="store-card"
                        onClick={() => navigate(`/owner/stores/${store.id}`)}
                    >
                        <div className="store-icon">CN</div>
                        <h3>{store.branchName || store.name || `Chi nhánh #${store.id}`}</h3>
                        <p className="store-address">{store.address || 'Chưa cập nhật địa chỉ'}</p>
                        <p className="store-contact">{store.phone || 'Chưa cập nhật số điện thoại'}</p>

                        <div className="store-footer">
                            <StatusBadge status={isStoreActive(store.status) ? 'success' : 'danger'}>
                                {isStoreActive(store.status) ? 'Đang hoạt động' : 'Tạm ngưng'}
                            </StatusBadge>
                            <span className="store-date">
                                Tạo: {new Date(store.createdAt).toLocaleDateString('vi-VN')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Thêm cửa hàng mới">
                <form onSubmit={handleSubmit} className="store-form">
                    <Input
                        label="Tên chi nhánh"
                        name="branchName"
                        type="text"
                        value={formData.branchName}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Địa chỉ"
                        name="address"
                        type="text"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
                    <Input
                        label="Số điện thoại"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                    />
                    <Input
                        label="Thuế VAT (%)"
                        name="taxRate"
                        type="number"
                        value={formData.taxRate}
                        onChange={handleChange}
                        step="0.01"
                    />
                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Giờ mở cửa"
                                name="openingTime"
                                type="time"
                                value={formData.openingTime}
                                onChange={handleChange}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Giờ đóng cửa"
                                name="closingTime"
                                type="time"
                                value={formData.closingTime}
                                onChange={handleChange}
                            />
                        </div>
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="outline" onClick={handleCloseModal}>
                            Hủy
                        </Button>
                        <Button type="submit">
                            Tạo mới
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default OwnerStores;
