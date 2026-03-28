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
        phone: '',
        taxRate: '',
        openingTime: '',
        closingTime: '',
        status: true
    });

    const isStoreActive = (status) => status !== false;

    const fetchStoreDetails = useCallback(async () => {
        try {
            setLoading(true);
            const data = await getStoreDetails(storeId);
            setStore(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching store details:', err);
            setError(err.message || 'Khong the tai thong tin cua hang');
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
            status: isStoreActive(store.status)
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
            alert('Khong the cap nhat cua hang: ' + (err.response?.data?.message || err.message));
        }
    };

    if (loading) {
        return <div className="loading">Dang tai thong tin cua hang...</div>;
    }

    if (error) {
        return (
            <div className="store-detail">
                <div className="error-message">
                    <p>{error}</p>
                    <button onClick={() => navigate('/owner/stores')} className="back-btn">
                        Quay lai danh sach
                    </button>
                </div>
            </div>
        );
    }

    if (!store) {
        return <div className="loading">Khong tim thay cua hang</div>;
    }

    return (
        <div className="store-detail">
            <div className="store-header">
                <button onClick={() => navigate('/owner/stores')} className="back-btn">
                    Quay lai
                </button>
                <div className="store-info">
                    <div className="store-title-row">
                        <h1>{store.name}</h1>
                        <StatusBadge status={isStoreActive(store.status) ? 'success' : 'danger'}>
                            {isStoreActive(store.status) ? 'Dang hoat dong' : 'Tam ngung'}
                        </StatusBadge>
                    </div>
                    <p className="store-address">{store.address}</p>
                    {store.phone && <p className="store-address">{store.phone}</p>}
                    <div style={{ display: 'flex', gap: '20px', marginTop: '8px', color: '#666' }}>
                        {store.taxRate && <span>VAT: {store.taxRate}%</span>}
                        {(store.openingTime || store.closingTime) && (
                            <span>{store.openingTime?.slice(0, 5)} - {store.closingTime?.slice(0, 5)}</span>
                        )}
                    </div>
                </div>
                <button onClick={handleEditStore} className="edit-store-btn">
                    Sua cua hang
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
                    <h2 style={{ color: '#d32f2f', marginBottom: '15px' }}>Cua hang dang tam ngung</h2>
                    <p style={{ color: '#666', marginBottom: '20px' }}>
                        Ban can kich hoat lai cua hang de tiep tuc quan ly nhan vien, ban va kho hang.
                    </p>
                    <Button
                        onClick={async () => {
                            if (window.confirm('Ban co chac chan muon kich hoat lai cua hang nay?')) {
                                try {
                                    await updateStore(storeId, {
                                        name: store.name,
                                        address: store.address || '',
                                        phone: store.phone || '',
                                        taxRate: store.taxRate || '',
                                        openingTime: store.openingTime || '',
                                        closingTime: store.closingTime || '',
                                        status: true
                                    });
                                    await fetchStoreDetails();
                                } catch (err) {
                                    alert('Khong the kich hoat cua hang: ' + (err.response?.data?.message || err.message));
                                }
                            }
                        }}
                    >
                        Khoi phuc hoat dong
                    </Button>
                </div>
            ) : (
                <div className="tabs-container">
                    <div className="tabs-header">
                        <button
                            className={`tab-btn ${activeTab === 'staff' ? 'active' : ''}`}
                            onClick={() => setActiveTab('staff')}
                        >
                            Nhan vien ({store.staffMembers?.length || 0})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'tables' ? 'active' : ''}`}
                            onClick={() => setActiveTab('tables')}
                        >
                            Ban ({store.tables?.length || 0})
                        </button>
                        <button
                            className={`tab-btn ${activeTab === 'inventory' ? 'active' : ''}`}
                            onClick={() => setActiveTab('inventory')}
                        >
                            Kho hang ({store.menuItems?.length || 0})
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

            <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Sua thong tin cua hang">
                <form onSubmit={handleUpdateStore} className="edit-store-form">
                    <Input
                        label="Ten cua hang"
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData({ ...editFormData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Dia chi"
                        type="text"
                        value={editFormData.address}
                        onChange={(e) => setEditFormData({ ...editFormData, address: e.target.value })}
                    />
                    <Input
                        label="So dien thoai"
                        type="tel"
                        value={editFormData.phone}
                        onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    />
                    <div className="form-row" style={{ display: 'flex', gap: '1rem' }}>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Thue VAT (%)"
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
                                label="Gio mo cua"
                                type="time"
                                value={editFormData.openingTime}
                                onChange={(e) => setEditFormData({ ...editFormData, openingTime: e.target.value })}
                            />
                        </div>
                        <div style={{ flex: 1 }}>
                            <Input
                                label="Gio dong cua"
                                type="time"
                                value={editFormData.closingTime}
                                onChange={(e) => setEditFormData({ ...editFormData, closingTime: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <label>Trang thai</label>
                        <select
                            value={String(editFormData.status)}
                            onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value === 'true' })}
                            className="status-select"
                        >
                            <option value="true">Dang hoat dong</option>
                            <option value="false">Tam ngung</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
                            Huy
                        </Button>
                        <Button type="submit">Luu thay doi</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default StoreDetail;
