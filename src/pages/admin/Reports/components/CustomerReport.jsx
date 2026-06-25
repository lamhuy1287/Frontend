// src/pages/admin/Reports/components/CustomerReport.jsx
import { useState } from "react";
import {
    LineChart,
    Line,
    AreaChart,
    Area,
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
    FiUsers, 
    FiUserPlus, 
    FiUserCheck, 
    FiTrendingUp, 
    FiDollarSign, 
    FiShoppingCart,
    FiTable,
    FiFileText,
    FiFile,
    FiCalendar,
    FiPieChart,
    FiAward
} from "react-icons/fi";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const SEGMENT_COLORS = {
    vip: "#f59e0b",
    regular: "#3b82f6",
    new: "#10b981"
};

const SEGMENT_LABELS = {
    vip: "VIP (>10tr)",
    regular: "Thường (1-10tr)",
    new: "Mới (<1tr)"
};

function CustomerReport({ data, loading, dateRange }) {
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
        new_customers_by_date = [],
        top_customers = [],
        customer_segments = [],
        total_customers = 0,
        new_customers = 0,
        returning_customers = 0,
        retention_rate = 0,
        avg_orders_per_customer = 0,
        customer_lifetime_value = 0
    } = data;
    
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
    
    // Chuẩn bị dữ liệu cho pie chart
    const pieData = customer_segments.map(item => ({
        name: SEGMENT_LABELS[item.segment] || item.name,
        value: item.count,
        segment: item.segment,
        percent: item.percent
    }));

    // Hàm xuất Excel
    const exportToExcel = () => {
        try {
            setExporting(true);
            
            const wb = XLSX.utils.book_new();
            
            // Sheet 1: Tổng quan
            const summaryData = [
                ['BÁO CÁO KHÁCH HÀNG'],
                [`Kỳ báo cáo: ${dateRange?.startDate?.toLocaleDateString("vi-VN") || ''} - ${dateRange?.endDate?.toLocaleDateString("vi-VN") || ''}`],
                [],
                ['Chỉ tiêu', 'Giá trị'],
                ['Tổng khách hàng', total_customers],
                ['Khách hàng mới', new_customers],
                ['Khách hàng quay lại', returning_customers],
                ['Tỷ lệ giữ chân', `${retention_rate}%`],
                ['Số đơn TB mỗi KH', avg_orders_per_customer],
                ['Giá trị vòng đời KH', customer_lifetime_value],
            ];
            const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');
            
            // Sheet 2: Khách hàng mới theo ngày
            if (new_customers_by_date.length > 0) {
                const dailyData = [
                    ['Ngày', 'Số khách hàng mới'],
                    ...new_customers_by_date.map(item => [item.date, item.count])
                ];
                const ws2 = XLSX.utils.aoa_to_sheet(dailyData);
                XLSX.utils.book_append_sheet(wb, ws2, 'KH mới theo ngày');
            }
            
            // Sheet 3: Phân khúc khách hàng
            if (customer_segments.length > 0) {
                const segmentData = [
                    ['Phân khúc', 'Số lượng', 'Tỷ lệ (%)'],
                    ...customer_segments.map(item => [
                        SEGMENT_LABELS[item.segment] || item.name,
                        item.count,
                        item.percent
                    ])
                ];
                const ws3 = XLSX.utils.aoa_to_sheet(segmentData);
                XLSX.utils.book_append_sheet(wb, ws3, 'Phân khúc KH');
            }
            
            // Sheet 4: Top khách hàng
            if (top_customers.length > 0) {
                const topData = [
                    ['STT', 'Tên khách hàng', 'Email', 'Số đơn hàng', 'Tổng chi tiêu'],
                    ...top_customers.map((item, index) => [
                        index + 1,
                        item.name,
                        item.email,
                        item.order_count,
                        item.total_spent
                    ])
                ];
                const ws4 = XLSX.utils.aoa_to_sheet(topData);
                XLSX.utils.book_append_sheet(wb, ws4, 'Top khách hàng');
            }
            
            const fileName = `Bao_cao_khach_hang_${new Date().toISOString().split('T')[0]}.xlsx`;
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
            doc.text('BÁO CÁO KHÁCH HÀNG', pageWidth / 2, 20, { align: 'center' });
            
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
                ['Tổng khách hàng', formatNumber(total_customers)],
                ['Khách hàng mới', formatNumber(new_customers)],
                ['Khách hàng quay lại', formatNumber(returning_customers)],
                ['Tỷ lệ giữ chân', `${retention_rate}%`],
                ['Số đơn TB mỗi KH', avg_orders_per_customer],
                ['Giá trị vòng đời KH', formatCurrency(customer_lifetime_value)],
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
            
            // 1. Khách hàng mới theo ngày
            if (new_customers_by_date.length > 0) {
                if (finalY > 230) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('1. KHÁCH HÀNG MỚI THEO NGÀY', 14, finalY);
                
                const dailyData = [
                    ['Ngày', 'Số khách hàng mới'],
                    ...new_customers_by_date.slice(0, 20).map(item => [item.date, item.count])
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
                
                if (new_customers_by_date.length > 20) {
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(`* Hiển thị 20/ ${new_customers_by_date.length} ngày`, 14, doc.lastAutoTable.finalY + 5);
                    finalY = doc.lastAutoTable.finalY + 10;
                } else {
                    finalY = doc.lastAutoTable.finalY + 10;
                }
            }
            
            // 2. Phân khúc khách hàng
            if (customer_segments.length > 0) {
                if (finalY > 230) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('2. PHÂN KHÚC KHÁCH HÀNG', 14, finalY);
                
                const segmentData = [
                    ['Phân khúc', 'Số lượng', 'Tỷ lệ (%)'],
                    ...customer_segments.map(item => [
                        SEGMENT_LABELS[item.segment] || item.name,
                        item.count,
                        `${item.percent}%`
                    ])
                ];
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [segmentData[0]],
                    body: segmentData.slice(1),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] },
                    styles: { fontSize: 9 },
                    margin: { left: 14, right: 14 },
                });
                
                finalY = doc.lastAutoTable.finalY + 10;
            }
            
            // 3. Top khách hàng
            if (top_customers.length > 0) {
                if (finalY > 230) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('3. TOP KHÁCH HÀNG MUA NHIỀU NHẤT', 14, finalY);
                
                const topData = [
                    ['STT', 'Tên khách hàng', 'Email', 'Số đơn hàng', 'Tổng chi tiêu'],
                    ...top_customers.slice(0, 10).map((item, index) => [
                        index + 1,
                        item.name,
                        item.email,
                        item.order_count,
                        formatCurrency(item.total_spent)
                    ])
                ];
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [topData[0]],
                    body: topData.slice(1),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] },
                    styles: { fontSize: 8 },
                    margin: { left: 14, right: 14 },
                });
                
                if (top_customers.length > 10) {
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(`* Hiển thị 10/ ${top_customers.length} khách hàng`, 14, doc.lastAutoTable.finalY + 5);
                }
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
            
            doc.save(`Bao_cao_khach_hang_${new Date().toISOString().split('T')[0]}.pdf`);
            
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
                
                {/* Bảng 1: Khách hàng mới theo ngày */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiCalendar /> Khách hàng mới theo ngày
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Ngày</th>
                                    <th className="text-center">Số KH mới</th>
                                    <th className="text-center">Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {new_customers_by_date.length > 0 ? (
                                    new_customers_by_date.map((item, index) => {
                                        const percent = new_customers > 0 
                                            ? (item.count / new_customers * 100).toFixed(1) 
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
                                    <td className="text-center"><strong>{formatNumber(new_customers)}</strong></td>
                                    <td className="text-center"><strong>100%</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Bảng 2: Phân khúc khách hàng */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiPieChart /> Phân khúc khách hàng
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Phân khúc</th>
                                    <th className="text-center">Số lượng</th>
                                    <th className="text-center">Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {customer_segments.length > 0 ? (
                                    customer_segments.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span 
                                                    className="segment-badge" 
                                                    style={{ 
                                                        backgroundColor: SEGMENT_COLORS[item.segment],
                                                        color: "white",
                                                        padding: "4px 12px",
                                                        borderRadius: "20px",
                                                        fontSize: "12px",
                                                        display: "inline-block"
                                                    }}
                                                >
                                                    {SEGMENT_LABELS[item.segment] || item.name}
                                                </span>
                                            </td>
                                            <td className="text-center">{formatNumber(item.count)}</td>
                                            <td className="text-center">
                                                <span className="percent-badge">{item.percent}%</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">Không có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="total-row">
                                    <td colSpan="2"><strong>Tổng cộng</strong></td>
                                    <td className="text-center"><strong>{formatNumber(total_customers)}</strong></td>
                                    <td className="text-center"><strong>100%</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Bảng 3: Top khách hàng */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiAward /> Top khách hàng mua nhiều nhất
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên khách hàng</th>
                                    <th>Email</th>
                                    <th className="text-center">Số đơn hàng</th>
                                    <th className="text-right">Tổng chi tiêu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {top_customers.length > 0 ? (
                                    top_customers.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td><strong>{item.name}</strong></td>
                                            <td>{item.email}</td>
                                            <td className="text-center">{formatNumber(item.order_count)}</td>
                                            <td className="text-right revenue-cell">{formatCurrency(item.total_spent)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">Chưa có dữ liệu khách hàng</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bảng 4: Chỉ số khách hàng */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiTrendingUp /> Chỉ số khách hàng
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
                                    <td>Tổng khách hàng</td>
                                    <td className="text-center">{formatNumber(total_customers)}</td>
                                </tr>
                                <tr>
                                    <td>Khách hàng mới</td>
                                    <td className="text-center">{formatNumber(new_customers)}</td>
                                </tr>
                                <tr>
                                    <td>Khách hàng quay lại</td>
                                    <td className="text-center">{formatNumber(returning_customers)}</td>
                                </tr>
                                <tr>
                                    <td>Tỷ lệ giữ chân</td>
                                    <td className="text-center">{retention_rate}%</td>
                                </tr>
                                <tr>
                                    <td>Số đơn trung bình mỗi KH</td>
                                    <td className="text-center">{avg_orders_per_customer}</td>
                                </tr>
                                <tr>
                                    <td>Giá trị vòng đời KH (CLV)</td>
                                    <td className="text-center">{formatCurrency(customer_lifetime_value)}</td>
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
            title: "Tổng khách hàng",
            value: formatNumber(total_customers),
            icon: <FiUsers />,
            color: "#3b82f6",
            bgColor: "#eff6ff"
        },
        {
            title: "Khách hàng mới",
            value: formatNumber(new_customers),
            icon: <FiUserPlus />,
            color: "#10b981",
            bgColor: "#ecfdf5"
        },
        {
            title: "Khách quay lại",
            value: formatNumber(returning_customers),
            icon: <FiUserCheck />,
            color: "#8b5cf6",
            bgColor: "#f5f3ff"
        },
        {
            title: "Tỷ lệ giữ chân",
            value: `${retention_rate}%`,
            icon: <FiTrendingUp />,
            color: "#f59e0b",
            bgColor: "#fffbeb"
        }
    ];
    
    return (
        <div className="report-card">
            <div className="report-header">
                <div>
                    <h2 className="report-title">
                        <FiUsers className="report-icon" />
                        Báo cáo khách hàng
                    </h2>
                    <p className="report-subtitle">
                        Thống kê số lượng khách hàng, phân khúc và hiệu suất giữ chân
                    </p>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button 
                            className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
                            onClick={() => setViewMode('chart')}
                        >
                            <FiUsers /> Biểu đồ
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
                            <span>Giá trị vòng đời KH</span>
                            <strong>{formatCurrency(customer_lifetime_value)}</strong>
                        </div>
                        <div className="stat-badge">
                            <span>Số đơn TB/KH</span>
                            <strong>{avg_orders_per_customer}</strong>
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
                    {/* Biểu đồ 1: Khách hàng mới theo ngày */}
                    <div className="chart-container">
                        <h3>
                            <FiCalendar /> Khách hàng mới theo ngày
                        </h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={new_customers_by_date}>
                                <defs>
                                    <linearGradient id="customerGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                <YAxis stroke="#94a3b8" />
                                <Tooltip 
                                    formatter={(value) => [value, "Khách hàng mới"]}
                                    labelFormatter={(label) => `Ngày ${label}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="count"
                                    stroke="#10b981"
                                    strokeWidth={2}
                                    fill="url(#customerGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* 2 cột: Phân khúc khách hàng và Chỉ số */}
                    <div className="two-columns">
                        <div className="chart-container">
                            <h3>
                                <FiPieChart /> Phân khúc khách hàng
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
                                                    fill={SEGMENT_COLORS[entry.segment] || "#94a3b8"} 
                                                />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [value, "Khách hàng"]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-chart">Không có dữ liệu</div>
                            )}
                        </div>
                        
                        <div className="metrics-grid">
                            <div className="metric-card">
                                <div className="metric-icon">
                                    <FiDollarSign />
                                </div>
                                <div className="metric-info">
                                    <span className="metric-label">Giá trị vòng đời KH (CLV)</span>
                                    <span className="metric-value">{formatCurrency(customer_lifetime_value)}</span>
                                    <span className="metric-desc">Trung bình mỗi khách hàng</span>
                                </div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-icon">
                                    <FiShoppingCart />
                                </div>
                                <div className="metric-info">
                                    <span className="metric-label">Số đơn trung bình mỗi KH</span>
                                    <span className="metric-value">{avg_orders_per_customer}</span>
                                    <span className="metric-desc">Tổng đơn / Tổng KH</span>
                                </div>
                            </div>
                            <div className="metric-card">
                                <div className="metric-icon">
                                    <FiUserCheck />
                                </div>
                                <div className="metric-info">
                                    <span className="metric-label">Tỷ lệ khách hàng quay lại</span>
                                    <span className="metric-value">
                                        {total_customers > 0 ? ((returning_customers / total_customers) * 100).toFixed(1) : 0}%
                                    </span>
                                    <span className="metric-desc">Khách hàng mua từ 2 lần trở lên</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bảng top khách hàng - Hiển thị trong chế độ biểu đồ */}
                    <div className="data-table-wrapper">
                        <h3>🏆 Top khách hàng mua nhiều nhất</h3>
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Tên khách hàng</th>
                                    <th>Email</th>
                                    <th className="text-center">Số đơn hàng</th>
                                    <th className="text-right">Tổng chi tiêu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {top_customers.length > 0 ? (
                                    top_customers.map((customer, idx) => (
                                        <tr key={idx}>
                                            <td>{idx + 1}</td>
                                            <td><strong>{customer.name}</strong></td>
                                            <td>{customer.email}</td>
                                            <td className="text-center">{customer.order_count}</td>
                                            <td className="text-right revenue-cell">{formatCurrency(customer.total_spent)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="empty-row">Chưa có dữ liệu khách hàng</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
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
                
                .metrics-grid {
                    display: flex;
                    flex-direction: column;
                    gap: 16px;
                    justify-content: center;
                }
                
                .metric-card {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    transition: all 0.3s ease;
                }
                
                .metric-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                }
                
                .metric-icon {
                    width: 48px;
                    height: 48px;
                    border-radius: 12px;
                    background: #e0e7ff;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: #3b82f6;
                }
                
                .metric-info {
                    flex: 1;
                }
                
                .metric-label {
                    font-size: 12px;
                    color: #64748b;
                    display: block;
                    margin-bottom: 4px;
                }
                
                .metric-value {
                    font-size: 24px;
                    font-weight: 700;
                    color: #0f172a;
                    display: block;
                }
                
                .metric-desc {
                    font-size: 11px;
                    color: #94a3b8;
                    display: block;
                    margin-top: 4px;
                }
                
                .data-table-wrapper {
                    margin-top: 24px;
                    overflow-x: auto;
                }
                
                .data-table-wrapper h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #0f172a;
                    margin-bottom: 16px;
                }
                
                .data-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .data-table th {
                    text-align: left;
                    padding: 12px;
                    background: #f8fafc;
                    color: #0f172a;
                    font-weight: 600;
                    font-size: 13px;
                    border-bottom: 2px solid #e2e8f0;
                }
                
                .data-table td {
                    padding: 12px;
                    border-bottom: 1px solid #f1f5f9;
                    font-size: 14px;
                }
                
                .data-table tbody tr:hover {
                    background: #f8fafc;
                }
                
                .total-row {
                    background: #f8fafc;
                    font-weight: 600;
                }
                
                .count-cell {
                    font-weight: 600;
                    color: #0f172a;
                }
                
                .revenue-cell {
                    font-weight: 600;
                    color: #10b981;
                }
                
                .empty-row {
                    text-align: center;
                    color: #94a3b8;
                    padding: 32px;
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
                
                .empty-chart {
                    height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    background: #f8fafc;
                    border-radius: 12px;
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
                
                .segment-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    color: white;
                    font-size: 12px;
                    font-weight: 500;
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
                    .metrics-grid {
                        gap: 12px;
                    }
                    .metric-card {
                        padding: 16px;
                    }
                    .metric-value {
                        font-size: 20px;
                    }
                }
            `}</style>
        </div>
    );
}

export default CustomerReport;