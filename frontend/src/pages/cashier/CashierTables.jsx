import React, { useState, useEffect } from 'react';
import { getTablesByStore, getOrderByTable } from '../../api/cashierApi';
import { useNavigate } from 'react-router-dom';
import OrderManagement from './OrderManagement';
import './CashierTables.css';

const CashierTables = () => {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [error, setError] = useState(null);
    const [showOrderManagement, setShowOrderManagement] = useState(false);

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            setLoading(true);
            setError(null);

            const storeId = localStorage.getItem('storeId') || '1';
            const tablesData = await getTablesByStore(storeId);
            setTables(tablesData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tables:', error);
            setError('Không thể tải danh sách bàn. Vui lòng thử lại.');
            setLoading(false);
        }
    };

    const getStatusInfo = (status) => {
        const statusMap = {
            'EMPTY': { label: 'Trống', className: 'table-empty', icon: '⚪' },
            'SERVING': { label: 'Đang phục vụ', className: 'table-serving', icon: '🟢' },
            'WAITING_PAYMENT': { label: 'Chờ thanh toán', className: 'table-waiting', icon: '🟡' },
            'PAID': { label: 'Đã thanh toán', className: 'table-paid', icon: '🔵' }
        };
        return statusMap[status] || { label: status, className: '', icon: '⚪' };
    };

    const filteredTables = filterStatus === 'ALL'
        ? tables
        : tables.filter(table => table.status === filterStatus);

    const handleTableClick = async (table) => {
        setSelectedTable(table);

        // Fetch order details if table has an active order
        if (table.status === 'SERVING' || table.status === 'WAITING_PAYMENT') {
            try {
                const orderData = await getOrderByTable(table.id);
                setSelectedOrder(orderData);
            } catch (error) {
                console.error('Error fetching order details:', error);
                setSelectedOrder(null);
            }
        } else {
            setSelectedOrder(null);
        }
    };

    const closeModal = () => {
        setSelectedTable(null);
        setSelectedOrder(null);
    };

    const handleStartService = () => {
        setShowOrderManagement(true);
    };

    const handleManageOrder = () => {
        setShowOrderManagement(true);
    };

    const handleOrderCreated = async (order) => {
        setShowOrderManagement(false);
        setSelectedOrder(order);
        await fetchTables(); // Refresh tables to show updated status
    };

    const handleCloseOrderManagement = () => {
        setShowOrderManagement(false);
        setSelectedTable(null);
        setSelectedOrder(null);
        fetchTables(); // Refresh tables
    };



    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={fetchTables} className="retry-btn">Thử lại</button>
            </div>
        );
    }

    return (
        <div className="cashier-tables">
            <div className="page-header">
                <div>
                    <h2>Quản lý bàn</h2>
                    <p className="page-subtitle">Xem trạng thái và quản lý các bàn</p>
                </div>
            </div>

            <div className="filter-section">
                <div className="filter-buttons">
                    <button
                        className={`filter-btn ${filterStatus === 'ALL' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('ALL')}
                    >
                        Tất cả ({tables.length})
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'EMPTY' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('EMPTY')}
                    >
                        ⚪ Trống ({tables.filter(t => t.status === 'EMPTY').length})
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'SERVING' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('SERVING')}
                    >
                        🟢 Đang phục vụ ({tables.filter(t => t.status === 'SERVING').length})
                    </button>
                    <button
                        className={`filter-btn ${filterStatus === 'WAITING_PAYMENT' ? 'active' : ''}`}
                        onClick={() => setFilterStatus('WAITING_PAYMENT')}
                    >
                        🟡 Chờ thanh toán ({tables.filter(t => t.status === 'WAITING_PAYMENT').length})
                    </button>
                </div>
            </div>

            <div className="tables-grid">
                {filteredTables.map(table => {
                    const statusInfo = getStatusInfo(table.status);
                    return (
                        <div
                            key={table.id}
                            className={`table-card ${statusInfo.className}`}
                            onClick={() => handleTableClick(table)}
                        >
                            <div className="table-icon">🪑</div>
                            <div className="table-name">{table.name}</div>
                            <div className="table-status">
                                <span className="status-icon">{statusInfo.icon}</span>
                                <span className="status-label">{statusInfo.label}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredTables.length === 0 && (
                <div className="no-data">
                    <p>Không có bàn nào</p>
                </div>
            )}

            {selectedTable && !showOrderManagement && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedTable.name}</h3>
                            <button className="close-btn" onClick={closeModal}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="table-detail">
                                <p><strong>Trạng thái:</strong> {getStatusInfo(selectedTable.status).label}</p>
                            </div>

                            {selectedOrder && (
                                <div className="order-details">
                                    <h4>Chi tiết đơn hàng</h4>
                                    <p><strong>Mã đơn:</strong> #{selectedOrder.id}</p>
                                    <p><strong>Nhân viên:</strong> {selectedOrder.staffName}</p>
                                    <div className="order-items">
                                        <h5>Món đã gọi:</h5>
                                        {selectedOrder.items && selectedOrder.items.map(item => (
                                            <div key={item.id} className="order-item">
                                                <span>{item.menuItemName} x{item.quantity}</span>
                                                <span className="price">{formatCurrency(item.subtotal)}</span>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="order-total">
                                        <strong>Tổng cộng:</strong>
                                        <strong>{formatCurrency(selectedOrder.totalAmount)}</strong>
                                    </div>
                                </div>
                            )}

                            <div className="table-actions">
                                {selectedTable.status === 'EMPTY' && (
                                    <button
                                        className="btn-primary"
                                        onClick={handleStartService}
                                    >
                                        🍽️ Bắt đầu phục vụ
                                    </button>
                                )}

                                {selectedTable.status === 'SERVING' && (
                                    <>
                                        <button
                                            className="btn-primary"
                                            onClick={handleManageOrder}
                                        >
                                            📝 Quản lý order
                                        </button>
                                        <button
                                            className="btn-success"
                                            onClick={() => navigate('/cashier/payment')}
                                        >
                                            💳 Thanh toán
                                        </button>
                                    </>
                                )}

                                {selectedTable.status === 'WAITING_PAYMENT' && (
                                    <button
                                        className="btn-success"
                                        onClick={() => navigate('/cashier/payment')}
                                    >
                                        💳 Thanh toán
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showOrderManagement && selectedTable && (
                <OrderManagement
                    table={selectedTable}
                    existingOrder={selectedOrder}
                    onClose={handleCloseOrderManagement}
                    onOrderCreated={handleOrderCreated}
                />
            )}
        </div>
    );
};

export default CashierTables;
