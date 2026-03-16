import React, { useState, useEffect } from 'react';
import ShiftCalendar from '../owner/ShiftCalendar';
import { getShiftsByDateRange, getStoreStaff } from '../../api/staffApi';
import './StaffSchedule.css';

const StaffSchedule = () => {
    const [storeId, setStoreId] = useState(null);

    // API override for Staff - show all shifts with filter option
    const staffScheduleApi = {
        getShifts: getShiftsByDateRange,
        getStaff: getStoreStaff
    };

    useEffect(() => {
        // Retrieve storeId from localStorage
        const storedStoreId = localStorage.getItem('storeId');
        if (storedStoreId) {
            setStoreId(storedStoreId);
        } else {
            console.error('Store ID not found in localStorage.');
        }
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
