import React, { useState, useEffect } from 'react';
import ShiftCalendar from '../owner/ShiftCalendar';
import { getShiftsByDateRange, getStoreStaff } from '../../api/staffApi';
import { getCurrentUser } from '../../api/authApi';
import './StaffSchedule.css';

const StaffSchedule = () => {
    const [storeId, setStoreId] = useState(null);

    // API override for Staff - show all shifts with filter option
    const staffScheduleApi = {
        getShifts: getShiftsByDateRange,
        getStaff: getStoreStaff
    };

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
                } else {
                    console.error('Store ID not found for current user.');
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
                    <h3>⚠️ Chưa xác định cửa hàng</h3>
                    <p>Vui lòng đăng nhập lại hoặc chọn cửa hàng làm việc.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="staff-schedule-page">
            <div className="page-header">
                <h2>Lịch làm việc</h2>
                <p>Xem lịch làm việc của toàn bộ nhân viên trong cửa hàng</p>
            </div>

            <div className="schedule-content">
                {/* Reusing ShiftCalendar in Read-Only mode with Staff API */}
                <ShiftCalendar
                    storeId={storeId}
                    readOnly={true}
                    api={staffScheduleApi}
                />
            </div>
        </div>
    );
};

export default StaffSchedule;
