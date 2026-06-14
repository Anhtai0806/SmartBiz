import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    getAvailabilityShiftTemplates,
    getMyAvailability,
    submitMyAvailability
} from '../api/availabilityApi';
import './AvailabilityForm.css';

const WEEKDAY_LABELS = [
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
    'Chủ nhật'
];

const toDateString = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getNextMonday = () => {
    const today = new Date();
    const day = today.getDay();
    const daysUntilNextMonday = ((8 - day) % 7) || 7;
    const nextMonday = new Date(today);
    nextMonday.setDate(today.getDate() + daysUntilNextMonday);
    return toDateString(nextMonday);
};

const formatDate = (dateString) => {
    const date = new Date(`${dateString}T00:00:00`);
    return date.toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit'
    });
};

const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) {
        return '';
    }
    return new Date(dateTimeString).toLocaleString('vi-VN');
};

const AvailabilityForm = ({ storeId }) => {
    const [weekStart] = useState(getNextMonday());
    const [templates, setTemplates] = useState([]);
    const [availability, setAvailability] = useState(null);
    const [selectedSlots, setSelectedSlots] = useState({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const weekDates = useMemo(() => {
        const start = new Date(`${weekStart}T00:00:00`);
        return WEEKDAY_LABELS.map((label, index) => {
            const date = new Date(start);
            date.setDate(start.getDate() + index);
            return {
                label,
                value: toDateString(date)
            };
        });
    }, [weekStart]);

    const loadAvailability = useCallback(async () => {
        setLoading(true);
        setError('');
        setMessage('');
        try {
            const [templateData, availabilityData] = await Promise.all([
                getAvailabilityShiftTemplates(storeId),
                getMyAvailability(storeId, weekStart)
            ]);

            const selected = {};
            (availabilityData.slots || []).forEach((slot) => {
                selected[`${slot.availableDate}:${slot.workShiftId}`] = true;
            });

            setTemplates(templateData);
            setAvailability(availabilityData);
            setSelectedSlots(selected);
        } catch (err) {
            console.error('Error loading availability:', err);
            setError('Không thể tải lịch rảnh. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    }, [storeId, weekStart]);

    useEffect(() => {
        if (!storeId) {
            return;
        }
        loadAvailability();
    }, [storeId, weekStart, loadAvailability]);

    const handleToggleSlot = (date, workShiftId) => {
        const key = `${date}:${workShiftId}`;
        setSelectedSlots((current) => ({
            ...current,
            [key]: !current[key]
        }));
    };

    const handleSubmit = async () => {
        setSaving(true);
        setError('');
        setMessage('');

        const slots = Object.entries(selectedSlots)
            .filter(([, selected]) => selected)
            .map(([key]) => {
                const [availableDate, workShiftId] = key.split(':');
                return {
                    availableDate,
                    workShiftId: Number(workShiftId)
                };
            });

        try {
            const response = await submitMyAvailability({
                storeId: Number(storeId),
                weekStart,
                slots
            });
            setAvailability(response);
            setMessage('Đã lưu lịch rảnh của bạn.');
        } catch (err) {
            console.error('Error submitting availability:', err);
            setError(err.response?.data?.message || 'Không thể lưu lịch rảnh. Vui lòng thử lại.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <section className="availability-section">
                <div className="availability-loading">Đang tải lịch rảnh...</div>
            </section>
        );
    }

    return (
        <section className="availability-section">
            <div className="availability-header">
                <div>
                    <h3>Gửi lịch rảnh tuần kế tiếp</h3>
                    <p>
                        Chọn các ca bạn có thể đi làm từ thứ Hai đến Chủ nhật. Thứ Sáu hằng tuần hệ thống sẽ nhắc gửi lịch.
                    </p>
                </div>
                <div className="availability-week">
                    <label>Tuần kế tiếp</label>
                    <span>{formatDate(weekStart)} - {formatDate(weekDates[6].value)}</span>
                </div>
            </div>

            {availability?.submitted && (
                <div className="availability-status">
                    Đã gửi lúc {formatDateTime(availability.updatedAt || availability.submittedAt)}
                </div>
            )}

            {error && <div className="availability-alert error">{error}</div>}
            {message && <div className="availability-alert success">{message}</div>}

            {templates.length === 0 ? (
                <div className="availability-empty">
                    Chủ cửa hàng chưa tạo ca làm nào cho cửa hàng này.
                </div>
            ) : (
                <div className="availability-grid-wrap">
                    <table className="availability-grid">
                        <thead>
                            <tr>
                                <th>Ngày</th>
                                {templates.map((template) => (
                                    <th key={template.id}>
                                        <span>{template.name}</span>
                                        <small>{template.startTime} - {template.endTime}</small>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {weekDates.map((day) => (
                                <tr key={day.value}>
                                    <td>
                                        <strong>{day.label}</strong>
                                        <span>{formatDate(day.value)}</span>
                                    </td>
                                    {templates.map((template) => {
                                        const key = `${day.value}:${template.id}`;
                                        return (
                                            <td key={template.id}>
                                                <label className="availability-check">
                                                    <input
                                                        type="checkbox"
                                                        checked={Boolean(selectedSlots[key])}
                                                        onChange={() => handleToggleSlot(day.value, template.id)}
                                                    />
                                                    <span>Rảnh</span>
                                                </label>
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <div className="availability-actions">
                <button
                    className="availability-submit"
                    type="button"
                    onClick={handleSubmit}
                    disabled={saving || templates.length === 0}
                >
                    {saving ? 'Đang lưu...' : availability?.submitted ? 'Cập nhật lịch rảnh' : 'Gửi lịch rảnh'}
                </button>
            </div>
        </section>
    );
};

export default AvailabilityForm;
