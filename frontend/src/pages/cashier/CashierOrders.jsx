import React, { useState, useEffect } from 'react';
import { getTodayOrders, updateOrderStatus } from '../../api/cashierApi';
import './CashierOrders.css';

const CashierOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const storeId = localStorage.getItem('storeId') || '1';
            const ordersData = await getTodayOrders(storeId);
            setOrders(ordersData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Không thể tải danh sách đơn hàng. Vui lòng thử lại.');
            setLoading(false);
        }
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            'NEW': { label: 'Mới', className: 'status-new', color: '#3b82f6' },
            'PROCESSING': { label: 'Đang xử lý', className: 'status-processing', color: '#f59e0b' },
            'DONE': { label: 'Hoàn thành', className: 'status-done', color: '#10b981' },
            'CANCELLED': { label: 'Đã hủy', className: 'status-cancelled', color: '#ef4444' },
            'WAITING_PAYMENT': { label: 'Chờ thanh toán', className: 'status-waiting', color: '#8b5cf6' }
        };
        return statusMap[status] || { label: status, className: '', color: '#6b7280' };
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        try {
            await updateOrderStatus(orderId, newStatus);

            // Refresh orders list to get updated data
            await fetchOrders();

            // Update selected order if it's still open
            if (selectedOrder && selectedOrder.id === orderId) {
                const updatedOrder = orders.find(o => o.id === orderId);
                if (updatedOrder) {
                    setSelectedOrder({ ...updatedOrder, status: newStatus });
                }
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại.');
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = filterStatus === 'ALL' || order.status === filterStatus;
        const matchesSearch = order.tableName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toString().includes(searchTerm);
        return matchesStatus && matchesSearch;
    });

    const handleOrderClick = (order) => {
        setSelectedOrder(order);
    };

    const closeModal = () => {
        setSelectedOrder(null);
    };

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
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
        <div className="cashier-orders">
            <div className="page-header">
                <div>
                    <h2>Quản lý đơn hàng</h2>
                    <p className="page-subtitle">Xem và cập nhật trạng thái đơn hàng</p>
                </div>
            </div>

            <div className="controls-section">
                <div className="search-box">
                    <input
                        type="text"
                        placeholder="Tìm kiếm theo bàn hoặc mã đơn..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('ALL')}
                    >
                        Tất cả ({orders.length})
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'NEW' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('NEW')}
                    >
                        Mới ({orders.filter(o => o.status === 'NEW').length})
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'PROCESSING' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('PROCESSING')}
                    >
                        Đang xử lý ({orders.filter(o => o.status === 'PROCESSING').length})
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'WAITING_PAYMENT' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('WAITING_PAYMENT')}
                    >
                        Chờ thanh toán ({orders.filter(o => o.status === 'WAITING_PAYMENT').length})
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'DONE' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('DONE')}
                    >
                        Hoàn thành ({orders.filter(o => o.status === 'DONE').length})
                    </button>
                </div>
            </div>

            <div className="orders-list">
                {filteredOrders.map(order => {
                    const statusInfo = getStatusInfo(order.status);
                    return (
                        <div
                            key={order.id}
                            className="order-card"
                            onClick={() => handleOrderClick(order)}
                        >
                            <div className="order-header">
                                <div className="order-info">
                                    <h3>#{order.id} - {order.tableName}</h3>
                                    <span className="order-time">{formatTime(order.createdAt)}</span>
                                </div>
                                <span className={`status-badge ${statusInfo.className}`}>
                                    {statusInfo.label}
                                </span>
                            </div>
                            <div className="order-items">
                                {order.items && order.items.map(item => (
                                    <div key={item.id} className="item-row">
                                        <span>{item.menuItemName} x{item.quantity}</span>
                                        <span>{formatCurrency(item.subtotal)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="order-total">
                                <strong>Tổng cộng:</strong>
                                <strong className="total-amount">{formatCurrency(order.totalAmount)}</strong>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredOrders.length === 0 && (
                <div className="no-data">
                    <p>Không tìm thấy đơn hàng nào</p>
                </div>
            )}

            {selectedOrder && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Chi tiết đơn hàng #{selectedOrder.id}</h3>
                            <button className="close-btn" onClick={closeModal}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="order-detail">
                                <p><strong>Bàn:</strong> {selectedOrder.tableName}</p>
                                <p><strong>Thời gian:</strong> {formatTime(selectedOrder.createdAt)}</p>
                                <p><strong>Trạng thái:</strong> {getStatusInfo(selectedOrder.status).label}</p>
                            </div>

                            <div className="items-detail">
                                <h4>Món đã gọi:</h4>
                                {selectedOrder.items && selectedOrder.items.map(item => (
                                    <div key={item.id} className="detail-item-row">
                                        <span>{item.menuItemName}</span>
                                        <span>x{item.quantity}</span>
                                        <span>{formatCurrency(item.subtotal)}</span>
                                    </div>
                                ))}
                                <div className="detail-total">
                                    <strong>Tổng cộng:</strong>
                                    <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
                                </div>
                            </div>

                            <div className="status-actions">
                                <h4>Cập nhật trạng thái:</h4>
                                <div className="status-buttons">
                                    {selectedOrder.status === 'NEW' && (
                                        <button
                                            className="btn-warning"
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'PROCESSING')}
                                        >
                                            Đang xử lý
                                        </button>
                                    )}
                                    {selectedOrder.status === 'PROCESSING' && (
                                        <button
                                            className="btn-success"
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'DONE')}
                                        >
                                            Hoàn thành
                                        </button>
                                    )}
                                    {(selectedOrder.status === 'NEW' || selectedOrder.status === 'PROCESSING') && (
                                        <button
                                            className="btn-danger"
                                            onClick={() => handleUpdateStatus(selectedOrder.id, 'CANCELLED')}
                                        >
                                            Hủy đơn
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashierOrders;
