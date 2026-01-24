import React, { useState, useEffect, useCallback } from 'react';
import { createMenuItem, updateMenuItem, deleteMenuItem, getStoreCategories } from '../../api/businessOwnerApi';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import './InventoryTab.css';

const InventoryTab = ({ storeId, menuItems, onUpdate }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        price: '',
        categoryId: '',
        status: true
    });

    const fetchCategories = useCallback(async () => {
        try {
            const data = await getStoreCategories(storeId);
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    }, [storeId]);

    useEffect(() => {
        if (storeId) {
            fetchCategories();
        }
    }, [storeId, fetchCategories]);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                price: item.price,
                categoryId: item.categoryId,
                status: item.status
            });
        } else {
            setEditingItem(null);
            setFormData({
                name: '',
                price: '',
                categoryId: categories.length > 0 ? categories[0].id : '',
                status: true
            });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await updateMenuItem(editingItem.id, formData);
            } else {
                await createMenuItem(storeId, formData);
            }
            setIsModalOpen(false);
            onUpdate();
        } catch (err) {
            console.error('Error saving menu item:', err);
            alert('Không thể lưu sản phẩm: ' + (err.message || 'Lỗi không xác định'));
        }
    };

    const handleDelete = async (itemId) => {
        if (window.confirm('Bạn có chắc muốn xóa sản phẩm này?')) {
            try {
                await deleteMenuItem(itemId);
                onUpdate();
            } catch (err) {
                console.error('Error deleting item:', err);
                alert('Không thể xóa sản phẩm');
            }
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    return (
        <div className="inventory-tab">
            <div className="tab-header">
                <h3>Danh sách Sản phẩm</h3>
                <Button onClick={() => handleOpenModal()}>➕ Thêm sản phẩm</Button>
            </div>

            {menuItems && menuItems.length > 0 ? (
                <div className="inventory-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Tên sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Giá</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {menuItems.map(item => (
                                <tr key={item.id}>
                                    <td className="item-name">{item.name}</td>
                                    <td>{item.categoryName || 'N/A'}</td>
                                    <td className="item-price">{formatCurrency(item.price)}</td>
                                    <td>
                                        <span className={`status-badge ${item.status ? 'active' : 'inactive'}`}>
                                            {item.status ? '✅ Có sẵn' : '❌ Hết hàng'}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleOpenModal(item)}
                                            title="Chỉnh sửa"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(item.id)}
                                            title="Xóa"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <div className="empty-state">
                    <p>📭 Chưa có sản phẩm nào</p>
                    <Button onClick={() => handleOpenModal()}>Thêm sản phẩm đầu tiên</Button>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
            >
                <form onSubmit={handleSubmit} className="inventory-form">
                    <Input
                        label="Tên sản phẩm"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Giá (VNĐ)"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                    />
                    <div className="form-group">
                        <label>Danh mục *</label>
                        <select
                            value={formData.categoryId}
                            onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                            required
                        >
                            <option value="">-- Chọn danh mục --</option>
                            {categories.map(category => (
                                <option key={category.id} value={category.id}>
                                    {category.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Trạng thái</label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value === 'true' })}
                        >
                            <option value="true">Có sẵn</option>
                            <option value="false">Hết hàng</option>
                        </select>
                    </div>
                    <div className="form-actions">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="submit">{editingItem ? 'Cập nhật' : 'Tạo mới'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default InventoryTab;
