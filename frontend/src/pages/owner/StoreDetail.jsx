import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getStoreDetails } from '../../api/businessOwnerApi';
import StaffTab from './StaffTab';
import InventoryTab from './InventoryTab';
import TablesTab from './TablesTab';
import './StoreDetail.css';

const StoreDetail = () => {
    const { storeId } = useParams();
    const navigate = useNavigate();
    const [store, setStore] = useState(null);
    const [activeTab, setActiveTab] = useState('staff');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStoreDetails();
    }, [storeId]);

    const fetchStoreDetails = async () => {
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
                    <h1>🏪 {store.name}</h1>
                    <p className="store-address">📍 {store.address}</p>
                </div>
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
        </div>
    );
};

export default StoreDetail;
