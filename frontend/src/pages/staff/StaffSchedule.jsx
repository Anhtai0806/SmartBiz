import React, { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { getMyShifts } from '../../api/staffApi';
import './StaffSchedule.css';

const localizer = momentLocalizer(moment);

const StaffSchedule = () => {
    const [shifts, setShifts] = useState([]);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchShifts();
    }, []);

    const fetchShifts = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch shifts for current month
            const startDate = moment().startOf('month').format('YYYY-MM-DD');
            const endDate = moment().endOf('month').add(1, 'month').format('YYYY-MM-DD');

            const shiftsData = await getMyShifts(startDate, endDate);
            setShifts(shiftsData);

            // Convert shifts to calendar events
            const calendarEvents = shiftsData.map(shift => {
                const shiftDate = moment(shift.shiftDate).format('YYYY-MM-DD');
                const startTime = moment(`${shiftDate} ${shift.startTime}`).toDate();
                const endTime = moment(`${shiftDate} ${shift.endTime}`).toDate();

                return {
                    id: shift.id,
                    title: `${shift.storeName || 'Ca làm việc'}`,
                    start: startTime,
                    end: endTime,
                    resource: shift
                };
            });

            setEvents(calendarEvents);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching shifts:', error);
            setError('Không thể tải lịch làm việc. Vui lòng thử lại.');
            setLoading(false);
        }
    };

    const eventStyleGetter = (event) => {
        const isPast = moment(event.end).isBefore(moment());

        return {
            style: {
                backgroundColor: isPast ? '#9ca3af' : '#10b981',
                borderRadius: '5px',
                opacity: isPast ? 0.6 : 1,
                color: 'white',
                border: 'none',
                display: 'block'
            }
        };
    };

    if (loading) {
        return <div className="loading">Đang tải lịch làm việc...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={fetchShifts} className="retry-btn">Thử lại</button>
            </div>
        );
    }

    return (
        <div className="staff-schedule">
            <div className="page-header">
                <h2>Lịch làm việc của tôi</h2>
                <button onClick={fetchShifts} className="refresh-btn">
                    🔄 Làm mới
                </button>
            </div>

            <div className="calendar-container">
                <Calendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    style={{ height: 600 }}
                    defaultView="week"
                    views={['month', 'week', 'day']}
                    eventPropGetter={eventStyleGetter}
                    messages={{
                        next: "Sau",
                        previous: "Trước",
                        today: "Hôm nay",
                        month: "Tháng",
                        week: "Tuần",
                        day: "Ngày"
                    }}
                />
            </div>

            <div className="shifts-summary">
                <h3>Ca làm việc sắp tới</h3>
                {shifts.filter(shift => moment(shift.shiftDate).isSameOrAfter(moment(), 'day')).length === 0 ? (
                    <p className="no-shifts">Không có ca làm việc sắp tới</p>
                ) : (
                    <div className="shifts-list">
                        {shifts
                            .filter(shift => moment(shift.shiftDate).isSameOrAfter(moment(), 'day'))
                            .slice(0, 5)
                            .map(shift => (
                                <div key={shift.id} className="shift-card">
                                    <div className="shift-date">
                                        {moment(shift.shiftDate).format('DD/MM/YYYY')}
                                    </div>
                                    <div className="shift-time">
                                        {shift.startTime.substring(0, 5)} - {shift.endTime.substring(0, 5)}
                                    </div>
                                    <div className="shift-store">
                                        {shift.storeName || 'N/A'}
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StaffSchedule;
