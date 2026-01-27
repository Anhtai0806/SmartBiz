import React, { useState, useEffect } from 'react';
import { getMenuItemsByStore, createOrder, addItemToOrder, removeOrderItem, updateOrderItem } from '../../api/cashierApi';
import { useNavigate } from 'react-router-dom';
import './OrderManagement.css';

const OrderManagement = ({ table, existingOrder, onClose, onOrderCreated }) => {
    const navigate = useNavigate();
    const [menuItems, setMenuItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [orderItems, setOrderItems] = useState([]);
    const [currentOrder, setCurrentOrder] = useState(existingOrder);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchMenuItems();
        if (existingOrder) {
            setOrderItems(existingOrder.items || []);
        }
    }, [existingOrder]);

    const fetchMenuItems = async () => {
        try {
            setLoading(true);
            const storeId = localStorage.getItem('storeId') || '1';
            const items = await getMenuItemsByStore(storeId);
            setMenuItems(items);

            // Extract unique categories
            const uniqueCategories = [...new Set(items.map(item => item.categoryName))];
            setCategories(['ALL', ...uniqueCategories]);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching menu items:', error);
            setLoading(false);
        }
    };

    const filteredMenuItems = menuItems.filter(item => {
        const matchesCategory = selectedCategory === 'ALL' || item.categoryName === selectedCategory;
        const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const calculateTotal = () => {
        return orderItems.reduce((sum, item) => sum + (item.subtotal || item.price * item.quantity), 0);
    };

    const handleAddItem = async (menuItem) => {
        if (currentOrder) {
            // Add to existing order via API
            try {
                const response = await addItemToOrder(currentOrder.id, {
                    menuItemId: menuItem.id,
                    quantity: 1
                });
                setOrderItems(response.items);
                setCurrentOrder(response);
            } catch (error) {
                console.error('Error adding item:', error);
                alert('Không thể thêm món. Vui lòng thử lại.');
            }
        } else {
            // Add to local state for new order
            const existingItem = orderItems.find(item => item.menuItemId === menuItem.id);
            if (existingItem) {
                setOrderItems(orderItems.map(item =>
                    item.menuItemId === menuItem.id
                        ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
                        : item
                ));
            } else {
                setOrderItems([...orderItems, {
                    menuItemId: menuItem.id,
                    menuItemName: menuItem.name,
                    price: menuItem.price,
                    quantity: 1,
                    subtotal: menuItem.price
                }]);
            }
        }
    };

    const handleUpdateQuantity = async (item, newQuantity) => {
        if (newQuantity < 1) {
            handleRemoveItem(item);
            return;
        }

        if (currentOrder) {
            // Update via API
            try {
                const response = await updateOrderItem(currentOrder.id, item.id, newQuantity);
                setOrderItems(response.items);
                setCurrentOrder(response);
            } catch (error) {
                console.error('Error updating item:', error);
                alert('Không thể cập nhật món. Vui lòng thử lại.');
            }
        } else {
            // Update local state
            setOrderItems(orderItems.map(orderItem =>
                orderItem.menuItemId === item.menuItemId
                    ? { ...orderItem, quantity: newQuantity, subtotal: newQuantity * orderItem.price }
                    : orderItem
            ));
        }
    };

    const handleRemoveItem = async (item) => {
        if (currentOrder) {
            // Remove via API
            try {
                const response = await removeOrderItem(currentOrder.id, item.id);
                setOrderItems(response.items);
                setCurrentOrder(response);
            } catch (error) {
                console.error('Error removing item:', error);
                if (error.response?.data?.message) {
                    alert(error.response.data.message);
                } else {
                    alert('Không thể xóa món. Vui lòng thử lại.');
                }
            }
        } else {
            // Remove from local state
            setOrderItems(orderItems.filter(orderItem => orderItem.menuItemId !== item.menuItemId));
        }
    };

    const handleConfirmOrder = async () => {
        if (orderItems.length === 0) {
            alert('Vui lòng chọn ít nhất một món!');
            return;
        }

        setProcessing(true);
        try {
            // Get shift ID from localStorage or use default
            const shiftId = localStorage.getItem('currentShiftId') || '1';

            const orderData = {
                tableId: table.id,
                shiftId: parseInt(shiftId),
                items: orderItems.map(item => ({
                    menuItemId: item.menuItemId,
                    quantity: item.quantity
                }))
            };

            const response = await createOrder(orderData);
            setCurrentOrder(response);
            alert('Tạo order thành công!');
            if (onOrderCreated) {
                onOrderCreated(response);
            }
        } catch (error) {
            console.error('Error creating order:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Không thể tạo order. Vui lòng thử lại.';
            alert(errorMessage);
        } finally {
            setProcessing(false);
        }
    };

    const handleGoToPayment = () => {
        onClose();
        navigate('/cashier/payment');
    };

    if (loading) {
        return <div className="loading">Đang tải menu...</div>;
    }

    return (
        <div className="order-management">
            <div className="order-management-header">
                <h2>{table.name} - {currentOrder ? `Order #${currentOrder.id}` : 'Order mới'}</h2>
                <button className="close-btn" onClick={onClose}>✕</button>
            </div>

            <div className="order-management-body">
                {/* Menu Section */}
                <div className="menu-section">
                    <div className="menu-header">
                        <h3>Menu</h3>
                        <input
                            type="text"
                            placeholder="Tìm món..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <div className="category-tabs">
                        {categories.map(category => (
                            <button
                                key={category}
                                className={`category-tab ${selectedCategory === category ? 'active' : ''}`}
                                onClick={() => setSelectedCategory(category)}
                            >
                                {category}
                            </button>
                        ))}
                    </div>

                    <div className="menu-items-grid">
                        {filteredMenuItems.map(item => (
                            <div key={item.id} className="menu-item-card">
                                <div className="menu-item-info">
                                    <h4>{item.name}</h4>
                                    <p className="menu-item-price">{formatCurrency(item.price)}</p>
                                </div>
                                <button
                                    className="add-item-btn"
                                    onClick={() => handleAddItem(item)}
                                >
                                    +
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Order Section */}
                <div className="order-section">
                    <h3>Order hiện tại</h3>

                    {orderItems.length === 0 ? (
                        <div className="empty-order">
                            <p>Chưa có món nào được chọn</p>
                            <button className="btn-cancel-large" onClick={onClose}>
                                Quay lại
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="order-items-list">
                                {orderItems.map((item, index) => (
                                    <div key={item.id || item.menuItemId || index} className="order-item-row">
                                        <div className="item-details">
                                            <span className="item-name">{item.menuItemName}</span>
                                            <span className="item-price">{formatCurrency(item.price)}</span>
                                        </div>
                                        <div className="item-controls">
                                            <button
                                                className="qty-btn"
                                                onClick={() => handleUpdateQuantity(item, item.quantity - 1)}
                                            >
                                                −
                                            </button>
                                            <span className="quantity">{item.quantity}</span>
                                            <button
                                                className="qty-btn"
                                                onClick={() => handleUpdateQuantity(item, item.quantity + 1)}
                                            >
                                                +
                                            </button>
                                            <span className="item-subtotal">{formatCurrency(item.subtotal || item.price * item.quantity)}</span>
                                            <button
                                                className="remove-btn"
                                                onClick={() => handleRemoveItem(item)}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="order-total">
                                <strong>Tổng cộng:</strong>
                                <strong className="total-amount">{formatCurrency(calculateTotal())}</strong>
                            </div>

                            <div className="order-actions">
                                {!currentOrder ? (
                                    <>
                                        <button
                                            className="btn-cancel"
                                            onClick={onClose}
                                        >
                                            Quay lại
                                        </button>
                                        <button
                                            className="btn-confirm"
                                            onClick={handleConfirmOrder}
                                            disabled={processing}
                                        >
                                            {processing ? 'Đang xử lý...' : '✓ Xác nhận order'}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            className="btn-cancel"
                                            onClick={onClose}
                                        >
                                            Đóng
                                        </button>
                                        <button
                                            className="btn-payment"
                                            onClick={handleGoToPayment}
                                        >
                                            💳 Thanh toán
                                        </button>
                                    </>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderManagement;
