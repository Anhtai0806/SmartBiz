import React, { useState, useEffect } from 'react';
import { getMyOrders } from '../../api/staffApi';
import './StaffOrders.css';

const StaffOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            const ordersData = await getMyOrders();
            setOrders(ordersData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
            setLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatDateTime = (dateTime) => {
        return new Date(dateTime).toLocaleString('vi-VN');
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'NEW':
                return 'status-new';
            case 'PROCESSING':
                return 'status-processing';
            case 'DONE':
                return 'status-done';
            case 'CANCELLED':
                return 'status-cancelled';
            default:
                return '';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'NEW':
                return 'Mới';
            case 'PROCESSING':
                return 'Đang xử lý';
            case 'DONE':
                return 'Hoàn thành';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status;
        }
    };

    const filteredOrders = orders.filter(order => {
        if (filterStatus === 'ALL') return true;
        return order.status === filterStatus;
    });

    if (loading) {
        return <div className="loading">Đang tải đơn hàng...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={fetchOrders} className="retry-btn">Thử lại</button>
            </div>
        );
    }

    return (
        <div className="staff-orders">
            <div className="page-header">
                <h2>Đơn hàng của tôi</h2>
                <button onClick={fetchOrders} className="refresh-btn">
                    🔄 Làm mới
                </button>
            </div>

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filterStatus === 'ALL' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('ALL')}
                >
                    Tất cả ({orders.length})
                </button>
                <button
                    className={`filter-tab ${filterStatus === 'NEW' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('NEW')}
                >
                    Mới ({orders.filter(o => o.status === 'NEW').length})
                </button>
                <button
                    className={`filter-tab ${filterStatus === 'PROCESSING' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('PROCESSING')}
                >
                    Đang xử lý ({orders.filter(o => o.status === 'PROCESSING').length})
                </button>
                <button
                    className={`filter-tab ${filterStatus === 'DONE' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('DONE')}
                >
                    Hoàn thành ({orders.filter(o => o.status === 'DONE').length})
                </button>
            </div>

            {/* Orders List */}
            {filteredOrders.length === 0 ? (
                <div className="no-orders">
                    <span className="no-orders-icon">📋</span>
                    <p>Không có đơn hàng nào</p>
                </div>
            ) : (
                <div className="orders-list">
                    {filteredOrders.map(order => (
                        <div
                            key={order.id}
                            className="order-card"
                            onClick={() => setSelectedOrder(order)}
                        >
                            <div className="order-header">
                                <div className="order-id">Order #{order.id}</div>
                                <div className={`order-status ${getStatusBadgeClass(order.status)}`}>
                                    {getStatusText(order.status)}
                                </div>
                            </div>
                            <div className="order-info">
                                <div className="info-item">
                                    <span className="info-label">Bàn:</span>
                                    <span className="info-value">{order.tableName}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Thời gian:</span>
                                    <span className="info-value">{formatDateTime(order.createdAt)}</span>
                                </div>
                                <div className="info-item">
                                    <span className="info-label">Tổng tiền:</span>
                                    <span className="info-value total">{formatCurrency(order.totalAmount)}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Order Detail Modal */}
            {selectedOrder && (
                <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi tiết Order #{selectedOrder.id}</h3>
                            <button className="close-btn" onClick={() => setSelectedOrder(null)}>✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="order-details">
                                <div className="detail-row">
                                    <span className="detail-label">Bàn:</span>
                                    <span className="detail-value">{selectedOrder.tableName}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Trạng thái:</span>
                                    <span className={`status-badge ${getStatusBadgeClass(selectedOrder.status)}`}>
                                        {getStatusText(selectedOrder.status)}
                                    </span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Thời gian:</span>
                                    <span className="detail-value">{formatDateTime(selectedOrder.createdAt)}</span>
                                </div>
                            </div>

                            <div className="order-items">
                                <h4>Món ăn:</h4>
                                {selectedOrder.items && selectedOrder.items.map((item, index) => (
                                    <div key={index} className="item-row">
                                        <span className="item-name">{item.menuItemName}</span>
                                        <span className="item-quantity">x{item.quantity}</span>
                                        <span className="item-price">{formatCurrency(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="order-total">
                                <strong>Tổng cộng:</strong>
                                <strong className="total-amount">{formatCurrency(selectedOrder.totalAmount)}</strong>
                            </div>

                            <button className="btn-close" onClick={() => setSelectedOrder(null)}>
                                Đóng
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffOrders;
