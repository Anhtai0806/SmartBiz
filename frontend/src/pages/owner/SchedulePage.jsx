import React, { useCallback, useEffect, useState } from 'react';
import { getShiftTemplates, getStores } from '../../api/businessOwnerApi';
import ShiftCalendar from './ShiftCalendar';
import OwnerShiftTemplatesManager from './OwnerShiftTemplatesManager';
import './SchedulePage.css';

const SchedulePage = () => {
    const [stores, setStores] = useState([]);
    const [selectedStoreId, setSelectedStoreId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [templatesLoading, setTemplatesLoading] = useState(false);
    const [shiftTemplates, setShiftTemplates] = useState([]);

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
        } catch (error) {
            console.error('Error fetching stores:', error);
            alert('Không thể tải danh sách cửa hàng');
        } finally {
            setLoading(false);
        }
    };

    const fetchShiftTemplates = useCallback(async (storeId = selectedStoreId) => {
        if (!storeId) {
            setShiftTemplates([]);
            return;
        }

        try {
            setTemplatesLoading(true);
            const templates = await getShiftTemplates(storeId);
            setShiftTemplates(Array.isArray(templates) ? templates : []);
        } catch (error) {
            console.error('Error fetching shift templates:', error);
            alert('Không thể tải danh sách ca mẫu của cửa hàng');
            setShiftTemplates([]);
        } finally {
            setTemplatesLoading(false);
        }
    }, [selectedStoreId]);

    useEffect(() => {
        if (selectedStoreId) {
            fetchShiftTemplates(selectedStoreId);
        } else {
            setShiftTemplates([]);
        }
    }, [fetchShiftTemplates, selectedStoreId]);

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    if (stores.length === 0) {
        return (
            <div className="empty-state">
                <p>Bạn chưa có cửa hàng nào</p>
                <p>Vui lòng tạo cửa hàng trước khi quản lý lịch làm việc</p>
            </div>
        );
    }

    return (
        <div className="schedule-page">
            <div className="schedule-header">
                <h2>Quản lý lịch làm việc</h2>
                <p className="schedule-subtitle">
                    Chọn cửa hàng để thiết lập ca mẫu riêng và xếp lịch phù hợp cho nhân viên.
                </p>
            </div>

            <div className="store-selector">
                <label>Cửa hàng:</label>
                <select
                    value={selectedStoreId || ''}
                    onChange={(event) => setSelectedStoreId(Number(event.target.value))}
                    className="store-select"
                >
                    {stores.map((store) => (
                        <option key={store.id} value={store.id}>
                            {store.name}
                        </option>
                    ))}
                </select>
            </div>

            {selectedStoreId && (
                <>
                    <OwnerShiftTemplatesManager
                        storeId={selectedStoreId}
                        templates={shiftTemplates}
                        loading={templatesLoading}
                        onTemplatesChanged={() => fetchShiftTemplates(selectedStoreId)}
                    />

                    <ShiftCalendar
                        storeId={selectedStoreId}
                        shiftTemplates={shiftTemplates}
                        shiftTemplatesLoading={templatesLoading}
                    />
                </>
            )}
        </div>
    );
};

export default SchedulePage;
