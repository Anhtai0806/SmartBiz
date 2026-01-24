import React, { useState, useEffect } from 'react';
import { getAllCategories, getAllStores, createCategory, updateCategory, deleteCategory } from '../../api/adminApi';
import Button from '../../components/Button';
import Modal from '../../components/Modal';
import Input from '../../components/Input';
import './AdminCategories.css';

const AdminCategories = () => {
    const [categories, setCategories] = useState([]);
    const [stores, setStores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);
    const [filterStoreId, setFilterStoreId] = useState('');
    const [formData, setFormData] = useState({
        storeId: '',
        name: ''
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [categoriesData, storesData] = await Promise.all([
                getAllCategories(),
                getAllStores()
            ]);
            setCategories(categoriesData);
            setStores(storesData);
        } catch (err) {
            console.error('Error fetching data:', err);
            alert('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenModal = (category = null) => {
        if (category) {
            setEditingCategory(category);
            setFormData({
                storeId: category.storeId,
                name: category.name
            });
        } else {
            setEditingCategory(null);
            setFormData({ storeId: '', name: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingCategory) {
                await updateCategory(editingCategory.id, formData);
            } else {
                await createCategory(formData);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (err) {
            console.error('Error saving category:', err);
            alert('Không thể lưu danh mục: ' + (err.message || 'Lỗi không xác định'));
        }
    };

    const handleDelete = async (categoryId) => {
        if (window.confirm('Bạn có chắc muốn xóa danh mục này? Tất cả sản phẩm trong danh mục cũng sẽ bị xóa!')) {
            try {
                await deleteCategory(categoryId);
                fetchData();
            } catch (err) {
                console.error('Error deleting category:', err);
                alert('Không thể xóa danh mục');
            }
        }
    };

    const filteredCategories = filterStoreId
        ? categories.filter(cat => cat.storeId.toString() === filterStoreId)
        : categories;

    if (loading) {
        return <div className="loading">Đang tải...</div>;
    }

    return (
        <div className="admin-categories">
            <div className="page-header">
                <h2>📂 Quản lý Danh mục</h2>
                <Button onClick={() => handleOpenModal()}>➕ Thêm danh mục</Button>
            </div>

            <div className="filter-section">
                <label>Lọc theo cửa hàng:</label>
                <select
                    value={filterStoreId}
                    onChange={(e) => setFilterStoreId(e.target.value)}
                    className="store-filter"
                >
                    <option value="">Tất cả cửa hàng</option>
                    {stores.map(store => (
                        <option key={store.id} value={store.id}>
                            {store.name}
                        </option>
                    ))}
                </select>
            </div>

            {filteredCategories.length > 0 ? (
                <div className="categories-table">
                    <table>
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Tên danh mục</th>
                                <th>Cửa hàng</th>
                                <th>Số sản phẩm</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCategories.map(category => (
                                <tr key={category.id}>
                                    <td>{category.id}</td>
                                    <td className="category-name">{category.name}</td>
                                    <td>{category.storeName}</td>
                                    <td className="item-count">{category.itemCount || 0}</td>
                                    <td className="actions">
                                        <button
                                            className="btn-edit"
                                            onClick={() => handleOpenModal(category)}
                                            title="Chỉnh sửa"
                                        >
                                            ✏️
                                        </button>
                                        <button
                                            className="btn-delete"
                                            onClick={() => handleDelete(category.id)}
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
                    <p>📭 Chưa có danh mục nào</p>
                    <Button onClick={() => handleOpenModal()}>Thêm danh mục đầu tiên</Button>
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingCategory ? 'Chỉnh sửa danh mục' : 'Thêm danh mục mới'}
            >
                <form onSubmit={handleSubmit} className="category-form">
                    <div className="form-group">
                        <label>Cửa hàng *</label>
                        <select
                            value={formData.storeId}
                            onChange={(e) => setFormData({ ...formData, storeId: e.target.value })}
                            required
                        >
                            <option value="">-- Chọn cửa hàng --</option>
                            {stores.map(store => (
                                <option key={store.id} value={store.id}>
                                    {store.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <Input
                        label="Tên danh mục *"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <div className="form-actions">
                        <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                            Hủy
                        </Button>
                        <Button type="submit">{editingCategory ? 'Cập nhật' : 'Tạo mới'}</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default AdminCategories;
