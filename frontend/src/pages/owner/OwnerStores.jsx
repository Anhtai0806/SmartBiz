import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getStores, createStore } from '../../api/businessOwnerApi';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import StatusBadge from '../../components/StatusBadge';
import './OwnerStores.css';

const OwnerStores = () => {
    const navigate = useNavigate();
    const [stores, setStores] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        phone: '',
        taxRate: '',
        openingTime: '',
        closingTime: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            setLoading(true);
            const data = await getStores();
            setStores(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching stores:', err);
            setError(err.message || 'Không thể tải danh sách cửa hàng');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = () => {
        setFormData({
            name: '',
            address: '',
            phone: '',
            taxRate: '',
            openingTime: '',
            closingTime: ''
        });
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createStore(formData);
            await fetchStores();
            handleCloseModal();
        } catch (err) {
            console.error('Error creating store:', err);
            alert('Không thể tạo cửa hàng: ' + (err.message || 'Lỗi không xác định'));
        }
    };

    const handleStoreClick = (storeId) => {
        navigate(`/owner/stores/${storeId}`);
    };

    const isStoreActive = (status) => status !== false;

    if (loading) {
        return <div className="loading">Đang tải danh sách cửa hàng...</div>;
    }

    return (
        <div className="owner-stores">
            <div className="page-header">
                <div>
                    <h1>Quản lý Cửa hàng</h1>
                    <p>Danh sách các chi nhánh của bạn</p>
                </div>
                <Button onClick={handleOpenModal}>
                    ➕ Thêm cửa hàng
                </Button>
            </div>

            {error && (
                <div className="error-message">
                    <p>❌ {error}</p>
                    <button onClick={fetchStores} className="retry-btn">Thử lại</button>
                </div>
            )}

            {!error && stores.length === 0 && (
                <div className="empty-state">
                    <p>📭 Chưa có cửa hàng nào</p>
                    <Button onClick={handleOpenModal}>Tạo cửa hàng đầu tiên</Button>
                </div>
            )}

            <div className="stores-grid">
                {stores.map(store => (
                    <div
                        key={store.id}
                        className="store-card"
                        onClick={() => handleStoreClick(store.id)}
                    >
                        <div className="store-icon">🏪</div>
                        <h3>{store.name}</h3>
                        <p className="store-address">{store.address}</p>
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
                        label="Tên cửa hàng"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Địa chỉ"
                        type="text"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                    />
                    <Input
                        label="Số điện thoại"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Thuế VAT (%)"
                                type="number"
                                value={formData.taxRate}
                                onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                                step="0.01"
                            />
                        </div>
                    </div>
                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Giờ mở cửa"
                                type="time"
                                value={formData.openingTime}
                                onChange={(e) => setFormData({ ...formData, openingTime: e.target.value })}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Giờ đóng cửa"
                                type="time"
                                value={formData.closingTime}
                                onChange={(e) => setFormData({ ...formData, closingTime: e.target.value })}
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
