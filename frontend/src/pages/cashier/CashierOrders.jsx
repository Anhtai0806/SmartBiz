import React, { useState, useEffect } from 'react';
import './CashierOrders.css';

const CashierOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            // TODO: Replace with actual API call
            // const shiftId = localStorage.getItem('currentShiftId');
            // const response = await fetch(`/api/orders/shift/${shiftId}`);
            // const data = await response.json();

            // Mock data for now
            const mockOrders = [
                {
                    id: 1,
                    tableId: 1,
                    tableName: 'Bàn 1',
                    status: 'PROCESSING',
                    createdAt: '2026-01-24T10:30:00',
                    items: [
                        { id: 1, name: 'Cà phê sữa', quantity: 2, price: 25000 },
                        { id: 2, name: 'Bánh mì', quantity: 1, price: 20000 }
                    ],
                    total: 70000
                },
                {
                    id: 2,
                    tableId: 3,
                    tableName: 'Bàn 3',
                    status: 'WAITING_PAYMENT',
                    createdAt: '2026-01-24T11:15:00',
                    items: [
                        { id: 3, name: 'Trà sữa', quantity: 3, price: 30000 },
                        { id: 4, name: 'Bánh ngọt', quantity: 2, price: 35000 }
                    ],
                    total: 160000
                },
                {
                    id: 3,
                    tableId: 5,
                    tableName: 'Bàn 5',
                    status: 'DONE',
                    createdAt: '2026-01-24T11:45:00',
                    items: [
                        { id: 5, name: 'Nước ép', quantity: 2, price: 40000 }
                    ],
                    total: 80000
                },
                {
                    id: 4,
                    tableId: 2,
                    tableName: 'Bàn 2',
                    status: 'NEW',
                    createdAt: '2026-01-24T12:00:00',
                    items: [
                        { id: 6, name: 'Cà phê đen', quantity: 1, price: 20000 }
                    ],
                    total: 20000
                }
            ];

            setOrders(mockOrders);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching orders:', error);
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
            // TODO: Replace with actual API call
            // await fetch(`/api/orders/${orderId}/status`, {
            //     method: 'PUT',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ status: newStatus })
            // });

            // Update local state
            setOrders(orders.map(order =>
                order.id === orderId ? { ...order, status: newStatus } : order
            ));

            if (selectedOrder && selectedOrder.id === orderId) {
                setSelectedOrder({ ...selectedOrder, status: newStatus });
            }
        } catch (error) {
            console.error('Error updating order status:', error);
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
        return <div className="loading">Đang tải...</div>;
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
                                {order.items.map(item => (
                                    <div key={item.id} className="item-row">
                                        <span>{item.name} x{item.quantity}</span>
                                        <span>{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="order-total">
                                <strong>Tổng cộng:</strong>
                                <strong className="total-amount">{formatCurrency(order.total)}</strong>
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
                                {selectedOrder.items.map(item => (
                                    <div key={item.id} className="detail-item-row">
                                        <span>{item.name}</span>
                                        <span>x{item.quantity}</span>
                                        <span>{formatCurrency(item.price * item.quantity)}</span>
                                    </div>
                                ))}
                                <div className="detail-total">
                                    <strong>Tổng cộng:</strong>
                                    <strong>{formatCurrency(selectedOrder.total)}</strong>
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
