import React, { useState, useEffect } from 'react';
import { getTablesByStore, getOrderByTable, updateTableStatus } from '../../api/staffApi';
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

    useEffect(() => {
        fetchTables();
        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchTables, 30000);
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
                                {selectedOrder && (
                                    <>
                                        <div className="info-row">
                                            <span className="info-label">Order ID:</span>
                                            <span>#{selectedOrder.id}</span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-label">Trạng thái order:</span>
                                            <span className="order-status">{selectedOrder.status}</span>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="modal-actions">
                                {selectedTable.status === 'EMPTY' && (
                                    <button
                                        className="btn-primary"
                                        onClick={handleStartService}
                                    >
                                        🍽️ Bắt đầu phục vụ
                                    </button>
                                )}

                                {selectedTable.status === 'SERVING' && (
                                    <button
                                        className="btn-primary"
                                        onClick={handleManageOrder}
                                    >
                                        📝 Quản lý order
                                    </button>
                                )}

                                {(selectedTable.status === 'WAITING_PAYMENT' || selectedTable.status === 'PAID') && (
                                    <div className="info-message">
                                        <p>Bàn này đang chờ thu ngân xử lý thanh toán.</p>
                                    </div>
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
