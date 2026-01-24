import React, { useState, useEffect } from 'react';
import Modal from '../../components/Modal';
import Button from '../../components/Button';
import Input from '../../components/Input';
import './OwnerInventory.css';

const OwnerInventory = () => {
    const [products, setProducts] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [formData, setFormData] = useState({
        name: '',
        sku: '',
        category: '',
        price: '',
        stock: '',
        minStock: '',
        unit: ''
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState('all');

    useEffect(() => {
        // TODO: Fetch products from backend API
        setProducts([
            { id: 1, name: 'Cà phê đen', sku: 'CF001', category: 'Đồ uống', price: 25000, stock: 150, minStock: 50, unit: 'ly' },
            { id: 2, name: 'Bánh mì', sku: 'BM001', category: 'Thức ăn', price: 15000, stock: 30, minStock: 20, unit: 'cái' },
            { id: 3, name: 'Trà sữa', sku: 'TS001', category: 'Đồ uống', price: 35000, stock: 10, minStock: 30, unit: 'ly' },
            { id: 4, name: 'Nước ngọt', sku: 'NN001', category: 'Đồ uống', price: 12000, stock: 200, minStock: 100, unit: 'chai' }
        ]);
    }, []);

    const handleOpenModal = (product = null) => {
        if (product) {
            setEditingProduct(product);
            setFormData(product);
        } else {
            setEditingProduct(null);
            setFormData({
                name: '',
                sku: '',
                category: '',
                price: '',
                stock: '',
                minStock: '',
                unit: ''
            });
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingProduct(null);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // TODO: Call backend API to create/update product
        if (editingProduct) {
            setProducts(products.map(p => p.id === editingProduct.id ? { ...formData, id: editingProduct.id } : p));
        } else {
            setProducts([...products, { ...formData, id: Date.now() }]);
        }
        handleCloseModal();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
            // TODO: Call backend API to delete product
            setProducts(products.filter(p => p.id !== id));
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const isLowStock = (product) => {
        return product.stock <= product.minStock;
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.sku.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
        return matchesSearch && matchesCategory;
    });

    const categories = [...new Set(products.map(p => p.category))];
    const lowStockCount = products.filter(isLowStock).length;

    return (
        <div className="owner-inventory">
            <div className="page-header">
                <div>
                    <h1>Quản lý Kho hàng</h1>
                    <p>Quản lý sản phẩm và theo dõi tồn kho</p>
                    {lowStockCount > 0 && (
                        <div className="alert-banner">
                            ⚠️ Có {lowStockCount} sản phẩm sắp hết hàng
                        </div>
                    )}
                </div>
                <Button onClick={() => handleOpenModal()}>
                    ➕ Thêm sản phẩm
                </Button>
            </div>

            <div className="filters-bar">
                <div className="search-bar">
                    <Input
                        type="text"
                        placeholder="🔍 Tìm kiếm sản phẩm..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="category-filter">
                    <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
                        <option value="all">Tất cả danh mục</option>
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="inventory-table">
                <table>
                    <thead>
                        <tr>
                            <th>Mã SKU</th>
                            <th>Tên sản phẩm</th>
                            <th>Danh mục</th>
                            <th>Giá</th>
                            <th>Tồn kho</th>
                            <th>Đơn vị</th>
                            <th>Trạng thái</th>
                            <th>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredProducts.map(product => (
                            <tr key={product.id} className={isLowStock(product) ? 'low-stock-row' : ''}>
                                <td className="sku">{product.sku}</td>
                                <td className="product-name">{product.name}</td>
                                <td>{product.category}</td>
                                <td>{formatCurrency(product.price)}</td>
                                <td>
                                    <span className={`stock-badge ${isLowStock(product) ? 'low' : 'normal'}`}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td>{product.unit}</td>
                                <td>
                                    {isLowStock(product) ? (
                                        <span className="status-badge warning">⚠️ Sắp hết</span>
                                    ) : (
                                        <span className="status-badge ok">✅ Đủ hàng</span>
                                    )}
                                </td>
                                <td className="actions">
                                    <button
                                        className="btn-edit"
                                        onClick={() => handleOpenModal(product)}
                                        title="Chỉnh sửa"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        className="btn-delete"
                                        onClick={() => handleDelete(product.id)}
                                        title="Xóa"
                                    >
                                        🗑️
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {filteredProducts.length === 0 && (
                    <div className="empty-state">
                        <p>Không tìm thấy sản phẩm nào</p>
                    </div>
                )}
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={editingProduct ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}>
                <form onSubmit={handleSubmit} className="product-form">
                    <Input
                        label="Tên sản phẩm"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Input
                        label="Mã SKU"
                        type="text"
                        value={formData.sku}
                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                        required
                    />
                    <Input
                        label="Danh mục"
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        required
                    />
                    <Input
                        label="Giá (VNĐ)"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        required
                    />
                    <Input
                        label="Số lượng tồn kho"
                        type="number"
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        required
                    />
                    <Input
                        label="Tồn kho tối thiểu"
                        type="number"
                        value={formData.minStock}
                        onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                        required
                    />
                    <Input
                        label="Đơn vị"
                        type="text"
                        value={formData.unit}
                        onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                        placeholder="ly, cái, chai, ..."
                        required
                    />
                    <div className="form-actions">
                        <Button type="button" variant="outline" onClick={handleCloseModal}>
                            Hủy
                        </Button>
                        <Button type="submit">
                            {editingProduct ? 'Cập nhật' : 'Tạo mới'}
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default OwnerInventory;
