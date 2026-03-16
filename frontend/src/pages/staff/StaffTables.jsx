import React, { useState, useEffect } from 'react';
import { getTablesByStore, getOrderByTable, updateTableStatus, checkStaffWorkingHours } from '../../api/staffApi';
import OrderManagement from '../cashier/OrderManagement';
import './StaffTables.css';

const StaffTables = () => {
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showOrderManagement, setShowOrderManagement] = useState(false);
    const [isInWorkingHours, setIsInWorkingHours] = useState(true);
    const [workingHoursMessage, setWorkingHoursMessage] = useState('');

    useEffect(() => {
        fetchTables();
        checkWorkingHours();
        // Auto-refresh every 30 seconds
        const interval = setInterval(() => {
            fetchTables();
            checkWorkingHours();
        }, 30000);
        return () => clearInterval(interval);
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

    const checkWorkingHours = async () => {
        try {
            const response = await checkStaffWorkingHours();
            setIsInWorkingHours(response.isInWorkingHours);
            if (!response.isInWorkingHours) {
                setWorkingHoursMessage('Bạn chỉ có thể xem thông tin bàn ngoài giờ làm việc.');
            } else {
                setWorkingHoursMessage('');
            }
        } catch (error) {
            console.error('Error checking working hours:', error);
            // If error checking, assume not in working hours for safety
            setIsInWorkingHours(false);
            setWorkingHoursMessage('Không thể xác định ca làm việc. Vui lòng liên hệ quản lý.');
        }
    };

    const handleTableClick = async (table) => {
        setSelectedTable(table);

        // If table has an order, fetch order details
        if (table.currentOrderId) {
            try {
                const orderData = await getOrderByTable(table.id);
                setSelectedOrder(orderData);
            } catch (error) {
                console.error('Error fetching order:', error);
                setSelectedOrder(null);
            }
        } else {
            setSelectedOrder(null);
        }
    };

    const handleStartService = async () => {
        if (!selectedTable) return;

        try {
            await updateTableStatus(selectedTable.id, 'SERVING');
            alert(`Bắt đầu phục vụ ${selectedTable.name}!`);
            setShowOrderManagement(true);
            fetchTables();
        } catch (error) {
            console.error('Error updating table status:', error);
            alert('Không thể cập nhật trạng thái bàn. Vui lòng thử lại.');
        }
    };

    const handleManageOrder = () => {
        setShowOrderManagement(true);
    };

    const closeModal = () => {
        setSelectedTable(null);
        setSelectedOrder(null);
        setShowOrderManagement(false);
    };

    const handleOrderCreated = (order) => {
        setSelectedOrder(order);
        setShowOrderManagement(false);
        fetchTables();
    };

    const handleCleanTable = async () => {
        if (!selectedTable) return;

        if (window.confirm(`Xác nhận đã dọn dẹp bàn ${selectedTable.name}?`)) {
            try {
                await updateTableStatus(selectedTable.id, 'EMPTY');
                alert(`Bàn ${selectedTable.name} đã sẵn sàng đón khách!`);
                closeModal();
                fetchTables();
            } catch (error) {
                console.error('Error updating table status:', error);
                alert('Không thể cập nhật trạng thái bàn. Vui lòng thử lại.');
            }
        }
    };

    const getStatusBadgeClass = (status) => {
        switch (status) {
            case 'EMPTY':
                return 'status-empty';
            case 'SERVING':
                return 'status-serving';
            case 'WAITING_PAYMENT':
                return 'status-waiting';
            case 'PAID':
                return 'status-paid';
            default:
                return '';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'EMPTY':
                return 'Trống';
            case 'SERVING':
                return 'Đang phục vụ';
            case 'WAITING_PAYMENT':
                return 'Chờ thanh toán';
            case 'PAID':
                return 'Đã thanh toán';
            default:
                return status;
        }
    };

    const filteredTables = tables.filter(table => {
        if (filterStatus === 'ALL') return true;
        return table.status === filterStatus;
    });

    if (loading) {
        return <div className="loading">Đang tải danh sách bàn...</div>;
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
        <div className="staff-tables">
            <div className="page-header">
                <h2>Quản lý bàn</h2>
                <button onClick={fetchTables} className="refresh-btn">
                    🔄 Làm mới
                </button>
            </div>

            {/* Working Hours Warning Banner */}
            {!isInWorkingHours && workingHoursMessage && (
                <div className="working-hours-banner">
                    ⚠️ {workingHoursMessage}
                </div>
            )}

            {/* Filter Tabs */}
            <div className="filter-tabs">
                <button
                    className={`filter-tab ${filterStatus === 'ALL' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('ALL')}
                >
                    Tất cả ({tables.length})
                </button>
                <button
                    className={`filter-tab ${filterStatus === 'EMPTY' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('EMPTY')}
                >
                    Trống ({tables.filter(t => t.status === 'EMPTY').length})
                </button>
                <button
                    className={`filter-tab ${filterStatus === 'SERVING' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('SERVING')}
                >
                    Đang phục vụ ({tables.filter(t => t.status === 'SERVING').length})
                </button>
                <button
                    className={`filter-tab ${filterStatus === 'PAID' ? 'active' : ''}`}
                    onClick={() => setFilterStatus('PAID')}
                >
                    Đã thanh toán ({tables.filter(t => t.status === 'PAID').length})
                </button>
            </div>

            {/* Tables Grid */}
            <div className="tables-grid">
                {filteredTables.map(table => (
                    <div
                        key={table.id}
                        className={`table-card ${getStatusBadgeClass(table.status)}`}
                        onClick={() => handleTableClick(table)}
                    >
                        <div className="table-name">{table.name}</div>
                        <div className={`table-status ${getStatusBadgeClass(table.status)}`}>
                            {getStatusText(table.status)}
                        </div>
                        {table.currentOrderId && (
                            <div className="table-order-id">
                                Order #{table.currentOrderId}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Table Detail Modal */}
            {selectedTable && !showOrderManagement && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedTable.name}</h3>
                            <button className="close-btn" onClick={closeModal}>✕</button>
                        </div>

                        <div className="modal-body">
                            <div className="table-info">
                                <div className="info-row">
                                    <span className="info-label">Trạng thái:</span>
                                    <span className={`status-badge ${getStatusBadgeClass(selectedTable.status)}`}>
                                        {getStatusText(selectedTable.status)}
                                    </span>
                                </div>
                                {selectedOrder && selectedOrder.items && selectedOrder.items.length > 0 && (
                                    <div className="order-items-section">
                                        <h4 className="order-items-title">Các món đã order:</h4>
                                        <div className="order-items-list">
                                            {selectedOrder.items.map((item, index) => (
                                                <div key={index} className="order-item-row">
                                                    <div className="item-info">
                                                        <span className="item-name">{item.menuItemName}</span>
                                                        <span className="item-quantity">x{item.quantity}</span>
                                                    </div>
                                                    <div className="item-pricing">
                                                        <span className="item-price">
                                                            {new Intl.NumberFormat('vi-VN', {
                                                                style: 'currency',
                                                                currency: 'VND'
                                                            }).format(item.price)}
                                                        </span>
                                                        <span className="item-subtotal">
                                                            {new Intl.NumberFormat('vi-VN', {
                                                                style: 'currency',
                                                                currency: 'VND'
                                                            }).format(item.subtotal)}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        <div className="order-total-row">
                                            <span className="total-label">Tổng cộng:</span>
                                            <span className="total-amount">
                                                {new Intl.NumberFormat('vi-VN', {
                                                    style: 'currency',
                                                    currency: 'VND'
                                                }).format(selectedOrder.totalAmount || 0)}
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="modal-actions">
                                {selectedTable.status === 'EMPTY' && (
                                    <>
                                        <button
                                            className="btn-primary"
                                            onClick={handleStartService}
                                            disabled={!isInWorkingHours}
                                        >
                                            🍽️ Bắt đầu phục vụ
                                        </button>
                                        {!isInWorkingHours && (
                                            <p className="warning-message">{workingHoursMessage}</p>
                                        )}
                                    </>
                                )}

                                {selectedTable.status === 'SERVING' && (
                                    <>
                                        <button
                                            className="btn-primary"
                                            onClick={handleManageOrder}
                                            disabled={!isInWorkingHours}
                                        >
                                            📝 Quản lý order
                                        </button>
                                        {!isInWorkingHours && (
                                            <p className="warning-message">{workingHoursMessage}</p>
                                        )}
                                    </>
                                )}


                                {selectedTable.status === 'WAITING_PAYMENT' && (
                                    <div className="info-message">
                                        <p>Bàn này đang chờ thu ngân xử lý thanh toán.</p>
                                    </div>
                                )}

                                {selectedTable.status === 'PAID' && (
                                    <>
                                        <button
                                            className="btn-primary"
                                            onClick={handleCleanTable}
                                            disabled={!isInWorkingHours}
                                        >
                                            🧹 Xác nhận dọn dẹp
                                        </button>
                                        {!isInWorkingHours && (
                                            <p className="warning-message">{workingHoursMessage}</p>
                                        )}
                                    </>
                                )}


                                <button className="btn-cancel" onClick={closeModal}>
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Order Management Modal */}
            {showOrderManagement && selectedTable && (
                <div className="modal-overlay">
                    <div className="modal-content modal-large">
                        <OrderManagement
                            table={selectedTable}
                            existingOrder={selectedOrder}
                            onClose={closeModal}
                            onOrderCreated={handleOrderCreated}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StaffTables;
