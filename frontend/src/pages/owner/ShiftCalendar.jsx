import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import {
    getShiftsByDateRange as defaultGetShifts,
    createShift,
    updateShift,
    deleteShift,
    getStoreStaff as defaultGetStaff
} from '../../api/businessOwnerApi';
import ShiftModal from '../../components/ShiftModal';
import './ShiftCalendar.css';

const localizer = momentLocalizer(moment);

const ShiftCalendar = ({
    storeId,
    readOnly = false,
    api = {},
    shiftTemplates = [],
    shiftTemplatesLoading = false
}) => {
    const getShifts = api.getShifts || defaultGetShifts;
    const getStaff = api.getStaff || defaultGetStaff;

    const [events, setEvents] = useState([]);
    const [staff, setStaff] = useState([]);
    const [selectedStaff, setSelectedStaff] = useState('all');
    const [selectedRole, setSelectedRole] = useState('all');
    const [isMySchedule, setIsMySchedule] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedShift, setSelectedShift] = useState(null);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());

    const currentUserId = localStorage.getItem('userId');
    const staffColors = useRef({});

    const fetchStaff = useCallback(async () => {
        try {
            const staffData = await getStaff(storeId);

            if (!staffData || staffData.length === 0) {
                setStaff([]);
                return;
            }

            setStaff(staffData);
            staffData.forEach((member, index) => {
                const colors = ['#3174ad', '#e8384f', '#fd612c', '#1ccb9e', '#0f766e', '#f77e17'];
                staffColors.current[member.id] = colors[index % colors.length];
            });
        } catch (error) {
            console.error('Error fetching staff:', error);
            setStaff([]);
        }
    }, [getStaff, storeId]);

    const fetchShifts = useCallback(async () => {
        try {
            setLoading(true);

            const start = moment(currentDate).subtract(2, 'weeks').startOf('week');
            const end = moment(currentDate).add(2, 'weeks').endOf('week');

            const shifts = await getShifts(
                storeId,
                start.format('YYYY-MM-DD'),
                end.format('YYYY-MM-DD')
            );

            if (!shifts || shifts.length === 0) {
                setEvents([]);
                return;
            }

            const formattedEvents = shifts.map((shift) => ({
                id: shift.id,
                title: shift.workShiftName
                    ? `${shift.userFullName} - ${shift.workShiftName}`
                    : `${shift.userFullName} (${shift.userRole})`,
                start: new Date(`${shift.shiftDate}T${shift.startTime}`),
                end: new Date(`${shift.shiftDate}T${shift.endTime}`),
                resource: {
                    ...shift,
                    color: staffColors.current[shift.userId] || '#3174ad'
                }
            }));

            setEvents(formattedEvents);
        } catch (error) {
            console.error('Error fetching shifts:', error);

            if (!readOnly) {
                if (error.response?.status === 403) {
                    alert('Bạn không có quyền xem lịch làm việc của cửa hàng này');
                } else {
                    const message = error.response?.data?.message || error.message || 'Lỗi không xác định';
                    alert(`Không thể tải lịch làm việc: ${message}`);
                }
            }
        } finally {
            setLoading(false);
        }
    }, [currentDate, getShifts, readOnly, storeId]);

    useEffect(() => {
        if (storeId) {
            fetchStaff();
        }
    }, [fetchStaff, storeId]);

    useEffect(() => {
        if (storeId) {
            fetchShifts();
        }
    }, [fetchShifts, storeId]);

    const handleSelectSlot = (slotInfo) => {
        if (readOnly) {
            return;
        }

        setSelectedSlot(slotInfo);
        setSelectedShift(null);
        setIsModalOpen(true);
    };

    const handleSelectEvent = (event) => {
        if (readOnly) {
            return;
        }

        setSelectedShift(event.resource);
        setSelectedSlot(null);
        setIsModalOpen(true);
    };

    const handleSaveShift = async (shiftData) => {
        if (readOnly) {
            return;
        }

        try {
            if (selectedShift) {
                await updateShift(storeId, selectedShift.id, shiftData);
            } else {
                await createShift(storeId, shiftData);
            }

            setIsModalOpen(false);
            fetchShifts();
        } catch (error) {
            console.error('Error saving shift:', error);
            const message = error.response?.data?.message || error.message || 'Lỗi không xác định';
            alert(`Không thể lưu ca làm: ${message}`);
        }
    };

    const handleDeleteShift = async (shiftId) => {
        if (readOnly) {
            return;
        }

        if (!window.confirm('Bạn có chắc muốn xóa ca làm này?')) {
            return;
        }

        try {
            await deleteShift(shiftId);
            setIsModalOpen(false);
            fetchShifts();
        } catch (error) {
            console.error('Error deleting shift:', error);
            alert('Không thể xóa ca làm');
        }
    };

    const eventStyleGetter = (event) => ({
        style: {
            backgroundColor: event.resource.color,
            borderRadius: '5px',
            opacity: 0.9,
            color: 'white',
            border: '0px',
            display: 'block',
            fontSize: '13px',
            fontWeight: '500'
        }
    });

    const filteredEvents = events.filter((event) => {
        if (isMySchedule) {
            return String(event.resource.userId) === String(currentUserId);
        }

        const matchStaff = selectedStaff === 'all' || event.resource.userId === selectedStaff;
        const matchRole = selectedRole === 'all' || event.resource.userRole === selectedRole;

        return matchStaff && matchRole;
    });

    if (loading && events.length === 0) {
        return <div className="loading">Đang tải lịch làm việc...</div>;
    }

    return (
        <div className="shift-calendar-container">
            <div className="calendar-header">
                <h2>Lịch làm việc nhân viên</h2>
                <div className="calendar-filters">
                    <button
                        className={`filter-btn ${isMySchedule ? 'active' : ''}`}
                        onClick={() => {
                            setIsMySchedule((current) => !current);
                            setSelectedStaff('all');
                            setSelectedRole('all');
                        }}
                        title="Chỉ hiển thị lịch của tôi"
                    >
                        Lịch của tôi
                    </button>

                    <select
                        value={selectedRole}
                        onChange={(event) => {
                            setSelectedRole(event.target.value);
                            setIsMySchedule(false);
                        }}
                        className="staff-filter"
                        disabled={isMySchedule}
                    >
                        <option value="all">Tất cả vai trò</option>
                        <option value="CASHIER">Thu ngân</option>
                        <option value="STAFF">Nhân viên</option>
                        <option value="KITCHEN">Bếp</option>
                    </select>

                    <select
                        value={selectedStaff}
                        onChange={(event) => {
                            setSelectedStaff(event.target.value);
                            setIsMySchedule(false);
                        }}
                        className="staff-filter"
                        disabled={isMySchedule}
                    >
                        <option value="all">Tất cả nhân viên</option>
                        {staff.map((member) => (
                            <option key={member.id} value={member.id}>
                                {member.fullName} ({member.role})
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="staff-legend">
                {staff.map((member) => (
                    <div key={member.id} className="legend-item">
                        <span
                            className="legend-color"
                            style={{ backgroundColor: staffColors.current[member.id] }}
                        />
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
                onNavigate={setCurrentDate}
                selectable={!readOnly}
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
                    next: 'Sau',
                    previous: 'Trước',
                    today: 'Hôm nay',
                    month: 'Tháng',
                    week: 'Tuần',
                    day: 'Ngày',
                    agenda: 'Lịch trình',
                    date: 'Ngày',
                    time: 'Thời gian',
                    event: 'Ca làm',
                    noEventsInRange: 'Không có ca làm nào trong khoảng thời gian này'
                }}
            />

            {!readOnly && isModalOpen && (
                <ShiftModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    shift={selectedShift}
                    slot={selectedSlot}
                    staff={staff}
                    storeId={storeId}
                    shiftTemplates={shiftTemplates}
                    templatesLoading={shiftTemplatesLoading}
                    onSave={handleSaveShift}
                    onDelete={handleDeleteShift}
                />
            )}
        </div>
    );
};

export default ShiftCalendar;
