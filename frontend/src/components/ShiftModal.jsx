import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import moment from 'moment';
import './ShiftModal.css';

// Predefined shift templates
const SHIFT_TEMPLATES = {
    morning: { name: 'Ca sáng', startTime: '07:00', endTime: '12:00' },
    afternoon: { name: 'Ca chiều', startTime: '12:00', endTime: '17:00' },
    evening: { name: 'Ca tối', startTime: '17:00', endTime: '22:00' },
    custom: { name: 'Tuỳ chỉnh', startTime: '', endTime: '' }
};

const ShiftModal = ({ isOpen, onClose, shift, slot, staff, storeId, onSave, onDelete }) => {
    const [formData, setFormData] = useState({
        userId: '',
        shiftDate: '',
        startTime: '',
        endTime: ''
    });
    const [shiftType, setShiftType] = useState('custom');

    useEffect(() => {
        if (shift) {
            // Editing existing shift
            setFormData({
                userId: shift.userId,
                shiftDate: shift.shiftDate,
                startTime: shift.startTime,
                endTime: shift.endTime
            });
            // Determine shift type based on times
            const matchedType = Object.keys(SHIFT_TEMPLATES).find(type =>
                type !== 'custom' &&
                SHIFT_TEMPLATES[type].startTime === shift.startTime &&
                SHIFT_TEMPLATES[type].endTime === shift.endTime
            );
            setShiftType(matchedType || 'custom');
        } else if (slot) {
            // Creating new shift from slot
            const slotTime = moment(slot.start).format('HH:mm');
            let detectedType = 'custom';

            // Auto-detect shift type based on slot time
            if (slotTime >= '06:00' && slotTime < '12:00') {
                detectedType = 'morning';
            } else if (slotTime >= '12:00' && slotTime < '17:00') {
                detectedType = 'afternoon';
            } else if (slotTime >= '17:00' && slotTime < '23:00') {
                detectedType = 'evening';
            }

            setShiftType(detectedType);
            setFormData({
                userId: staff.length > 0 ? staff[0].id : '',
                shiftDate: moment(slot.start).format('YYYY-MM-DD'),
                startTime: SHIFT_TEMPLATES[detectedType].startTime || moment(slot.start).format('HH:mm'),
                endTime: SHIFT_TEMPLATES[detectedType].endTime || moment(slot.end || slot.start).add(5, 'hours').format('HH:mm')
            });
        }
    }, [shift, slot, staff]);

    // Handle shift type change
    const handleShiftTypeChange = (type) => {
        setShiftType(type);
        if (type !== 'custom') {
            setFormData({
                ...formData,
                startTime: SHIFT_TEMPLATES[type].startTime,
                endTime: SHIFT_TEMPLATES[type].endTime
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // Validation
        if (!formData.userId || !formData.shiftDate || !formData.startTime || !formData.endTime) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (formData.startTime >= formData.endTime) {
            alert('Giờ kết thúc phải sau giờ bắt đầu');
            return;
        }

        onSave(formData);
    };

    const selectedStaff = staff.find(s => s.id === formData.userId);

    // Show message if no staff available
    if (staff.length === 0) {
        return (
            <Modal
                isOpen={isOpen}
                onClose={onClose}
                title="Không thể tạo ca làm"
            >
                <div className="empty-staff-message">
                    <p>⚠️ Cửa hàng này chưa có nhân viên nào.</p>
                    <p>Vui lòng thêm nhân viên vào cửa hàng trước khi xếp lịch làm việc.</p>
                    <div className="form-actions">
                        <Button type="button" onClick={onClose}>
                            Đóng
                        </Button>
                    </div>
                </div>
            </Modal>
        );
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={shift ? 'Chỉnh sửa ca làm' : 'Tạo ca làm mới'}
        >
            <form onSubmit={handleSubmit} className="shift-form">
                <div className="form-group">
                    <label>Nhân viên *</label>
                    <select
                        value={formData.userId}
                        onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
                        required
                        disabled={!!shift}
                    >
                        <option value="">-- Chọn nhân viên --</option>
                        {staff.map(member => (
                            <option key={member.id} value={member.id}>
                                {member.fullName} ({member.role})
                            </option>
                        ))}
                    </select>
                    {shift && (
                        <small className="form-hint">Không thể thay đổi nhân viên khi chỉnh sửa</small>
                    )}
                </div>

                <Input
                    label="Ngày làm việc *"
                    type="date"
                    value={formData.shiftDate}
                    onChange={(e) => setFormData({ ...formData, shiftDate: e.target.value })}
                    required
                />

                <div className="form-group">
                    <label>Loại ca làm *</label>
                    <select
                        value={shiftType}
                        onChange={(e) => handleShiftTypeChange(e.target.value)}
                        className="shift-type-selector"
                    >
                        <option value="morning">🌅 Ca sáng (7:00 - 12:00)</option>
                        <option value="afternoon">☀️ Ca chiều (12:00 - 17:00)</option>
                        <option value="evening">🌙 Ca tối (17:00 - 22:00)</option>
                        <option value="custom">⚙️ Tuỳ chỉnh</option>
                    </select>
                </div>

                {shiftType === 'custom' ? (
                    <div className="time-inputs">
                        <Input
                            label="Giờ bắt đầu *"
                            type="time"
                            value={formData.startTime}
                            onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                            required
                        />
                        <Input
                            label="Giờ kết thúc *"
                            type="time"
                            value={formData.endTime}
                            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                            required
                        />
                    </div>
                ) : (
                    <div className="time-display">
                        <div className="time-info">
                            <label>⏰ Thời gian ca làm</label>
                            <div className="time-range">
                                <span className="time-badge">{formData.startTime}</span>
                                <span className="separator">→</span>
                                <span className="time-badge">{formData.endTime}</span>
                            </div>
                        </div>
                    </div>
                )}

                {selectedStaff && (
                    <div className="shift-summary">
                        <h4>Tóm tắt ca làm:</h4>
                        <p><strong>Nhân viên:</strong> {selectedStaff.fullName}</p>
                        <p><strong>Ngày:</strong> {moment(formData.shiftDate).format('DD/MM/YYYY')}</p>
                        <p><strong>Thời gian:</strong> {formData.startTime} - {formData.endTime}</p>
                        <p><strong>Tổng giờ:</strong> {calculateHours(formData.startTime, formData.endTime)} giờ</p>
                    </div>
                )}

                <div className="form-actions">
                    {shift && (
                        <Button
                            type="button"
                            variant="danger"
                            onClick={() => onDelete(shift.id)}
                        >
                            🗑️ Xóa
                        </Button>
                    )}
                    <div className="right-actions">
                        <Button type="button" variant="outline" onClick={onClose}>
                            Hủy
                        </Button>
                        <Button type="submit">
                            {shift ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </div>
                </div>
            </form>
        </Modal>
    );
};

const calculateHours = (startTime, endTime) => {
    if (!startTime || !endTime) return 0;
    const start = moment(startTime, 'HH:mm');
    const end = moment(endTime, 'HH:mm');
    return end.diff(start, 'hours', true).toFixed(1);
};

export default ShiftModal;
