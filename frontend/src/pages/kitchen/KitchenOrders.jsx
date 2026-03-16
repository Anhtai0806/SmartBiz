import React, { useState, useEffect } from 'react';
import { getPendingOrders, completeOrder } from '../../api/kitchenApi';
import './KitchenOrders.css';

const KitchenOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingOrderId, setProcessingOrderId] = useState(null);

    useEffect(() => {
        fetchOrders();
        // Auto refresh every 10 seconds
        const interval = setInterval(fetchOrders, 10000);
        return () => clearInterval(interval);
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await getPendingOrders();
            setOrders(data);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setLoading(false);
        }
    };

    const handleCompleteOrder = async (orderId) => {
        if (!window.confirm('Xác nhận món đã hoàn thành?')) {
            return;
        }

        try {
            setProcessingOrderId(orderId);
            await completeOrder(orderId);
            // Refresh orders list
            await fetchOrders();
            setProcessingOrderId(null);
        } catch (error) {
            console.error('Error completing order:', error);
            alert('Không thể hoàn thành đơn hàng. Vui lòng thử lại.');
            setProcessingOrderId(null);
        }
    };

    const formatTime = (dateTime) => {
        const date = new Date(dateTime);
        return date.toLocaleTimeString('vi-VN', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getTimeSinceOrder = (dateTime) => {
        const now = new Date();
        const orderTime = new Date(dateTime);
        const diffMinutes = Math.floor((now - orderTime) / 60000);

        if (diffMinutes < 1) return 'Vừa xong';
        if (diffMinutes < 60) return `${diffMinutes} phút trước`;
        const hours = Math.floor(diffMinutes / 60);
        return `${hours} giờ trước`;
    };

    if (loading) {
        return <div className="loading">Đang tải đơn hàng...</div>;
    }

    return (
        <div className="kitchen-orders">
            <div className="page-header">
                <h2>Đơn hàng đang chờ</h2>
                <button onClick={fetchOrders} className="refresh-btn">
                    🔄 Làm mới
                </button>
            </div>

            {orders.length === 0 ? (
                <div className="no-orders">
                    <span className="no-orders-icon">✨</span>
                    <p>Không có đơn hàng đang chờ</p>
                </div>
            ) : (
                <div className="orders-grid">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            <div className="order-header">
                                <div className="order-info">
                                    <h3>Bàn {order.tableName}</h3>
                                    <span className={`order-status status-${order.status.toLowerCase()}`}>
                                        {order.status === 'NEW' ? 'Mới' : 'Đang chế biến'}
                                    </span>
                                </div>
                                <div className="order-time">
                                    <div className="time-created">{formatTime(order.createdAt)}</div>
                                    <div className="time-ago">{getTimeSinceOrder(order.createdAt)}</div>
                                </div>
                            </div>

                            <div className="order-items">
                                <h4>Món ăn:</h4>
                                <ul>
                                    {order.items.map((item, index) => (
                                        <li key={index}>
                                            <span className="item-name">{item.menuItemName}</span>
                                            <span className="item-quantity">x{item.quantity}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="order-footer">
                                <div className="order-staff">
                                    Nhân viên: {order.staffName}
                                </div>
                                <button
                                    className="complete-btn"
                                    onClick={() => handleCompleteOrder(order.id)}
                                    disabled={processingOrderId === order.id}
                                >
                                    {processingOrderId === order.id ? '⏳ Đang xử lý...' : '✅ Hoàn thành'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default KitchenOrders;
