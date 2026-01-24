import React, { useState, useEffect } from 'react';
import { getStores } from '../../api/businessOwnerApi';
import ShiftCalendar from './ShiftCalendar';
import './SchedulePage.css';

const SchedulePage = () => {
    const [stores, setStores] = useState([]);
    const [selectedStoreId, setSelectedStoreId] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStores();
    }, []);

    const fetchStores = async () => {
        try {
            const storesData = await getStores();
            setStores(storesData);
            if (storesData.length > 0) {
                setSelectedStoreId(storesData[0].id);
            }
        } catch (err) {
            console.error('Error fetching stores:', err);
            alert('Không thể tải danh sách cửa hàng');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (stores.length === 0) {
        return (
            <div className="empty-state">
                <p>📭 Bạn chưa có cửa hàng nào</p>
                <p>Vui lòng tạo cửa hàng trước khi quản lý lịch làm việc</p>
            </div>
        );
    }

    return (
        <div className="schedule-page">
            <div className="schedule-header">
                <h2>📅 Quản lý lịch làm việc</h2>
                <p className="schedule-subtitle">Chọn cửa hàng để xem và xếp lịch cho nhân viên</p>
            </div>

            <div className="store-selector">
                <label>🏪 Cửa hàng:</label>
                <select
                    value={selectedStoreId || ''}
                    onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                    className="store-select"
                >
                    {stores.map(store => (
                        <option key={store.id} value={store.id}>
                            {store.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedStoreId && <ShiftCalendar storeId={selectedStoreId} />}
        </div>
    );
};

export default SchedulePage;
