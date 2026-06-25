// src/pages/admin/Reports/components/OrderReport.jsx
import { useState } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { 
    FiShoppingCart, 
    FiClock, 
    FiCheckCircle, 
    FiXCircle, 
    FiTruck,
    FiTable,
    FiFileText,
    FiFile,
    FiCalendar,
    FiPieChart,
    FiActivity
} from "react-icons/fi";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STATUS_COLORS = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    shipping: "#06b6d4",
    completed: "#10b981",
    cancelled: "#ef4444",
    return_requested: "#8b5cf6"
};

const STATUS_LABELS = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    return_requested: "Yêu cầu hoàn trả"
};

const STATUS_ORDER = ["pending", "confirmed", "shipping", "completed", "cancelled", "return_requested"];

function OrderReport({ data, loading, dateRange }) {
    const [viewMode, setViewMode] = useState('chart'); // 'chart' | 'table'
    const [exporting, setExporting] = useState(false);

    if (loading) {
        return (
            <div className="report-card">
                <div className="skeleton-loader">
                    <div className="skeleton-title"></div>
                    <div className="skeleton-chart"></div>
                </div>
            </div>
        );
    }
    
    if (!data) return null;
    
    const {
        orders_by_status = [],
        orders_by_date = [],
        total_orders = 0,
        average_order_value = 0,
        summary = {}
    } = data;
    
    const {
        pending = 0,
        confirmed = 0,
        shipping = 0,
        completed = 0,
        cancelled = 0,
        returned = 0
    } = summary;
    
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value || 0);
    };
    
    const formatNumber = (value) => {
        return new Intl.NumberFormat("vi-VN").format(value || 0);
    };
    
    // Sắp xếp dữ liệu theo thứ tự
    const sortedStatusData = [...orders_by_status].sort((a, b) => {
        return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    });
    
    // Chuẩn bị dữ liệu cho pie chart
    const pieData = sortedStatusData.map(item => ({
        name: STATUS_LABELS[item.status] || item.status,
        value: item.count,
        status: item.status
    }));

    // Hàm xuất Excel
    const exportToExcel = () => {
        try {
            setExporting(true);
            
            const wb = XLSX.utils.book_new();
            
            // Sheet 1: Tổng quan
            const summaryData = [
                ['BÁO CÁO ĐƠN HÀNG'],
                [`Kỳ báo cáo: ${dateRange?.startDate?.toLocaleDateString("vi-VN") || ''} - ${dateRange?.endDate?.toLocaleDateString("vi-VN") || ''}`],
                [],
                ['Chỉ tiêu', 'Giá trị'],
                ['Tổng đơn hàng', total_orders],
                ['Đơn chờ xác nhận', pending],
                ['Đã xác nhận', confirmed],
                ['Đang giao hàng', shipping],
                ['Hoàn thành', completed],
                ['Đã hủy', cancelled],
                ['Yêu cầu hoàn trả', returned],
                ['Giá trị đơn hàng TB', average_order_value],
            ];
            const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');
            
            // Sheet 2: Đơn hàng theo ngày
            if (orders_by_date.length > 0) {
                const dailyData = [
                    ['Ngày', 'Số đơn hàng'],
                    ...orders_by_date.map(item => [item.date, item.count])
                ];
                const ws2 = XLSX.utils.aoa_to_sheet(dailyData);
                XLSX.utils.book_append_sheet(wb, ws2, 'Đơn hàng theo ngày');
            }
            
            // Sheet 3: Đơn hàng theo trạng thái
            if (sortedStatusData.length > 0) {
                const statusData = [
                    ['Trạng thái', 'Số lượng', 'Doanh thu', 'Tỷ lệ (%)'],
                    ...sortedStatusData.map(item => {
                        const percent = total_orders > 0 ? (item.count / total_orders * 100).toFixed(1) : 0;
                        return [
                            STATUS_LABELS[item.status] || item.status,
                            item.count,
                            item.revenue || 0,
                            percent
                        ];
                    })
                ];
                const ws3 = XLSX.utils.aoa_to_sheet(statusData);
                XLSX.utils.book_append_sheet(wb, ws3, 'Đơn hàng theo trạng thái');
            }
            
            const fileName = `Bao_cao_don_hang_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
            
            setExporting(false);
        } catch (error) {
            console.error('Lỗi xuất Excel:', error);
            setExporting(false);
            alert('Có lỗi xảy ra khi xuất file Excel');
        }
    };

    // Hàm xuất PDF
    const exportToPDF = () => {
        try {
            setExporting(true);
            
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            
            // Header
            doc.setFontSize(20);
            doc.setTextColor(59, 130, 246);
            doc.text('BÁO CÁO ĐƠN HÀNG', pageWidth / 2, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setTextColor(100, 116, 139);
            doc.text(
                `Kỳ báo cáo: ${dateRange?.startDate?.toLocaleDateString("vi-VN") || ''} - ${dateRange?.endDate?.toLocaleDateString("vi-VN") || ''}`,
                pageWidth / 2,
                30,
                { align: 'center' }
            );
            
            // Thông tin tổng quan
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text('THỐNG KÊ TỔNG QUAN', 14, 45);
            
            const summaryData = [
                ['Chỉ tiêu', 'Giá trị'],
                ['Tổng đơn hàng', formatNumber(total_orders)],
                ['Đơn chờ xác nhận', formatNumber(pending)],
                ['Đã xác nhận', formatNumber(confirmed)],
                ['Đang giao hàng', formatNumber(shipping)],
                ['Hoàn thành', formatNumber(completed)],
                ['Đã hủy', formatNumber(cancelled)],
                ['Yêu cầu hoàn trả', formatNumber(returned)],
                ['Giá trị đơn hàng TB', formatCurrency(average_order_value)],
            ];
            
            autoTable(doc, {
                startY: 50,
                head: [summaryData[0]],
                body: summaryData.slice(1),
                theme: 'grid',
                headStyles: { fillColor: [59, 130, 246] },
                styles: { fontSize: 9 },
                margin: { left: 14, right: 14 },
            });
            
            let finalY = doc.lastAutoTable.finalY + 15;
            
            // 1. Đơn hàng theo ngày
            if (orders_by_date.length > 0) {
                if (finalY > 230) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('1. ĐƠN HÀNG THEO NGÀY', 14, finalY);
                
                const dailyData = [
                    ['Ngày', 'Số đơn hàng'],
                    ...orders_by_date.slice(0, 20).map(item => [item.date, item.count])
                ];
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [dailyData[0]],
                    body: dailyData.slice(1),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] },
                    styles: { fontSize: 8 },
                    margin: { left: 14, right: 14 },
                });
                
                if (orders_by_date.length > 20) {
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(`* Hiển thị 20/ ${orders_by_date.length} ngày`, 14, doc.lastAutoTable.finalY + 5);
                    finalY = doc.lastAutoTable.finalY + 10;
                } else {
                    finalY = doc.lastAutoTable.finalY + 10;
                }
            }
            
            // 2. Đơn hàng theo trạng thái
            if (sortedStatusData.length > 0) {
                if (finalY > 230) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('2. ĐƠN HÀNG THEO TRẠNG THÁI', 14, finalY);
                
                const statusData = [
                    ['Trạng thái', 'Số lượng', 'Doanh thu', 'Tỷ lệ (%)'],
                    ...sortedStatusData.map(item => {
                        const percent = total_orders > 0 ? (item.count / total_orders * 100).toFixed(1) : 0;
                        return [
                            STATUS_LABELS[item.status] || item.status,
                            item.count,
                            formatCurrency(item.revenue || 0),
                            `${percent}%`
                        ];
                    })
                ];
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [statusData[0]],
                    body: statusData.slice(1),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] },
                    styles: { fontSize: 9 },
                    margin: { left: 14, right: 14 },
                });
                
                finalY = doc.lastAutoTable.finalY + 10;
            }
            
            // Footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.setTextColor(148, 163, 184);
                doc.text(
                    `Trang ${i}/${pageCount} - Xuất ngày ${new Date().toLocaleString("vi-VN")}`,
                    pageWidth / 2,
                    doc.internal.pageSize.getHeight() - 10,
                    { align: 'center' }
                );
            }
            
            doc.save(`Bao_cao_don_hang_${new Date().toISOString().split('T')[0]}.pdf`);
            
            setExporting(false);
        } catch (error) {
            console.error('Lỗi xuất PDF:', error);
            setExporting(false);
            alert('Có lỗi xảy ra khi xuất file PDF');
        }
    };

    // Component hiển thị bảng dữ liệu
    const TableView = () => {
        return (
            <div className="table-container">
                <div className="table-toolbar">
                    <div className="table-actions">
                        <button 
                            className="export-btn excel" 
                            onClick={exportToExcel}
                            disabled={exporting}
                        >
                            <FiFile /> Xuất Excel
                        </button>
                        <button 
                            className="export-btn pdf" 
                            onClick={exportToPDF}
                            disabled={exporting}
                        >
                            <FiFileText /> Xuất PDF
                        </button>
                    </div>
                </div>
                
                {/* Bảng 1: Đơn hàng theo ngày */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiCalendar /> Đơn hàng theo ngày
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Ngày</th>
                                    <th className="text-center">Số đơn hàng</th>
                                    <th className="text-center">Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orders_by_date.length > 0 ? (
                                    orders_by_date.map((item, index) => {
                                        const percent = total_orders > 0 
                                            ? (item.count / total_orders * 100).toFixed(1) 
                                            : 0;
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.date}</td>
                                                <td className="text-center">{formatNumber(item.count)}</td>
                                                <td className="text-center">
                                                    <span className="percent-badge">{percent}%</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">Không có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="total-row">
                                    <td colSpan="2"><strong>Tổng cộng</strong></td>
                                    <td className="text-center"><strong>{formatNumber(total_orders)}</strong></td>
                                    <td className="text-center"><strong>100%</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Bảng 2: Đơn hàng theo trạng thái */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiPieChart /> Đơn hàng theo trạng thái
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Trạng thái</th>
                                    <th className="text-center">Số lượng</th>
                                    <th className="text-right">Doanh thu</th>
                                    <th className="text-center">Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedStatusData.length > 0 ? (
                                    sortedStatusData.map((item, index) => {
                                        const percent = total_orders > 0 
                                            ? (item.count / total_orders * 100).toFixed(1) 
                                            : 0;
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <span 
                                                        className="status-badge" 
                                                        style={{ backgroundColor: STATUS_COLORS[item.status] }}
                                                    >
                                                        {STATUS_LABELS[item.status] || item.status}
                                                    </span>
                                                </td>
                                                <td className="text-center">{formatNumber(item.count)}</td>
                                                <td className="text-right">{formatCurrency(item.revenue || 0)}</td>
                                                <td className="text-center">
                                                    <span className="percent-badge">{percent}%</span>
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">Không có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="total-row">
                                    <td colSpan="2"><strong>Tổng cộng</strong></td>
                                    <td className="text-center"><strong>{formatNumber(total_orders)}</strong></td>
                                    <td className="text-right">
                                        <strong>
                                            {formatCurrency(sortedStatusData.reduce((sum, item) => sum + (item.revenue || 0), 0))}
                                        </strong>
                                    </td>
                                    <td className="text-center"><strong>100%</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Bảng 3: Thông tin xử lý */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiActivity /> Thông tin xử lý đơn hàng
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Chỉ tiêu</th>
                                    <th className="text-center">Giá trị</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>Giá trị đơn hàng trung bình</td>
                                    <td className="text-center">{formatCurrency(average_order_value)}</td>
                                </tr>
                                <tr>
                                    <td>Tỷ lệ đơn hoàn thành</td>
                                    <td className="text-center">
                                        {total_orders > 0 ? ((completed / total_orders) * 100).toFixed(1) : 0}%
                                    </td>
                                </tr>
                                <tr>
                                    <td>Tỷ lệ đơn hủy</td>
                                    <td className="text-center">
                                        {total_orders > 0 ? ((cancelled / total_orders) * 100).toFixed(1) : 0}%
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };
    
    // 4 thẻ thống kê
    const statCards = [
        {
            title: "Tổng đơn hàng",
            value: formatNumber(total_orders),
            icon: <FiShoppingCart />,
            color: "#3b82f6",
            bgColor: "#eff6ff"
        },
        {
            title: "Đã xác nhận",
            value: formatNumber(confirmed),
            icon: <FiCheckCircle />,
            color: "#3b82f6",
            bgColor: "#eff6ff"
        },
        {
            title: "Đang giao hàng",
            value: formatNumber(shipping),
            icon: <FiTruck />,
            color: "#06b6d4",
            bgColor: "#ecfeff"
        },
        {
            title: "Giao thành công",
            value: formatNumber(completed),
            icon: <FiCheckCircle />,
            color: "#10b981",
            bgColor: "#ecfdf5"
        }
    ];
    
    return (
        <div className="report-card">
            <div className="report-header">
                <div>
                    <h2 className="report-title">
                        <FiShoppingCart className="report-icon" />
                        Báo cáo đơn hàng
                    </h2>
                    <p className="report-subtitle">
                        Thống kê số lượng đơn hàng, trạng thái và hiệu suất xử lý
                    </p>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button 
                            className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
                            onClick={() => setViewMode('chart')}
                        >
                            <FiShoppingCart /> Biểu đồ
                        </button>
                        <button 
                            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                        >
                            <FiTable /> Bảng
                        </button>
                    </div>
                    <div className="stats-mini">
                        <div className="stat-badge">
                            <span>Giá trị đơn TB</span>
                            <strong>{formatCurrency(average_order_value)}</strong>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 4 thẻ thống kê */}
            <div className="stats-mini-grid">
                {statCards.map((card, idx) => (
                    <div key={idx} className="stat-mini-card" style={{ backgroundColor: card.bgColor }}>
                        <div className="stat-mini-icon" style={{ color: card.color }}>
                            {card.icon}
                        </div>
                        <div className="stat-mini-info">
                            <span className="stat-mini-label">{card.title}</span>
                            <span className="stat-mini-value" style={{ color: card.color }}>
                                {card.value}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Hiển thị biểu đồ hoặc bảng */}
            {viewMode === 'chart' ? (
                <>
                    {/* Biểu đồ 1: Đơn hàng theo ngày */}
                    <div className="chart-container">
                        <h3>
                            <FiCalendar /> Đơn hàng theo ngày
                        </h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart data={orders_by_date}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip 
                                    formatter={(value) => [value, "Đơn hàng"]}
                                    labelFormatter={(label) => `Ngày ${label}`}
                                />
                                <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Số đơn hàng" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* 2 cột: Phân bố trạng thái và Thông tin thêm */}
                    <div className="two-columns">
                        <div className="chart-container">
                            <h3>
                                <FiPieChart /> Phân bố theo trạng thái
                            </h3>
                            {pieData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ name, value }) => `${name}: ${value}`}
                                            labelLine={true}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell 
                                                    key={`cell-${index}`} 
                                                    fill={STATUS_COLORS[entry.status] || "#94a3b8"} 
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [value, "Đơn hàng"]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-chart">Không có dữ liệu</div>
                            )}
                        </div>
                        
                        <div className="chart-container">
                            <h3>
                                <FiActivity className="inline-icon" />
                                Thông tin xử lý đơn hàng
                            </h3>
                            <div className="processing-time-card">
                                <div className="time-item">
                                    <div className="time-icon">💰</div>
                                    <div className="time-info">
                                        <span className="time-label">Giá trị đơn hàng trung bình</span>
                                        <span className="time-value">
                                            {formatCurrency(average_order_value)}
                                        </span>
                                        <span className="time-desc">
                                            Giá trị trung bình mỗi đơn hàng
                                        </span>
                                    </div>
                                </div>
                                <div className="time-stats">
                                    <div className="time-stat-item">
                                        <span className="stat-label">Tỷ lệ hoàn thành</span>
                                        <span className="stat-value">
                                            {total_orders > 0 ? ((completed / total_orders) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                    <div className="time-stat-item">
                                        <span className="stat-label">Tỷ lệ hủy</span>
                                        <span className="stat-value">
                                            {total_orders > 0 ? ((cancelled / total_orders) * 100).toFixed(1) : 0}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <TableView />
            )}
            
            <style jsx>{`
                .report-card {
                    background: white;
                    border-radius: 20px;
                    padding: 24px;
                    margin-bottom: 24px;
                    box-shadow: 0 1px 3px rgba(0,0,0,0.1);
                }
                
                .report-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 16px;
                }
                
                .header-actions {
                    display: flex;
                    align-items: flex-start;
                    gap: 20px;
                    flex-wrap: wrap;
                }
                
                .view-toggle {
                    display: flex;
                    gap: 4px;
                    background: #f1f5f9;
                    padding: 4px;
                    border-radius: 12px;
                    margin-top: 4px;
                }
                
                .view-btn {
                    padding: 8px 16px;
                    border: none;
                    background: transparent;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 13px;
                    font-weight: 500;
                    color: #64748b;
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    transition: all 0.3s ease;
                }
                
                .view-btn:hover {
                    color: #0f172a;
                }
                
                .view-btn.active {
                    background: white;
                    color: #3b82f6;
                    box-shadow: 0 2px 8px rgba(59, 130, 246, 0.15);
                }
                
                .view-btn svg {
                    font-size: 16px;
                }
                
                .report-title {
                    font-size: 20px;
                    font-weight: 700;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .report-icon {
                    color: #3b82f6;
                }
                
                .report-subtitle {
                    color: #64748b;
                    font-size: 13px;
                    margin-top: 4px;
                }
                
                .stats-mini {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }
                
                .stat-badge {
                    background: #f8fafc;
                    padding: 8px 16px;
                    border-radius: 12px;
                    text-align: center;
                    min-width: 120px;
                }
                
                .stat-badge span {
                    font-size: 12px;
                    color: #64748b;
                    display: block;
                }
                
                .stat-badge strong {
                    font-size: 16px;
                    color: #0f172a;
                }
                
                .stats-mini-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .stat-mini-card {
                    border-radius: 16px;
                    padding: 16px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    transition: all 0.3s ease;
                }
                
                .stat-mini-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                
                .stat-mini-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                }
                
                .stat-mini-info {
                    flex: 1;
                }
                
                .stat-mini-label {
                    font-size: 12px;
                    color: #64748b;
                    display: block;
                    margin-bottom: 4px;
                }
                
                .stat-mini-value {
                    font-size: 20px;
                    font-weight: 700;
                }
                
                .chart-container {
                    margin-bottom: 32px;
                }
                
                .chart-container h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #0f172a;
                    margin-bottom: 16px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .chart-container h3 svg {
                    color: #3b82f6;
                }
                
                .two-columns {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }
                
                .processing-time-card {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 20px;
                    height: 300px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                
                .time-item {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 20px;
                }
                
                .time-icon {
                    font-size: 48px;
                }
                
                .time-info {
                    flex: 1;
                }
                
                .time-label {
                    font-size: 14px;
                    color: #64748b;
                    display: block;
                    margin-bottom: 4px;
                }
                
                .time-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #0f172a;
                    display: block;
                }
                
                .time-desc {
                    font-size: 11px;
                    color: #94a3b8;
                    display: block;
                    margin-top: 4px;
                }
                
                .time-stats {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 12px;
                }
                
                .time-stat-item {
                    background: white;
                    padding: 12px;
                    border-radius: 8px;
                    text-align: center;
                }
                
                .time-stat-item .stat-label {
                    display: block;
                    font-size: 11px;
                    color: #64748b;
                }
                
                .time-stat-item .stat-value {
                    display: block;
                    font-size: 18px;
                    font-weight: 700;
                    color: #0f172a;
                    margin-top: 4px;
                }
                
                .table-container {
                    margin-top: 24px;
                }
                
                .table-toolbar {
                    display: flex;
                    justify-content: flex-end;
                    margin-bottom: 20px;
                }
                
                .table-actions {
                    display: flex;
                    gap: 12px;
                }
                
                .export-btn {
                    padding: 10px 24px;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: all 0.3s ease;
                }
                
                .export-btn:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                
                .export-btn.excel {
                    background: #e8f5e9;
                    color: #2e7d32;
                }
                
                .export-btn.excel:hover:not(:disabled) {
                    background: #c8e6c9;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(46, 125, 50, 0.2);
                }
                
                .export-btn.pdf {
                    background: #fce4ec;
                    color: #c62828;
                }
                
                .export-btn.pdf:hover:not(:disabled) {
                    background: #f8bbd0;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(198, 40, 40, 0.2);
                }
                
                .table-section {
                    margin-bottom: 32px;
                }
                
                .table-title {
                    font-size: 16px;
                    font-weight: 600;
                    color: #0f172a;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }
                
                .table-title svg {
                    color: #3b82f6;
                }
                
                .table-responsive {
                    overflow-x: auto;
                    border-radius: 12px;
                    border: 1px solid #e2e8f0;
                }
                
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                    font-size: 14px;
                }
                
                .data-table thead {
                    background: #f8fafc;
                }
                
                .data-table th {
                    padding: 12px 16px;
                    text-align: left;
                    font-weight: 600;
                    color: #475569;
                    border-bottom: 2px solid #e2e8f0;
                    white-space: nowrap;
                }
                
                .data-table td {
                    padding: 12px 16px;
                    border-bottom: 1px solid #e2e8f0;
                    color: #0f172a;
                }
                
                .data-table tbody tr:hover {
                    background: #f8fafc;
                }
                
                .data-table tbody tr:last-child td {
                    border-bottom: none;
                }
                
                .text-right {
                    text-align: right;
                }
                
                .text-center {
                    text-align: center;
                }
                
                .percent-badge {
                    display: inline-block;
                    padding: 2px 12px;
                    background: #dbeafe;
                    color: #3b82f6;
                    border-radius: 12px;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .total-row {
                    background: #f1f5f9;
                    font-weight: 600;
                }
                
                .total-row td {
                    padding: 12px 16px;
                    border-top: 2px solid #cbd5e1;
                    border-bottom: none;
                }
                
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    color: white;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .empty-chart {
                    height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    background: #f8fafc;
                    border-radius: 12px;
                }
                
                .inline-icon {
                    display: inline;
                    margin-right: 4px;
                }
                
                .skeleton-loader {
                    animation: pulse 1.5s ease-in-out infinite;
                }
                
                .skeleton-title {
                    height: 24px;
                    background: #e2e8f0;
                    border-radius: 8px;
                    margin-bottom: 16px;
                    width: 200px;
                }
                
                .skeleton-chart {
                    height: 300px;
                    background: #e2e8f0;
                    border-radius: 8px;
                }
                
                @keyframes pulse {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0.5; }
                }
                
                @media (max-width: 1024px) {
                    .two-columns {
                        grid-template-columns: 1fr;
                    }
                    .stats-mini-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .header-actions {
                        width: 100%;
                        flex-direction: column;
                        align-items: stretch;
                    }
                    .stats-mini {
                        justify-content: space-between;
                    }
                }
                
                @media (max-width: 640px) {
                    .stats-mini-grid {
                        grid-template-columns: 1fr;
                    }
                    .report-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .view-toggle {
                        width: 100%;
                    }
                    .view-btn {
                        flex: 1;
                        justify-content: center;
                    }
                    .stats-mini {
                        flex-direction: column;
                    }
                    .stat-badge {
                        width: 100%;
                    }
                    .table-actions {
                        flex-direction: column;
                        width: 100%;
                    }
                    .export-btn {
                        justify-content: center;
                    }
                    .time-stats {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>
        </div>
    );
}

export default OrderReport;