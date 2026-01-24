import React, { useState } from 'react';
import { getStoreTables, createTable, deleteTable } from '../../api/businessOwnerApi';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import StatusBadge from '../../components/StatusBadge';
import './TablesTab.css';

const TablesTab = ({ storeId, tables: initialTables, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        name: ''
    });

    const handleOpenModal = () => {
        setFormData({ name: '' });
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createTable({
                storeId: storeId,
                name: formData.name,
                status: 'EMPTY'
            });
            setIsModalOpen(false);
            onUpdate();
        } catch (err) {
            console.error('Error creating table:', err);
            alert('Không thể tạo bàn: ' + (err.response?.data?.message || err.message || 'Lỗi không xác định'));
        }
    };

    const handleDelete = async (tableId, tableName) => {
        if (window.confirm(`Bạn có chắc muốn xóa "${tableName}"?`)) {
            try {
                await deleteTable(tableId);
                onUpdate();
            } catch (err) {
                console.error('Error deleting table:', err);
                alert('Không thể xóa bàn: ' + (err.response?.data?.message || err.message || 'Lỗi không xác định'));
            }
        }
    };

    const getStatusInfo = (status) => {
        switch (status) {
            case 'EMPTY':
                return { variant: 'success', label: 'Trống' };
            case 'SERVING':
                return { variant: 'info', label: 'Đang phục vụ' };
            case 'WAITING_PAYMENT':
                return { variant: 'warning', label: 'Chờ thanh toán' };
            case 'PAID':
                return { variant: 'default', label: 'Đã thanh toán' };
            default:
                return { variant: 'default', label: status };
        }
    };

    return (
        <div className="tables-tab">
            <div className="tab-header">
                <h3>Danh sách Bàn</h3>
                <Button onClick={handleOpenModal}>➕ Thêm bàn</Button>
            </div>

            {initialTables && initialTables.length > 0 ? (
                <div className="tables-grid">
                    {initialTables.map(table => {
                        const statusInfo = getStatusInfo(table.status);
                        return (
                            <div key={table.id} className="table-card">
                                <div className="table-card-header">
                                    <h4>{table.name}</h4>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(table.id, table.name)}
                                        title="Xóa bàn"
                                    >
                                        🗑️
                                    </button>
                                </div>
                                <div className="table-card-body">
                                    <StatusBadge status={statusInfo.variant}>
                                        {statusInfo.label}
                                    </StatusBadge>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="empty-state">
                    <p>📭 Chưa có bàn nào</p>
                    <Button onClick={handleOpenModal}>Thêm bàn đầu tiên</Button>
                </div>
            )}

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Thêm bàn mới">
                <form onSubmit={handleSubmit} className="table-form">
                    <Input
                        label="Tên bàn"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Ví dụ: Bàn 1, Bàn VIP 1"
                        required
                    />
                    <div className="form-actions">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="submit">Tạo mới</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TablesTab;
