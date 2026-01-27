import React, { useState } from 'react';
import { getStoreTables, createTable, deleteTable, bulkCreateTables } from '../../api/businessOwnerApi';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import StatusBadge from '../../components/StatusBadge';
import './TablesTab.css';

const TablesTab = ({ storeId, tables: initialTables, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
    const [formData, setFormData] = useState({
        tableNumber: ''
    });
    const [bulkFormData, setBulkFormData] = useState({
        count: '',
        startNumber: ''
    });

    const handleOpenModal = () => {
        setFormData({ tableNumber: '' });
        setIsModalOpen(true);
    };

    const handleOpenBulkModal = () => {
        setBulkFormData({ count: '', startNumber: '' });
        setIsBulkModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createTable({
                storeId: storeId,
                name: 'Bàn ' + formData.tableNumber,
                status: 'EMPTY'
            });
            setIsModalOpen(false);
            onUpdate();
        } catch (err) {
            console.error('Error creating table:', err);
            alert('Không thể tạo bàn: ' + (err.response?.data?.message || err.message || 'Lỗi không xác định'));
        }
    };

    const handleBulkSubmit = async (e) => {
        e.preventDefault();
        try {
            await bulkCreateTables({
                storeId: storeId,
                count: parseInt(bulkFormData.count),
                startNumber: bulkFormData.startNumber ? parseInt(bulkFormData.startNumber) : null
            });
            setIsBulkModalOpen(false);
            onUpdate();
        } catch (err) {
            console.error('Error bulk creating tables:', err);
            alert('Không thể tạo bàn hàng loạt: ' + (err.response?.data?.message || err.message || 'Lỗi không xác định'));
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
                <div className="header-buttons">
                    <Button onClick={handleOpenBulkModal} variant="outline">🔢 Tạo bàn tự động</Button>
                    <Button onClick={handleOpenModal}>➕ Thêm bàn</Button>
                </div>
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
                        label="Số bàn"
                        type="text"
                        value={formData.tableNumber}
                        onChange={(e) => setFormData({ ...formData, tableNumber: e.target.value })}
                        placeholder="Nhập số bàn (vd: 1, 2, VIP 1)"
                        required
                    />
                    <p className="table-preview">Tên bàn sẽ là: <strong>Bàn {formData.tableNumber || '...'}</strong></p>
                    <div className="form-actions">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="submit">Tạo mới</Button>
                    </div>
                </form>
            </Modal>

            <Modal isOpen={isBulkModalOpen} onClose={() => setIsBulkModalOpen(false)} title="Tạo bàn tự động">
                <form onSubmit={handleBulkSubmit} className="table-form">
                    <Input
                        label="Số lượng bàn cần tạo"
                        type="number"
                        min="1"
                        value={bulkFormData.count}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, count: e.target.value })}
                        placeholder="Nhập số lượng (vd: 10)"
                        required
                    />
                    <Input
                        label="Bắt đầu từ số (tùy chọn)"
                        type="number"
                        min="1"
                        value={bulkFormData.startNumber}
                        onChange={(e) => setBulkFormData({ ...bulkFormData, startNumber: e.target.value })}
                        placeholder="Để trống để tự động tiếp tục"
                    />
                    {bulkFormData.count && (
                        <p className="bulk-preview">
                            Sẽ tạo: <strong>{bulkFormData.count} bàn</strong>
                            {bulkFormData.startNumber && (
                                <> từ <strong>Bàn {bulkFormData.startNumber}</strong> đến <strong>Bàn {parseInt(bulkFormData.startNumber) + parseInt(bulkFormData.count) - 1}</strong></>
                            )}
                        </p>
                    )}
                    <div className="form-actions">
                        <Button type="button" variant="outline" onClick={() => setIsBulkModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="submit">Tạo bàn</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default TablesTab;
