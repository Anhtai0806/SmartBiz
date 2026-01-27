import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getTablesWithOrders, getOrderByTable, createCashierInvoice, getStoreQR } from '../../api/cashierApi';
import './CashierPayment.css';

const CashierPayment = () => {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState(null);

    // QR Payment State
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrData, setQrData] = useState(null);
    const [qrLoading, setQrLoading] = useState(false);

    useEffect(() => {
        fetchTablesWithOrders();
    }, []);

    const fetchTablesWithOrders = async () => {
        try {
            setLoading(true);
            setError(null);

            const storeId = localStorage.getItem('storeId') || '1';
            const tablesData = await getTablesWithOrders(storeId);
            setTables(tablesData);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tables:', error);
            setError('Không thể tải danh sách bàn. Vui lòng thử lại.');
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (tableId) => {
        try {
            const orderData = await getOrderByTable(tableId);
            setOrderDetails(orderData);
        } catch (error) {
            console.error('Error fetching order details:', error);
            setOrderDetails(null);
        }
    };

    const handleTableSelect = (table) => {
        setSelectedTable(table);
        fetchOrderDetails(table.id);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handlePaymentClick = async () => {
        if (!selectedTable || !orderDetails) return;

        if (paymentMethod === 'TRANSFER') {
            // Fetch QR Code and Show Modal
            setQrLoading(true);
            try {
                const storeId = localStorage.getItem('storeId') || '1';
                const data = await getStoreQR(storeId);
                setQrData(data);
                setShowQRModal(true);
            } catch (err) {
                console.error('Error fetching QR:', err);
                alert('Không thể tải mã QR cửa hàng. Vui lòng kiểm tra lại.');
            } finally {
                setQrLoading(false);
            }
        } else {
            // Direct Cash Payment
            await processInvoiceCreation();
        }
    };

    const processInvoiceCreation = async () => {
        setProcessing(true);
        try {
            // Create invoice via API
            await createCashierInvoice({
                orderId: orderDetails.id,
                paymentMethod: paymentMethod
            });

            alert(`Thanh toán thành công cho ${selectedTable.name}!`);

            // Reset state
            setSelectedTable(null);
            setOrderDetails(null);
            setPaymentMethod('CASH');
            setShowQRModal(false);

            // Refresh tables list
            await fetchTablesWithOrders();
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Có lỗi xảy ra khi thanh toán. Vui lòng thử lại!');
        } finally {
            setProcessing(false);
        }
    };

    const handlePrintInvoice = () => {
        window.print();
    };

    if (loading) {
        return <div className="loading">Đang tải dữ liệu...</div>;
    }

    if (error) {
        return (
            <div className="error-container">
                <p className="error-message">{error}</p>
                <button onClick={fetchTablesWithOrders} className="retry-btn">Thử lại</button>
            </div>
        );
    }

    return (
        <div className="cashier-payment">
            <div className="page-header">
                <h2>Thanh toán</h2>
                <p className="page-subtitle">Xử lý thanh toán và tạo hóa đơn</p>
            </div>

            <div className="payment-container">
                <div className="table-selection">
                    <h3>Chọn bàn cần thanh toán</h3>
                    {tables.length === 0 ? (
                        <div className="no-tables">
                            <p>Không có bàn nào chờ thanh toán</p>
                        </div>
                    ) : (
                        <div className="tables-list">
                            {tables.map(table => (
                                <div
                                    key={table.id}
                                    className={`table-item ${selectedTable?.id === table.id ? 'selected' : ''}`}
                                    onClick={() => handleTableSelect(table)}
                                >
                                    <span className="table-icon">🪑</span>
                                    <span className="table-name">{table.name}</span>
                                    <span className="arrow">→</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="payment-details">
                    {!selectedTable ? (
                        <div className="no-selection">
                            <div className="placeholder-icon">💳</div>
                            <p>Vui lòng chọn bàn để xem chi tiết thanh toán</p>
                        </div>
                    ) : orderDetails ? (
                        <>
                            <div className="order-summary">
                                <h3>Chi tiết đơn hàng - {selectedTable.name}</h3>
                                <div className="items-list">
                                    {orderDetails.items && orderDetails.items.map(item => (
                                        <div key={item.id} className="summary-item">
                                            <div className="item-info">
                                                <span className="item-name">{item.menuItemName}</span>
                                                <span className="item-qty">x{item.quantity}</span>
                                            </div>
                                            <span className="item-price">
                                                {formatCurrency(item.subtotal)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="summary-totals">
                                    <div className="total-row final">
                                        <strong>Tổng cộng:</strong>
                                        <strong className="final-amount">
                                            {formatCurrency(orderDetails.totalAmount)}
                                        </strong>
                                    </div>
                                </div>
                            </div>

                            <div className="payment-method">
                                <h4>Phương thức thanh toán</h4>
                                <div className="method-options">
                                    <label className={`method-option ${paymentMethod === 'CASH' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="CASH"
                                            checked={paymentMethod === 'CASH'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="method-icon">💵</span>
                                        <span className="method-label">Tiền mặt</span>
                                    </label>
                                    <label className={`method-option ${paymentMethod === 'TRANSFER' ? 'selected' : ''}`}>
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="TRANSFER"
                                            checked={paymentMethod === 'TRANSFER'}
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                        />
                                        <span className="method-icon">💳</span>
                                        <span className="method-label">Mã QR / Chuyển khoản</span>
                                    </label>
                                </div>
                            </div>

                            <div className="payment-actions">
                                <button
                                    className="btn-print"
                                    onClick={handlePrintInvoice}
                                >
                                    🖨️ In hóa đơn
                                </button>
                                <button
                                    className="btn-pay"
                                    onClick={handlePaymentClick}
                                    disabled={processing || qrLoading}
                                >
                                    {processing ? 'Đang xử lý...' : qrLoading ? 'Đang tải QR...' : 'Thanh toán & Xuất hóa đơn'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="loading">Đang tải chi tiết...</div>
                    )}
                </div>
            </div>

            {/* QR Payment Modal */}
            {showQRModal && (
                <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
                    <div className="modal-content qr-modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Thanh toán qua Mã QR</h3>
                            <button className="close-btn" onClick={() => setShowQRModal(false)}>✕</button>
                        </div>
                        <div className="modal-body qr-body">
                            {qrData ? (
                                <div className="qr-container">
                                    <img
                                        src={`data:${qrData.imageType};base64,${qrData.imageData}`}
                                        alt="Store QR Code"
                                        className="qr-image"
                                    />
                                    <p className="qr-instruction">Vui lòng quét mã QR trên để thanh toán.</p>
                                    <p className="qr-amount">Số tiền: <strong>{orderDetails ? formatCurrency(orderDetails.totalAmount) : ''}</strong></p>
                                </div>
                            ) : (
                                <div className="no-qr">
                                    <p>Chưa có mã QR thanh toán nào được thiết lập cho cửa hàng này.</p>
                                </div>
                            )}
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowQRModal(false)}>Hủy</button>
                            <button
                                className="btn-primary"
                                onClick={processInvoiceCreation}
                                disabled={processing}
                            >
                                {processing ? 'Đang xác nhận...' : 'Đã thanh toán - Xuất Hóa Đơn'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CashierPayment;
