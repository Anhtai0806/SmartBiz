import React, { useState } from 'react';
import Button from '../../components/Button';
import './OwnerReports.css';

const OwnerReports = () => {
    const [dateRange, setDateRange] = useState('thisMonth');
    const [reportType, setReportType] = useState('revenue');

    const revenueData = {
        thisMonth: { total: 125000000, orders: 450, avgOrder: 277778 },
        lastMonth: { total: 98000000, orders: 380, avgOrder: 257895 },
        thisYear: { total: 1250000000, orders: 5200, avgOrder: 240385 }
    };

    const topProducts = [
        { id: 1, name: 'Cà phê đen', sold: 320, revenue: 8000000 },
        { id: 2, name: 'Trà sữa', sold: 280, revenue: 9800000 },
        { id: 3, name: 'Bánh mì', sold: 250, revenue: 3750000 },
        { id: 4, name: 'Nước ngọt', sold: 200, revenue: 2400000 }
    ];

    const storePerformance = [
        { id: 1, name: 'Chi nhánh Quận 1', revenue: 55000000, orders: 200 },
        { id: 2, name: 'Chi nhánh Quận 3', revenue: 45000000, orders: 150 },
        { id: 3, name: 'Chi nhánh Thủ Đức', revenue: 25000000, orders: 100 }
    ];

    const staffPerformance = [
        { id: 1, name: 'Nguyễn Văn A', orders: 85, revenue: 23750000, rating: 4.8 },
        { id: 2, name: 'Trần Thị B', orders: 72, revenue: 20160000, rating: 4.6 },
        { id: 3, name: 'Lê Văn C', orders: 65, revenue: 18200000, rating: 4.5 }
    ];

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handleExport = (format) => {
        // TODO: Implement export functionality
        alert(`Xuất báo cáo dạng ${format.toUpperCase()}`);
    };

    const currentData = revenueData[dateRange];

    return (
        <div className="owner-reports">
            <div className="page-header">
                <div>
                    <h1>Báo cáo & Phân tích</h1>
                    <p>Xem báo cáo chi tiết về doanh thu và hiệu suất</p>
                </div>
                <div className="export-buttons">
                    <Button variant="outline" onClick={() => handleExport('pdf')}>
                        📄 Xuất PDF
                    </Button>
                    <Button variant="outline" onClick={() => handleExport('excel')}>
                        📊 Xuất Excel
                    </Button>
                </div>
            </div>

            <div className="report-filters">
                <div className="filter-group">
                    <label>Khoảng thời gian:</label>
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
                        <option value="thisMonth">Tháng này</option>
                        <option value="lastMonth">Tháng trước</option>
                        <option value="thisYear">Năm nay</option>
                    </select>
                </div>
                <div className="filter-group">
                    <label>Loại báo cáo:</label>
                    <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
                        <option value="revenue">Doanh thu</option>
                        <option value="products">Sản phẩm</option>
                        <option value="stores">Chi nhánh</option>
                        <option value="staff">Nhân viên</option>
                    </select>
                </div>
            </div>

            {reportType === 'revenue' && (
                <div className="report-section">
                    <h2>Báo cáo Doanh thu</h2>
                    <div className="revenue-cards">
                        <div className="revenue-card">
                            <div className="card-icon">💰</div>
                            <div className="card-content">
                                <h3>Tổng doanh thu</h3>
                                <p className="amount">{formatCurrency(currentData.total)}</p>
                            </div>
                        </div>
                        <div className="revenue-card">
                            <div className="card-icon">📦</div>
                            <div className="card-content">
                                <h3>Tổng đơn hàng</h3>
                                <p className="amount">{currentData.orders}</p>
                            </div>
                        </div>
                        <div className="revenue-card">
                            <div className="card-icon">📊</div>
                            <div className="card-content">
                                <h3>Giá trị TB/đơn</h3>
                                <p className="amount">{formatCurrency(currentData.avgOrder)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="chart-container">
                        <h3>Biểu đồ doanh thu theo thời gian</h3>
                        <div className="chart-placeholder">
                            <p>📈 Biểu đồ line chart sẽ được hiển thị ở đây</p>
                            <small>Tích hợp với Chart.js hoặc Recharts</small>
                        </div>
                    </div>
                </div>
            )}

            {reportType === 'products' && (
                <div className="report-section">
                    <h2>Sản phẩm bán chạy</h2>
                    <div className="products-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Xếp hạng</th>
                                    <th>Sản phẩm</th>
                                    <th>Số lượng bán</th>
                                    <th>Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {topProducts.map((product, index) => (
                                    <tr key={product.id}>
                                        <td className="rank">#{index + 1}</td>
                                        <td className="product-name">{product.name}</td>
                                        <td>{product.sold}</td>
                                        <td className="revenue">{formatCurrency(product.revenue)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {reportType === 'stores' && (
                <div className="report-section">
                    <h2>Hiệu suất Chi nhánh</h2>
                    <div className="stores-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Chi nhánh</th>
                                    <th>Doanh thu</th>
                                    <th>Số đơn hàng</th>
                                    <th>Doanh thu TB/đơn</th>
                                </tr>
                            </thead>
                            <tbody>
                                {storePerformance.map(store => (
                                    <tr key={store.id}>
                                        <td className="store-name">{store.name}</td>
                                        <td className="revenue">{formatCurrency(store.revenue)}</td>
                                        <td>{store.orders}</td>
                                        <td>{formatCurrency(store.revenue / store.orders)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {reportType === 'staff' && (
                <div className="report-section">
                    <h2>Hiệu suất Nhân viên</h2>
                    <div className="staff-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nhân viên</th>
                                    <th>Số đơn hàng</th>
                                    <th>Doanh thu</th>
                                    <th>Đánh giá</th>
                                </tr>
                            </thead>
                            <tbody>
                                {staffPerformance.map(staff => (
                                    <tr key={staff.id}>
                                        <td className="staff-name">{staff.name}</td>
                                        <td>{staff.orders}</td>
                                        <td className="revenue">{formatCurrency(staff.revenue)}</td>
                                        <td>
                                            <span className="rating">⭐ {staff.rating}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OwnerReports;
