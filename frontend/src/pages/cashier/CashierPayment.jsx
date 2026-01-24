import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CashierPayment.css';

const CashierPayment = () => {
    const navigate = useNavigate();
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [orderDetails, setOrderDetails] = useState(null);
    const [paymentMethod, setPaymentMethod] = useState('CASH');
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    useEffect(() => {
        fetchTablesWithOrders();
    }, []);

    const fetchTablesWithOrders = async () => {
        try {
            // TODO: Replace with actual API call
            // Fetch tables with WAITING_PAYMENT status
            const mockTables = [
                { id: 3, name: 'Bàn 3', orderId: 2 },
                { id: 7, name: 'Bàn 7', orderId: 5 },
                { id: 10, name: 'Bàn 10', orderId: 8 }
            ];

            setTables(mockTables);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching tables:', error);
            setLoading(false);
        }
    };

    const fetchOrderDetails = async (orderId) => {
        try {
            // TODO: Replace with actual API call
            // const response = await fetch(`/api/orders/table/${tableId}`);
            // const data = await response.json();

            // Mock data
            const mockOrder = {
                id: orderId,
                items: [
                    { id: 1, name: 'Cà phê sữa', quantity: 2, price: 25000 },
                    { id: 2, name: 'Trà sữa', quantity: 1, price: 30000 },
                    { id: 3, name: 'Bánh ngọt', quantity: 3, price: 35000 }
                ],
                subtotal: 185000,
                tax: 18500,
                total: 203500
            };

            setOrderDetails(mockOrder);
        } catch (error) {
            console.error('Error fetching order details:', error);
        }
    };

    const handleTableSelect = (table) => {
        setSelectedTable(table);
        fetchOrderDetails(table.orderId);
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handlePayment = async () => {
        if (!selectedTable || !orderDetails) return;

        setProcessing(true);
        try {
            // TODO: Replace with actual API call
            // await fetch('/api/invoices', {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({
            //         orderId: orderDetails.id,
            //         paymentMethod: paymentMethod
            //     })
            // });

            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            alert(`Thanh toán thành công cho ${selectedTable.name}!`);

            // Reset state
            setSelectedTable(null);
            setOrderDetails(null);
            setPaymentMethod('CASH');

            // Refresh tables list
            fetchTablesWithOrders();
        } catch (error) {
            console.error('Error processing payment:', error);
            alert('Có lỗi xảy ra khi thanh toán!');
        } finally {
            setProcessing(false);
        }
    };

    const handlePrintInvoice = () => {
        // TODO: Implement print functionality
        window.print();
    };

    if (loading) {
        return <div className="loading">Đang tải...</div>;
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
                                    {orderDetails.items.map(item => (
                                        <div key={item.id} className="summary-item">
                                            <div className="item-info">
                                                <span className="item-name">{item.name}</span>
                                                <span className="item-qty">x{item.quantity}</span>
                                            </div>
                                            <span className="item-price">
                                                {formatCurrency(item.price * item.quantity)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="summary-totals">
                                    <div className="total-row">
                                        <span>Tạm tính:</span>
                                        <span>{formatCurrency(orderDetails.subtotal)}</span>
                                    </div>
                                    <div className="total-row">
                                        <span>Thuế (10%):</span>
                                        <span>{formatCurrency(orderDetails.tax)}</span>
                                    </div>
                                    <div className="total-row final">
                                        <strong>Tổng cộng:</strong>
                                        <strong className="final-amount">
                                            {formatCurrency(orderDetails.total)}
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
                                        <span className="method-label">Chuyển khoản</span>
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
                                    onClick={handlePayment}
                                    disabled={processing}
                                >
                                    {processing ? 'Đang xử lý...' : '✓ Xác nhận thanh toán'}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="loading">Đang tải chi tiết...</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default CashierPayment;
