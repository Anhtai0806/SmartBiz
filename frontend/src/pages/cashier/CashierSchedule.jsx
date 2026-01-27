import React, { useState, useEffect } from 'react';
import ShiftCalendar from '../owner/ShiftCalendar';
import { getShiftsByDateRange, getStoreStaff } from '../../api/cashierApi';
import './CashierSchedule.css';

const CashierSchedule = () => {
    const [storeId, setStoreId] = useState(null);

    // API overrides for Cashier
    const cashierScheduleApi = {
        getShifts: getShiftsByDateRange,
        getStaff: getStoreStaff
    };

    useEffect(() => {
        // Retrieve storeId from localStorage
        // Cashiers usually operate in the context of a store they are assigned to
        const storedStoreId = localStorage.getItem('storeId');
        if (storedStoreId) {
            setStoreId(storedStoreId);
        } else {
            console.error('Store ID not found in localStorage. Cashier must be assigned to a store.');
            // Ideally redirect or show error if no store context
        }
    }, []);

    if (!storeId) {
        return (
            <div className="cashier-schedule-error">
                <div className="alert-box">
                    <h3>⚠️ Chưa xác định cửa hàng</h3>
                    <p>Vui lòng đăng nhập lại hoặc chọn cửa hàng làm việc.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="cashier-schedule-page">
            <div className="page-header">
                <h2>Lịch làm việc</h2>
                <p>Xem lịch làm việc của toàn bộ nhân viên trong cửa hàng</p>
            </div>

            <div className="schedule-content">
                {/* Reusing ShiftCalendar in Read-Only mode with Cashier API */}
                <ShiftCalendar
                    storeId={storeId}
                    readOnly={true}
                    api={cashierScheduleApi}
                />
            </div>
        </div>
    );
};

export default CashierSchedule;
