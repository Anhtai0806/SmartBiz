import React, { useEffect, useState } from 'react';
import AvailabilityForm from '../../components/AvailabilityForm';
import { getCurrentUser } from '../../api/authApi';

const StaffAvailability = () => {
    const [storeId, setStoreId] = useState(null);

    useEffect(() => {
        const loadStoreId = async () => {
            const storedStoreId = localStorage.getItem('storeId');
            if (storedStoreId) {
                setStoreId(storedStoreId);
                return;
            }

            try {
                const user = await getCurrentUser();
                if (user.storeId) {
                    localStorage.setItem('storeId', user.storeId);
                    setStoreId(user.storeId);
                }
            } catch (error) {
                console.error('Unable to load current user store.', error);
            }
        };

        loadStoreId();
    }, []);

    if (!storeId) {
        return (
            <div className="staff-schedule-error">
                <div className="alert-box">
                    <h3>Chưa xác định cửa hàng</h3>
                    <p>Vui lòng đăng nhập lại hoặc chọn cửa hàng làm việc.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="staff-schedule-page">
            <div className="page-header">
                <h2>Lịch rảnh</h2>
                <p>Gửi các ca bạn có thể đi làm trong tuần kế tiếp.</p>
            </div>
            <AvailabilityForm storeId={storeId} />
        </div>
    );
};

export default StaffAvailability;
