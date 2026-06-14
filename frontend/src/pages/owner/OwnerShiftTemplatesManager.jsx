import React, { useEffect, useState } from 'react';
import Button from '../../components/Button';
import {
    createShiftTemplate,
    deleteShiftTemplate,
    updateShiftTemplate
} from '../../api/businessOwnerApi';
import './OwnerShiftTemplatesManager.css';

const EMPTY_FORM = {
    id: null,
    name: '',
    startTime: '',
    endTime: ''
};

const OwnerShiftTemplatesManager = ({
    storeId,
    templates = [],
    loading = false,
    onTemplatesChanged
}) => {
    const [formData, setFormData] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        setFormData(EMPTY_FORM);
    }, [storeId]);

    const handleChange = (field, value) => {
        setFormData((current) => ({
            ...current,
            [field]: value
        }));
    };

    const resetForm = () => {
        setFormData(EMPTY_FORM);
    };

    const handleEdit = (template) => {
        setFormData({
            id: template.id,
            name: template.name,
            startTime: template.startTime,
            endTime: template.endTime
        });
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        if (!formData.name || !formData.startTime || !formData.endTime) {
            alert('Vui lòng nhập đầy đủ tên ca, giờ bắt đầu và giờ kết thúc.');
            return;
        }

        if (formData.startTime >= formData.endTime) {
            alert('Giờ kết thúc phải sau giờ bắt đầu.');
            return;
        }

        setSubmitting(true);
        try {
            const payload = {
                storeId,
                name: formData.name.trim(),
                startTime: formData.startTime,
                endTime: formData.endTime
            };

            if (formData.id) {
                await updateShiftTemplate(formData.id, payload);
            } else {
                await createShiftTemplate(storeId, payload);
            }

            resetForm();
            await onTemplatesChanged?.();
        } catch (error) {
            const message = error.response?.data?.message || 'Không thể lưu ca mẫu.';
            alert(message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (templateId) => {
        if (!window.confirm('Bạn có chắc muốn xóa ca mẫu này không?')) {
            return;
        }

        try {
            await deleteShiftTemplate(templateId);
            if (formData.id === templateId) {
                resetForm();
            }
            await onTemplatesChanged?.();
        } catch (error) {
            const message = error.response?.data?.message || 'Không thể xóa ca mẫu.';
            alert(message);
        }
    };

    return (
        <section className="owner-shift-templates">
            <div className="owner-shift-templates__header">
                <div>
                    <h3>Ca mẫu của cửa hàng</h3>
                    <p>
                        Chủ cửa hàng có thể tự định nghĩa các khung ca để dùng nhanh khi xếp
                        lịch cho nhân viên.
                    </p>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    onClick={resetForm}
                    disabled={submitting}
                >
                    Tạo ca mới
                </Button>
            </div>

            <div className="owner-shift-templates__content">
                <form className="owner-shift-templates__form" onSubmit={handleSubmit}>
                    <div className="owner-shift-templates__form-grid">
                        <label>
                            <span>Tên ca</span>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(event) => handleChange('name', event.target.value)}
                                placeholder="Ví dụ: Ca sáng cuối tuần"
                                maxLength={100}
                                required
                            />
                        </label>

                        <label>
                            <span>Giờ bắt đầu</span>
                            <input
                                type="time"
                                value={formData.startTime}
                                onChange={(event) => handleChange('startTime', event.target.value)}
                                required
                            />
                        </label>

                        <label>
                            <span>Giờ kết thúc</span>
                            <input
                                type="time"
                                value={formData.endTime}
                                onChange={(event) => handleChange('endTime', event.target.value)}
                                required
                            />
                        </label>
                    </div>

                    <div className="owner-shift-templates__actions">
                        {formData.id && (
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={resetForm}
                                disabled={submitting}
                            >
                                Hủy chỉnh sửa
                            </Button>
                        )}
                        <Button type="submit" disabled={submitting}>
                            {formData.id ? 'Cập nhật ca mẫu' : 'Lưu ca mẫu'}
                        </Button>
                    </div>
                </form>

                <div className="owner-shift-templates__list">
                    {loading ? (
                        <div className="owner-shift-templates__empty">Đang tải danh sách ca mẫu...</div>
                    ) : templates.length === 0 ? (
                        <div className="owner-shift-templates__empty">
                            Chưa có ca mẫu nào. Owner vẫn có thể xếp lịch bằng nút tùy chỉnh.
                        </div>
                    ) : (
                        templates.map((template) => (
                            <article key={template.id} className="owner-shift-template-card">
                                <div>
                                    <h4>{template.name}</h4>
                                    <p>
                                        {template.startTime} - {template.endTime}
                                    </p>
                                </div>

                                <div className="owner-shift-template-card__actions">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => handleEdit(template)}
                                    >
                                        Chỉnh sửa
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="danger"
                                        onClick={() => handleDelete(template.id)}
                                    >
                                        Xóa
                                    </Button>
                                </div>
                            </article>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
};

export default OwnerShiftTemplatesManager;
