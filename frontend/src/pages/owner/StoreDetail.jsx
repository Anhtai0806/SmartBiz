import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getStoreDetails, updateStore } from '../../api/businessOwnerApi';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Modal from '../../components/Modal';
import StatusBadge from '../../components/StatusBadge';
import InventoryTab from './InventoryTab';
import StaffTab from './StaffTab';
import TablesTab from './TablesTab';
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
        branchName: '',
        address: '',
        phone: '',
        taxRate: '',
        openingTime: '',
        closingTime: '',
        status: true
    });

    const isStoreActive = (status) => status !== false;
    const displayTitle = store?.branchName || store?.name || `Chi nhánh #${store?.id || ''}`;

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
            branchName: store.branchName || store.name || '',
            address: store.address || '',
            phone: store.phone || '',
            taxRate: store.taxRate || '',
            openingTime: store.openingTime || '',
            closingTime: store.closingTime || '',
            status: isStoreActive(store.status)
        });
        setIsEditModalOpen(true);
    };

    const handleUpdateStore = async (event) => {
        event.preventDefault();
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
                    <p>{error}</p>
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
                    Quay lại
                </button>
                <div className="store-info">
                    <div className="store-title-row">
                        <h1>{displayTitle}</h1>
                        <StatusBadge status={isStoreActive(store.status) ? 'success' : 'danger'}>
                            {isStoreActive(store.status) ? 'Đang hoạt động' : 'Tạm ngưng'}
                        </StatusBadge>
                    </div>
                    {store.address && <p className="store-address">{store.address}</p>}
                    {store.phone && <p className="store-address">{store.phone}</p>}
                    <div style={{ display: 'flex', gap: '20px', marginTop: '8px', color: '#666' }}>
                        {store.taxRate && <span>VAT: {store.taxRate}%</span>}
                        {(store.openingTime || store.closingTime) && (
                            <span>{store.openingTime?.slice(0, 5)} - {store.closingTime?.slice(0, 5)}</span>
                        )}
                    </div>
                </div>
                <button onClick={handleEditStore} className="edit-store-btn">
                    Sửa cửa hàng
                </button>
            </div>

            {!isStoreActive(store.status) ? (
                <div
                    className="inactive-store-notice"
                    style={{
                        textAlign: 'center',
                        margin: '40px 0',
                        padding: '30px',
                        backgroundColor: '#fff3f3',
                        borderRadius: '8px',
                        border: '1px solid #ffcdd2'
                    }}
                >
                    <h2 style={{ color: '#d32f2f', marginBottom: '15px' }}>Cửa hàng đang tạm ngưng</h2>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Bạn cần kích hoạt lại cửa hàng để tiếp tục quản lý nhân viên, bàn và kho hàng.
                    </p>
                    <Button
                        onClick={async () => {
                            if (window.confirm('Bạn có chắc chắn muốn kích hoạt lại cửa hàng này?')) {
                                try {
                                    await updateStore(storeId, {
                                        branchName: store.branchName || store.name || '',
                                        address: store.address || '',
                                        phone: store.phone || '',
                                        taxRate: store.taxRate || '',
                                        openingTime: store.openingTime || '',
                                        closingTime: store.closingTime || '',
                                        status: true
                                    });
                                    await fetchStoreDetails();
                                } catch (err) {
                                    alert('Không thể kích hoạt cửa hàng: ' + (err.response?.data?.message || err.message));
                                }
                            }
                        }}
                    >
                        Khôi phục hoạt động
                    </Button>
                </div>
            ) : (
                <div className="tabs-container">
                    <div className="tabs-header">
                        <button
                            className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
                            onClick={() => setActiveTab('staff')}
                        >
                            Nhân viên ({store.staffMembers?.length || 0})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tables')}
                        >
                            Bàn ({store.tables?.length || 0})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                            onClick={() => setActiveTab('inventory')}
                        >
                            Kho hàng ({store.menuItems?.length || 0})
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
            )}

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Sửa thông tin cửa hàng">
                <form onSubmit={handleUpdateStore} className="edit-store-form">
                    <Input
                        label="Tên chi nhánh"
                        type="text"
                        value={editFormData.branchName}
                        onChange={(event) => setEditFormData({ ...editFormData, branchName: event.target.value })}
                        required
                    />
                    <Input
                        label="Địa chỉ"
                        type="text"
                        value={editFormData.address}
                        onChange={(event) => setEditFormData({ ...editFormData, address: event.target.value })}
                        required
                    />
                    <Input
                        label="Số điện thoại"
                        type="tel"
                        value={editFormData.phone}
                        onChange={(event) => setEditFormData({ ...editFormData, phone: event.target.value })}
                    />
                    <Input
                        label="Thuế VAT (%)"
                        type="number"
                        value={editFormData.taxRate}
                        onChange={(event) => setEditFormData({ ...editFormData, taxRate: event.target.value })}
                        step="0.01"
                    />
                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Giờ mở cửa"
                                type="time"
                                value={editFormData.openingTime}
                                onChange={(event) => setEditFormData({ ...editFormData, openingTime: event.target.value })}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Giờ đóng cửa"
                                type="time"
                                value={editFormData.closingTime}
                                onChange={(event) => setEditFormData({ ...editFormData, closingTime: event.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Trạng thái</label>
                        <select
                            value={String(editFormData.status)}
                            onChange={(event) => setEditFormData({ ...editFormData, status: event.target.value === 'true' })}
                            className="status-select"
                        >
                            <option value="true">Đang hoạt động</option>
                            <option value="false">Tạm ngưng</option>
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
