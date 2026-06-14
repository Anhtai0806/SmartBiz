import React, { useEffect, useState } from 'react';
import moment from 'moment';
import Modal from './Modal';
import Input from './Input';
import Button from './Button';
import './ShiftModal.css';

const CUSTOM_SHIFT_VALUE = 'custom';

const ShiftModal = ({
    isOpen,
    onClose,
    shift,
    slot,
    staff,
    storeId,
    shiftTemplates = [],
    templatesLoading = false,
    onSave,
    onDelete
}) => {
    const [formData, setFormData] = useState({
        userId: '',
        workShiftId: null,
        shiftDate: '',
        startTime: '',
        endTime: ''
    });
    const [shiftType, setShiftType] = useState(CUSTOM_SHIFT_VALUE);

    useEffect(() => {
        const findTemplateById = (workShiftId) =>
            shiftTemplates.find((template) => template.id === workShiftId);

        if (shift) {
            const matchedTemplate = shift.workShiftId ? findTemplateById(shift.workShiftId) : null;
            setFormData({
                userId: shift.userId,
                workShiftId: shift.workShiftId || null,
                shiftDate: shift.shiftDate,
                startTime: shift.startTime,
                endTime: shift.endTime
            });
            setShiftType(matchedTemplate ? String(matchedTemplate.id) : CUSTOM_SHIFT_VALUE);
            return;
        }

        if (slot) {
            const slotStart = moment(slot.start).format('HH:mm');
            const slotEnd = moment(slot.end || slot.start).format('HH:mm');
            const detectedTemplate = shiftTemplates.find((template) => template.startTime === slotStart);

            setFormData({
                userId: staff.length > 0 ? staff[0].id : '',
                workShiftId: detectedTemplate ? detectedTemplate.id : null,
                shiftDate: moment(slot.start).format('YYYY-MM-DD'),
                startTime: detectedTemplate ? detectedTemplate.startTime : slotStart,
                endTime: detectedTemplate
                    ? detectedTemplate.endTime
                    : (slotEnd !== slotStart ? slotEnd : moment(slot.start).add(5, 'hours').format('HH:mm'))
            });
            setShiftType(detectedTemplate ? String(detectedTemplate.id) : CUSTOM_SHIFT_VALUE);
            return;
        }

        setFormData({
            userId: staff.length > 0 ? staff[0].id : '',
            workShiftId: null,
            shiftDate: '',
            startTime: '',
            endTime: ''
        });
        setShiftType(CUSTOM_SHIFT_VALUE);
    }, [shift, slot, staff, shiftTemplates, storeId]);

    const handleShiftTypeChange = (value) => {
        setShiftType(value);

        if (value === CUSTOM_SHIFT_VALUE) {
            setFormData((current) => ({
                ...current,
                workShiftId: null
            }));
            return;
        }

        const selectedTemplate = shiftTemplates.find((template) => String(template.id) === value);
        if (!selectedTemplate) {
            return;
        }

        setFormData((current) => ({
            ...current,
            workShiftId: selectedTemplate.id,
            startTime: selectedTemplate.startTime,
            endTime: selectedTemplate.endTime
        }));
    };

    const handleSubmit = (event) => {
        event.preventDefault();

        if (!formData.userId || !formData.shiftDate || !formData.startTime || !formData.endTime) {
            alert('Vui lòng điền đầy đủ thông tin');
            return;
        }

        if (formData.startTime >= formData.endTime) {
            alert('Giờ kết thúc phải sau giờ bắt đầu');
            return;
        }

        onSave({
            ...formData,
            workShiftId: shiftType === CUSTOM_SHIFT_VALUE ? null : formData.workShiftId
        });
    };

    const selectedStaff = staff.find((member) => member.id === formData.userId);
    const selectedTemplateName = shiftType === CUSTOM_SHIFT_VALUE
        ? 'Tùy chỉnh'
        : shiftTemplates.find((template) => String(template.id) === shiftType)?.name;

    if (staff.length === 0) {
        return (
            <Modal isOpen={isOpen} onClose={onClose} title="Không thể tạo ca làm">
                <div className="empty-staff-message">
                    <p>Cửa hàng này chưa có nhân viên nào.</p>
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
                        onChange={(event) => setFormData({ ...formData, userId: event.target.value })}
                        required
                        disabled={!!shift}
                    >
                        <option value="">-- Chọn nhân viên --</option>
                        {staff.map((member) => (
                            <option key={member.id} value={member.id}>
                                {member.fullName} ({member.role})
                            </option>
                        ))}
                    </select>
                    {shift && (
                        <small className="form-hint">
                            Không thể thay đổi nhân viên khi chỉnh sửa
                        </small>
                    )}
                </div>

                <Input
                    label="Ngày làm việc *"
                    type="date"
                    value={formData.shiftDate}
                    onChange={(event) => setFormData({ ...formData, shiftDate: event.target.value })}
                    required
                />

                <div className="form-group">
                    <label>Loại ca làm *</label>
                    <select
                        value={shiftType}
                        onChange={(event) => handleShiftTypeChange(event.target.value)}
                        className="shift-type-selector"
                    >
                        {templatesLoading && (
                            <option value={CUSTOM_SHIFT_VALUE}>Đang tải ca mẫu...</option>
                        )}
                        {!templatesLoading && shiftTemplates.map((template) => (
                            <option key={template.id} value={String(template.id)}>
                                {template.name} ({template.startTime} - {template.endTime})
                            </option>
                        ))}
                        <option value={CUSTOM_SHIFT_VALUE}>Tùy chỉnh thời gian</option>
                    </select>
                    {!templatesLoading && shiftTemplates.length === 0 && (
                        <small className="form-hint">
                            Cửa hàng chưa có ca mẫu. Bạn vẫn có thể tạo lịch bằng chế độ tùy chỉnh.
                        </small>
                    )}
                </div>

                {shiftType === CUSTOM_SHIFT_VALUE ? (
                    <div className="time-inputs">
                        <Input
                            label="Giờ bắt đầu *"
                            type="time"
                            value={formData.startTime}
                            onChange={(event) => setFormData({ ...formData, startTime: event.target.value })}
                            required
                        />
                        <Input
                            label="Giờ kết thúc *"
                            type="time"
                            value={formData.endTime}
                            onChange={(event) => setFormData({ ...formData, endTime: event.target.value })}
                            required
                        />
                    </div>
                ) : (
                    <div className="time-display">
                        <div className="time-info">
                            <label>Thời gian ca làm</label>
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
                        <p><strong>Loại ca:</strong> {selectedTemplateName}</p>
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
                            Xóa
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
    if (!startTime || !endTime) {
        return 0;
    }

    const start = moment(startTime, 'HH:mm');
    const end = moment(endTime, 'HH:mm');
    return end.diff(start, 'hours', true).toFixed(1);
};

export default ShiftModal;
