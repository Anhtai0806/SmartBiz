import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getShiftsByDateRange, createShift, updateShift, deleteShift, getStoreStaff } from '../../api/businessOwnerApi';
import ShiftModal from '../../components/ShiftModal';
import './ShiftCalendar.css';

const localizer = momentLocalizer(moment);

const ShiftCalendar = ({ storeId }) => {
    const [events, setEvents] = useState([]);
    const [staff, setStaff] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('all');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    // Color palette for staff members
    const staffColors = useRef({});

    const fetchStaff = useCallback(async () => {
        try {
            const staffData = await getStoreStaff(storeId);

            // Handle empty staff list
            if (!staffData || staffData.length === 0) {
                console.log('No staff members found for this store');
                setStaff([]);
                return;
            }

            setStaff(staffData);

            // Assign colors to staff
            staffData.forEach((member, index) => {
                const colors = ['#3174ad', '#e8384f', '#fd612c', '#1ccb9e', '#a633d6', '#f77e17'];
                staffColors.current[member.id] = colors[index % colors.length];
            });
        } catch (err) {
            console.error('Error fetching staff:', err);

            // Don't show alert for staff fetch errors, just log them
            // This prevents blocking the calendar from loading
            if (err.response?.status === 404) {
                console.log('Store has no staff members yet');
                setStaff([]);
            } else {
                console.error('Failed to load staff data:', err.message);
                setStaff([]);
            }
        }
    }, [storeId]);

    const fetchShifts = useCallback(async () => {
        try {
            setLoading(true);

            // Calculate date range based on current view
            // Fetch a wider range to ensure all visible shifts are loaded
            const start = moment(currentDate).subtract(2, 'weeks').startOf('week');
            const end = moment(currentDate).add(2, 'weeks').endOf('week');

            const shifts = await getShiftsByDateRange(
                storeId,
                start.format('YYYY-MM-DD'),
                end.format('YYYY-MM-DD')
            );

            // Handle empty shifts gracefully
            if (!shifts || shifts.length === 0) {
                setEvents([]);
                setLoading(false);
                return;
            }

            const formattedEvents = shifts.map(shift => ({
                id: shift.id,
                title: `${shift.userFullName} (${shift.userRole})`,
                start: new Date(`${shift.shiftDate}T${shift.startTime}`),
                end: new Date(`${shift.shiftDate}T${shift.endTime}`),
                resource: {
                    ...shift,
                    color: staffColors.current[shift.userId] || '#3174ad'
                }
            }));

            setEvents(formattedEvents);
        } catch (err) {
            console.error('Error fetching shifts:', err);

            // Provide more specific error messages
            if (err.response) {
                // Server responded with error
                const status = err.response.status;
                if (status === 404) {
                    console.log('No shifts found for this store');
                    setEvents([]);
                } else if (status === 403) {
                    alert('Bạn không có quyền xem lịch làm việc của cửa hàng này');
                } else {
                    alert(`Lỗi tải lịch làm việc: ${err.response.data?.message || 'Lỗi không xác định'}`);
                }
            } else if (err.request) {
                // Request made but no response
                alert('Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.');
            } else {
                // Other errors
                alert('Không thể tải lịch làm việc: ' + (err.message || 'Lỗi không xác định'));
            }
        } finally {
            setLoading(false);
        }
    }, [storeId, currentDate]);

    useEffect(() => {
        if (storeId) {
            fetchStaff();
        }
    }, [storeId, fetchStaff]);

    useEffect(() => {
        if (storeId) {
            fetchShifts();
        }
    }, [storeId, currentDate, fetchShifts]);

    const handleSelectSlot = (slotInfo) => {
        setSelectedSlot(slotInfo);
        setSelectedShift(null);
        setIsModalOpen(true);
    };

    const handleSelectEvent = (event) => {
        setSelectedShift(event.resource);
        setSelectedSlot(null);
        setIsModalOpen(true);
    };

    const handleSaveShift = async (shiftData) => {
        try {
            if (selectedShift) {
                await updateShift(storeId, selectedShift.id, shiftData);
            } else {
                await createShift(storeId, shiftData);
            }
            setIsModalOpen(false);
            fetchShifts();
        } catch (err) {
            console.error('Error saving shift:', err);

            // Provide more detailed error messages
            if (err.response?.data?.message) {
                alert('Không thể lưu ca làm: ' + err.response.data.message);
            } else {
                alert('Không thể lưu ca làm: ' + (err.message || 'Lỗi không xác định'));
            }
        }
    };

    const handleDeleteShift = async (shiftId) => {
        if (window.confirm('Bạn có chắc muốn xóa ca làm này?')) {
            try {
                await deleteShift(shiftId);
                setIsModalOpen(false);
                fetchShifts();
            } catch (err) {
                console.error('Error deleting shift:', err);
                alert('Không thể xóa ca làm');
            }
        }
    };

    const handleNavigate = (date) => {
        setCurrentDate(date);
    };

    const eventStyleGetter = (event) => {
        return {
            style: {
                backgroundColor: event.resource.color,
                borderRadius: '5px',
                opacity: 0.8,
                color: 'white',
                border: '0px',
                display: 'block',
                fontSize: '13px',
                fontWeight: '500'
            }
        };
    };

    const filteredEvents = selectedStaff === 'all'
        ? events
        : events.filter(event => event.resource.userId === selectedStaff);

    if (loading && events.length === 0) {
        return <div className="loading">Đang tải lịch làm việc...</div>;
    }

    return (
        <div className="shift-calendar-container">
            <div className="calendar-header">
                <h2>📅 Lịch làm việc</h2>
                <div className="calendar-filters">
                    <label>Lọc theo nhân viên:</label>
                    <select
                        value={selectedStaff}
                        onChange={(e) => setSelectedStaff(e.target.value)}
                        className="staff-filter"
                    >
                        <option value="all">Tất cả nhân viên</option>
                        {staff.map(member => (
                            <option key={member.id} value={member.id}>
                                {member.fullName} ({member.role})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="staff-legend">
                {staff.map(member => (
                    <div key={member.id} className="legend-item">
                        <span
                            className="legend-color"
                            style={{ backgroundColor: staffColors.current[member.id] }}
                        ></span>
                        <span className="legend-name">{member.fullName}</span>
                    </div>
                ))}
            </div>

            <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor="start"
                endAccessor="end"
                date={currentDate}
                onNavigate={handleNavigate}
                selectable
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                eventPropGetter={eventStyleGetter}
                views={['month', 'week', 'day']}
                defaultView="week"
                min={new Date(2024, 0, 1, 6, 0, 0)}
                max={new Date(2024, 0, 1, 23, 0, 0)}
                step={30}
                timeslots={2}
                messages={{
                    next: "Sau",
                    previous: "Trước",
                    today: "Hôm nay",
                    month: "Tháng",
                    week: "Tuần",
                    day: "Ngày",
                    agenda: "Lịch trình",
                    date: "Ngày",
                    time: "Thời gian",
                    event: "Ca làm",
                    noEventsInRange: "Không có ca làm nào trong khoảng thời gian này"
                }}
            />

            {isModalOpen && (
                <ShiftModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    shift={selectedShift}
                    slot={selectedSlot}
                    staff={staff}
                    storeId={storeId}
                    onSave={handleSaveShift}
                    onDelete={handleDeleteShift}
                />
            )}
        </div>
    );
};

export default ShiftCalendar;
