import React, { useState, useEffect } from 'react';
import './CashierTables.css';

const CashierTables = () => {
    const [tables, setTables] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTable, setSelectedTable] = useState(null);
    const [filterStatus, setFilterStatus] = useState('ALL');

    useEffect(() => {
        fetchTables();
    }, []);

    const fetchTables = async () => {
        try {
            // TODO: Replace with actual API call
            // const storeId = localStorage.getItem('storeId');
            // const response = await fetch(`/api/tables/store/${storeId}`);
            // const data = await response.json();

            // Mock data for now
            const mockTables = [
                { id: 1, name: 'Bàn 1', status: 'SERVING', capacity: 4 },
                { id: 2, name: 'Bàn 2', status: 'EMPTY', capacity: 2 },
                { id: 3, name: 'Bàn 3', status: 'WAITING_PAYMENT', capacity: 4 },
                { id: 4, name: 'Bàn 4', status: 'EMPTY', capacity: 6 },
                { id: 5, name: 'Bàn 5', status: 'SERVING', capacity: 4 },
                { id: 6, name: 'Bàn 6', status: 'PAID', capacity: 2 },
                { id: 7, name: 'Bàn 7', status: 'EMPTY', capacity: 4 },
                { id: 8, name: 'Bàn 8', status: 'SERVING', capacity: 8 },
            ];

            setTables(mockTables);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tables:', error);
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

    const handleTableClick = (table) => {
        setSelectedTable(table);
        // TODO: Fetch order details for this table
    };

    const closeModal = () => {
        setSelectedTable(null);
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
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
                            <div className="table-capacity">Sức chứa: {table.capacity} người</div>
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

            {selectedTable && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{selectedTable.name}</h3>
                            <button className="close-btn" onClick={closeModal}>✕</button>
                        </div>
                        <div className="modal-body">
                            <div className="table-detail">
                                <p><strong>Trạng thái:</strong> {getStatusInfo(selectedTable.status).label}</p>
                                <p><strong>Sức chứa:</strong> {selectedTable.capacity} người</p>
                            </div>
                            {selectedTable.status !== 'EMPTY' && (
                                <div className="table-actions">
                                    <button className="btn-primary">Xem đơn hàng</button>
                                    {selectedTable.status === 'WAITING_PAYMENT' && (
                                        <button className="btn-success">Thanh toán</button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashierTables;
