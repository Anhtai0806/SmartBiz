import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStoreDetails, updateStore } from '../../api/businessOwnerApi';
import StaffTab from './StaffTab';
import InventoryTab from './InventoryTab';
import TablesTab from './TablesTab';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import Button from '../../components/Button';
import StatusBadge from '../../components/StatusBadge';
import './StoreDetail.css';

const StoreDetail = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [activeTab, setActiveTab] = useState('staff');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editFormData, setEditFormData] = useState({
        name: '',
        address: '',
        status: 'ACTIVE'
    });

    const fetchStoreDetails = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getStoreDetails(storeId);
            setStore(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching store details:', err);
            setError(err.message || 'Không thể tải thông tin cửa hàng');
        } finally {
            setLoading(false);
        }
    }, [storeId]);

    useEffect(() => {
        fetchStoreDetails();
    }, [fetchStoreDetails]);

    const handleEditStore = () => {
        setEditFormData({
            name: store.name,
            address: store.address || '',
            phone: store.phone || '',
            taxRate: store.taxRate || '',
            openingTime: store.openingTime || '',
            closingTime: store.closingTime || '',
            status: store.status || 'ACTIVE'
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateStore = async (e) => {
        e.preventDefault();
        try {
            await updateStore(storeId, editFormData);
            setIsEditModalOpen(false);
            await fetchStoreDetails();
        } catch (err) {
            console.error('Error updating store:', err);
            alert('Không thể cập nhật cửa hàng: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) {
        return <div className="loading">Đang tải thông tin cửa hàng...</div>;
    }

    if (error) {
        return (
            <div className="store-detail">
                <div className="error-message">
                    <p>❌ {error}</p>
                    <button onClick={() => navigate('/owner/stores')} className="back-btn">
                        Quay lại danh sách
                    </button>
                </div>
            </div>
        );
    }

    if (!store) {
        return <div className="loading">Không tìm thấy cửa hàng</div>;
    }

    return (
        <div className="store-detail">
            <div className="store-header">
                <button onClick={() => navigate('/owner/stores')} className="back-btn">
                    ← Quay lại
                </button>
                <div className="store-info">
                    <div className="store-title-row">
                        <h1>🏪 {store.name}</h1>
                        <StatusBadge status={store.status === 'ACTIVE' ? 'success' : 'danger'}>
                            {store.status === 'ACTIVE' ? 'Đang hoạt động' : 'Tạm ngưng'}
                        </StatusBadge>
                    </div>
                    <p className="store-address">📍 {store.address}</p>
                    {store.phone && <p className="store-address">📞 {store.phone}</p>}
                    <div style={{ display: 'flex', gap: '20px', marginTop: '8px', color: '#666' }}>
                        {store.taxRate && <span>💰 VAT: {store.taxRate}%</span>}
                        {(store.openingTime || store.closingTime) && (
                            <span>🕒 {store.openingTime?.slice(0, 5)} - {store.closingTime?.slice(0, 5)}</span>
                        )}
                    </div>
                </div>
                <button onClick={handleEditStore} className="edit-store-btn">
                    ✏️ Sửa cửa hàng
                </button>
            </div>

            <div className="tabs-container">
                <div className="tabs-header">
                    <button
                        className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
                        onClick={() => setActiveTab('staff')}
                    >
                        👥 Nhân viên ({store.staffMembers?.length || 0})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
                        onClick={() => setActiveTab('tables')}
                    >
                        🪑 Bàn ({store.tables?.length || 0})
                    </button>
                    <button
                        className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                        onClick={() => setActiveTab('inventory')}
                    >
                        📦 Kho hàng ({store.menuItems?.length || 0})
                    </button>
                </div>

                <div className="tab-content">
                    {activeTab === 'staff' && (
                        <StaffTab
                            storeId={store.id}
                            staffMembers={store.staffMembers}
                            onUpdate={fetchStoreDetails}
                        />
                    )}
                    {activeTab === 'tables' && (
                        <TablesTab
                            storeId={store.id}
                            tables={store.tables}
                            onUpdate={fetchStoreDetails}
                        />
                    )}
                    {activeTab === 'inventory' && (
                        <InventoryTab
                            storeId={store.id}
                            menuItems={store.menuItems}
                            onUpdate={fetchStoreDetails}
                        />
                    )}
                </div>
            </div>

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Sửa thông tin cửa hàng">
                <form onSubmit={handleUpdateStore} className="edit-store-form">
                    <Input
                        label="Tên cửa hàng"
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Địa chỉ"
                        type="text"
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    />
                    <Input
                        label="Số điện thoại"
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Thuế VAT (%)"
                                type="number"
                                value={editFormData.taxRate}
                                onChange={(e) => setEditFormData({ ...editFormData, taxRate: e.target.value })}
                                step="0.01"
                            />
                        </div>
                    </div>
                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Giờ mở cửa"
                                type="time"
                                value={editFormData.openingTime}
                                onChange={(e) => setEditFormData({ ...editFormData, openingTime: e.target.value })}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Giờ đóng cửa"
                                type="time"
                                value={editFormData.closingTime}
                                onChange={(e) => setEditFormData({ ...editFormData, closingTime: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Trạng thái</label>
                        <select
                            value={editFormData.status}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                            className="status-select"
                        >
                            <option value="ACTIVE">Đang hoạt động</option>
                            <option value="INACTIVE">Tạm ngưng</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="submit">Lưu thay đổi</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StoreDetail;
