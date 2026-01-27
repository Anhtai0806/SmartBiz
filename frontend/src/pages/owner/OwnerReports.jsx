import React, { useState, useEffect, useCallback } from 'react';
import Button from '../../components/Button';
import { getRevenueReport, getTopProducts, getStoreComparison, getAllStores } from '../../api/businessOwnerApi';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import './OwnerReports.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const OwnerReports = () => {
    const [dateRange, setDateRange] = useState('thisMonth');
    const [reportType, setReportType] = useState('revenue');
    const [loading, setLoading] = useState(false);
    const [stores, setStores] = useState([]);
    const [selectedStore, setSelectedStore] = useState(''); // '' means all stores

    const [revenueData, setRevenueData] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [storePerformance, setStorePerformance] = useState([]);

    // Derived state for summary cards
    const [summary, setSummary] = useState({ total: 0, orders: 0, avgOrder: 0 });

    useEffect(() => {
        const fetchStores = async () => {
            try {
                const data = await getAllStores();
                setStores(data);
            } catch (error) {
                console.error("Error fetching stores:", error);
            }
        };
        fetchStores();
    }, []);

    const getDateRangeParams = useCallback(() => {
        const now = new Date();
        let startDate = new Date();
        let endDate = new Date();

        if (dateRange === 'thisMonth') {
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0); // Last day of month
        } else if (dateRange === 'lastMonth') {
            startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        } else if (dateRange === 'thisYear') {
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = new Date(now.getFullYear(), 11, 31);
        }

        const formatDate = (date) => date.toISOString();

        return { startDate: formatDate(startDate), endDate: formatDate(endDate) };
    }, [dateRange]);

    const fetchData = useCallback(async () => {
        setLoading(true);
        const { startDate, endDate } = getDateRangeParams();
        const storeId = selectedStore || null;

        try {
            if (reportType === 'revenue') {
                const data = await getRevenueReport(startDate, endDate, storeId);
                setRevenueData(data);

                const totalRevenue = data.reduce((acc, curr) => acc + curr.revenue, 0);
                const totalOrders = data.reduce((acc, curr) => acc + curr.orderCount, 0);
                setSummary({
                    total: totalRevenue,
                    orders: totalOrders,
                    avgOrder: totalOrders > 0 ? totalRevenue / totalOrders : 0
                });
            } else if (reportType === 'products') {
                const data = await getTopProducts(startDate, endDate, 10, storeId);
                setTopProducts(data);
            } else if (reportType === 'stores') {
                const data = await getStoreComparison(startDate, endDate);
                setStorePerformance(data);
            }
        } catch (error) {
            console.error("Error fetching reports:", error);
        } finally {
            setLoading(false);
        }
    }, [getDateRangeParams, reportType, selectedStore]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(amount);
    };

    const handleExport = (format) => {
        if (format === 'pdf') {
            exportToPDF();
        } else if (format === 'excel') {
            exportToExcel();
        }
    };

    const exportToPDF = () => {
        const doc = new jsPDF();
        doc.text(`Báo cáo ${reportType === 'revenue' ? 'Doanh thu' : reportType === 'products' ? 'Sản phẩm' : 'Chi nhánh'}`, 14, 15);

        let tableColumn = [];
        let tableRows = [];

        if (reportType === 'revenue') {
            tableColumn = ["Ngày", "Số đơn hàng", "Doanh thu"];
            revenueData.forEach(item => {
                tableRows.push([item.date, item.orderCount, formatCurrency(item.revenue)]);
            });
        } else if (reportType === 'products') {
            tableColumn = ["Sản phẩm", "Số lượng bán", "Doanh thu"];
            topProducts.forEach(item => {
                tableRows.push([item.name, item.quantitySold, formatCurrency(item.revenue)]);
            });
        } else if (reportType === 'stores') {
            tableColumn = ["Cửa hàng", "Số đơn hàng", "Doanh thu"];
            storePerformance.forEach(item => {
                tableRows.push([item.storeName, item.orderCount, formatCurrency(item.revenue)]);
            });
        }

        doc.autoTable({
            head: [tableColumn],
            body: tableRows,
            startY: 20
        });

        doc.save(`report_${reportType}_${new Date().getTime()}.pdf`);
    };

    const exportToExcel = () => {
        let dataToExport = [];
        if (reportType === 'revenue') {
            dataToExport = revenueData.map(item => ({
                Date: item.date,
                Orders: item.orderCount,
                Revenue: item.revenue
            }));
        } else if (reportType === 'products') {
            dataToExport = topProducts.map(item => ({
                Product: item.name,
                Sold: item.quantitySold,
                Revenue: item.revenue
            }));
        } else if (reportType === 'stores') {
            dataToExport = storePerformance.map(item => ({
                Store: item.storeName,
                Orders: item.orderCount,
                Revenue: item.revenue
            }));
        }

        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(dataToExport);
        XLSX.utils.book_append_sheet(wb, ws, "Report");
        XLSX.writeFile(wb, `report_${reportType}.xlsx`);
    };

    // Chart Data Preparation
    const lineChartData = {
        labels: revenueData.map(d => d.date),
        datasets: [
            {
                label: 'Doanh thu',
                data: revenueData.map(d => d.revenue),
                borderColor: 'rgb(53, 162, 235)',
                backgroundColor: 'rgba(53, 162, 235, 0.5)',
            },
        ],
    };

    const barChartData = {
        labels: storePerformance.map(d => d.storeName),
        datasets: [
            {
                label: 'Doanh thu',
                data: storePerformance.map(d => d.revenue),
                backgroundColor: 'rgba(75, 192, 192, 0.5)',
            }
        ]
    };

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
                    <label>Chi nhánh:</label>
                    <select value={selectedStore} onChange={(e) => setSelectedStore(e.target.value)}>
                        <option value="">Tất cả chi nhánh</option>
                        {stores.map(store => (
                            <option key={store.id} value={store.id}>{store.name}</option>
                        ))}
                    </select>
                </div>
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
                        {selectedStore === '' && <option value="stores">Chi nhánh</option>}
                    </select>
                </div>
            </div>

            {loading ? <div className="loading">Đang tải dữ liệu...</div> : (
                <>
                    {reportType === 'revenue' && (
                        <div className="report-section">
                            <h2>Báo cáo Doanh thu</h2>
                            <div className="revenue-cards">
                                <div className="revenue-card">
                                    <div className="card-icon">💰</div>
                                    <div className="card-content">
                                        <h3>Tổng doanh thu</h3>
                                        <p className="amount">{formatCurrency(summary.total)}</p>
                                    </div>
                                </div>
                                <div className="revenue-card">
                                    <div className="card-icon">📦</div>
                                    <div className="card-content">
                                        <h3>Tổng đơn hàng</h3>
                                        <p className="amount">{summary.orders}</p>
                                    </div>
                                </div>
                                <div className="revenue-card">
                                    <div className="card-icon">📊</div>
                                    <div className="card-content">
                                        <h3>Giá trị TB/đơn</h3>
                                        <p className="amount">{formatCurrency(summary.avgOrder)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="chart-container" style={{ height: '400px', marginTop: '20px' }}>
                                <h3>Biểu đồ doanh thu theo thời gian</h3>
                                <Line options={{ responsive: true, maintainAspectRatio: false }} data={lineChartData} />
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
                                                <td>{product.quantitySold}</td>
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
                            <div className="chart-container" style={{ height: '300px', marginBottom: '20px' }}>
                                <Bar options={{ responsive: true, maintainAspectRatio: false }} data={barChartData} />
                            </div>
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
                                            <tr key={store.storeId}>
                                                <td className="store-name">{store.storeName}</td>
                                                <td className="revenue">{formatCurrency(store.revenue)}</td>
                                                <td>{store.orderCount}</td>
                                                <td>{formatCurrency(store.averageOrderValue)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default OwnerReports;
