// src/pages/admin/Reports/components/DiscountReport.jsx
import { useState } from "react";
import { 
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from "recharts";
import { 
    FiTag, 
    FiPercent, 
    FiDollarSign, 
    FiPackage, 
    FiTrendingUp, 
    FiClock,
    FiTable,
    FiFileText,
    FiFile,
    FiPieChart,
    FiAward
} from "react-icons/fi";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const LEVEL_COLORS = {
    variant: "#3b82f6",
    product: "#10b981",
    category: "#f59e0b"
};

const LEVEL_LABELS = {
    variant: "Biến thể",
    product: "Sản phẩm",
    category: "Danh mục"
};

function DiscountReport({ data, loading, dateRange }) {
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
        summary = {},
        discount_by_level = [],
        top_active_discounts = [],
        top_discounted_products = []
    } = data;
    
    const {
        total_discounts = 0,
        active_discounts = 0,
        discounted_products = 0,
        total_discount_amount = 0,
        total_revenue_from_discounted = 0
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
    
    // Tính tổng để tính phần trăm cho pie chart
    const totalCount = discount_by_level.reduce((sum, item) => sum + (item.count || 0), 0);
    
    // Chuẩn bị dữ liệu cho pie chart
    const pieData = discount_by_level.map((item) => {
        const percent = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
        return {
            name: LEVEL_LABELS[item.level] || item.level,
            value: item.count,
            level: item.level,
            percent: percent
        };
    });

    // Hàm xuất Excel
    const exportToExcel = () => {
        try {
            setExporting(true);
            
            const wb = XLSX.utils.book_new();
            
            // Sheet 1: Tổng quan
            const summaryData = [
                ['BÁO CÁO GIẢM GIÁ SẢN PHẨM'],
                [`Kỳ báo cáo: ${dateRange?.startDate?.toLocaleDateString("vi-VN") || ''} - ${dateRange?.endDate?.toLocaleDateString("vi-VN") || ''}`],
                [],
                ['Chỉ tiêu', 'Giá trị'],
                ['Tổng discount', total_discounts],
                ['Đang active', active_discounts],
                ['SP được giảm giá', discounted_products],
                ['Tổng tiền giảm', total_discount_amount],
                ['Doanh thu từ SP giảm giá', total_revenue_from_discounted],
            ];
            const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');
            
            // Sheet 2: Phân bố theo cấp độ
            if (discount_by_level.length > 0) {
                const levelData = [
                    ['Cấp độ', 'Số lượng', 'Tỷ lệ (%)'],
                    ...discount_by_level.map(item => {
                        const percent = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                        return [
                            LEVEL_LABELS[item.level] || item.level,
                            item.count,
                            percent
                        ];
                    })
                ];
                const ws2 = XLSX.utils.aoa_to_sheet(levelData);
                XLSX.utils.book_append_sheet(wb, ws2, 'Phân bố theo cấp độ');
            }
            
            // Sheet 3: Discount đang hiệu lực
            if (top_active_discounts.length > 0) {
                const activeData = [
                    ['STT', 'Cấp độ', 'Đối tượng', 'Loại', 'Giá trị', 'Bắt đầu', 'Kết thúc'],
                    ...top_active_discounts.map((item, index) => [
                        index + 1,
                        LEVEL_LABELS[item.discount_level] || item.discount_level,
                        item.target_name,
                        item.discount_type === 'percent' ? 'Phần trăm' : 'Cố định',
                        item.discount_type === 'percent' ? `${item.discount_value}%` : item.discount_value,
                        item.start_at || '',
                        item.end_at || ''
                    ])
                ];
                const ws3 = XLSX.utils.aoa_to_sheet(activeData);
                XLSX.utils.book_append_sheet(wb, ws3, 'Discount đang hiệu lực');
            }
            
            // Sheet 4: Top sản phẩm được giảm giá
            if (top_discounted_products.length > 0) {
                const productData = [
                    ['STT', 'Tên sản phẩm', 'SL bán (giảm giá)', 'Doanh thu (giảm giá)', 'Tiền được giảm', 'TB giảm/đơn'],
                    ...top_discounted_products.map((item, index) => {
                        const avgDiscountPerUnit = item.sold_with_discount > 0 
                            ? item.total_discount / item.sold_with_discount 
                            : 0;
                        return [
                            index + 1,
                            item.product_name,
                            item.sold_with_discount,
                            item.revenue_with_discount,
                            item.total_discount,
                            avgDiscountPerUnit
                        ];
                    })
                ];
                const ws4 = XLSX.utils.aoa_to_sheet(productData);
                XLSX.utils.book_append_sheet(wb, ws4, 'Top SP giảm giá');
            }
            
            const fileName = `Bao_cao_giam_gia_${new Date().toISOString().split('T')[0]}.xlsx`;
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
            doc.text('BÁO CÁO GIẢM GIÁ SẢN PHẨM', pageWidth / 2, 20, { align: 'center' });
            
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
                ['Tổng discount', formatNumber(total_discounts)],
                ['Đang active', formatNumber(active_discounts)],
                ['SP được giảm giá', formatNumber(discounted_products)],
                ['Tổng tiền giảm', formatCurrency(total_discount_amount)],
                ['Doanh thu từ SP giảm giá', formatCurrency(total_revenue_from_discounted)],
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
            
            // 1. Phân bố theo cấp độ
            if (discount_by_level.length > 0) {
                if (finalY > 230) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('1. PHÂN BỐ THEO CẤP ĐỘ', 14, finalY);
                
                const levelData = [
                    ['Cấp độ', 'Số lượng', 'Tỷ lệ (%)'],
                    ...discount_by_level.map(item => {
                        const percent = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                        return [
                            LEVEL_LABELS[item.level] || item.level,
                            item.count,
                            `${percent}%`
                        ];
                    })
                ];
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [levelData[0]],
                    body: levelData.slice(1),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] },
                    styles: { fontSize: 9 },
                    margin: { left: 14, right: 14 },
                });
                
                finalY = doc.lastAutoTable.finalY + 10;
            }
            
            // 2. Discount đang hiệu lực
            if (top_active_discounts.length > 0) {
                if (finalY > 230) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('2. DISCOUNT ĐANG HIỆU LỰC', 14, finalY);
                
                const activeData = [
                    ['Cấp độ', 'Đối tượng', 'Loại', 'Giá trị', 'Bắt đầu', 'Kết thúc'],
                    ...top_active_discounts.slice(0, 10).map(item => [
                        LEVEL_LABELS[item.discount_level] || item.discount_level,
                        item.target_name,
                        item.discount_type === 'percent' ? '%' : 'Fixed',
                        item.discount_type === 'percent' ? `${item.discount_value}%` : formatCurrency(item.discount_value),
                        item.start_at ? item.start_at.split('T')[0] : '—',
                        item.end_at ? item.end_at.split('T')[0] : '—'
                    ])
                ];
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [activeData[0]],
                    body: activeData.slice(1),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] },
                    styles: { fontSize: 8 },
                    margin: { left: 14, right: 14 },
                });
                
                if (top_active_discounts.length > 10) {
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(`* Hiển thị 10/ ${top_active_discounts.length} chương trình`, 14, doc.lastAutoTable.finalY + 5);
                    finalY = doc.lastAutoTable.finalY + 10;
                } else {
                    finalY = doc.lastAutoTable.finalY + 10;
                }
            }
            
            // 3. Top sản phẩm được giảm giá
            if (top_discounted_products.length > 0) {
                if (finalY > 230) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('3. TOP 10 SẢN PHẨM ĐƯỢC GIẢM GIÁ NHIỀU NHẤT', 14, finalY);
                
                const productData = [
                    ['STT', 'Tên sản phẩm', 'SL bán (GG)', 'Doanh thu (GG)', 'Tiền giảm', 'TB giảm/đơn'],
                    ...top_discounted_products.slice(0, 10).map((item, index) => {
                        const avgDiscountPerUnit = item.sold_with_discount > 0 
                            ? item.total_discount / item.sold_with_discount 
                            : 0;
                        return [
                            index + 1,
                            item.product_name,
                            item.sold_with_discount,
                            formatCurrency(item.revenue_with_discount),
                            formatCurrency(item.total_discount),
                            formatCurrency(avgDiscountPerUnit)
                        ];
                    })
                ];
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [productData[0]],
                    body: productData.slice(1),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] },
                    styles: { fontSize: 8 },
                    margin: { left: 14, right: 14 },
                });
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
            
            doc.save(`Bao_cao_giam_gia_${new Date().toISOString().split('T')[0]}.pdf`);
            
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

                {/* Bảng 1: Phân bố theo cấp độ */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiPieChart /> Phân bố discount theo cấp độ
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Cấp độ</th>
                                    <th className="text-center">Số lượng</th>
                                    <th className="text-center">Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {discount_by_level.length > 0 ? (
                                    discount_by_level.map((item, index) => {
                                        const percent = totalCount > 0 ? Math.round((item.count / totalCount) * 100) : 0;
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>
                                                    <span 
                                                        className="level-badge"
                                                        style={{ 
                                                            backgroundColor: LEVEL_COLORS[item.level],
                                                            color: "white",
                                                            padding: "4px 12px",
                                                            borderRadius: "20px",
                                                            fontSize: "12px",
                                                            display: "inline-block"
                                                        }}
                                                    >
                                                        {LEVEL_LABELS[item.level] || item.level}
                                                    </span>
                                                </td>
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
                                    <td className="text-center"><strong>{formatNumber(totalCount)}</strong></td>
                                    <td className="text-center"><strong>100%</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Bảng 2: Discount đang hiệu lực */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiClock /> Discount đang hiệu lực
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Cấp độ</th>
                                    <th>Đối tượng</th>
                                    <th>Loại</th>
                                    <th className="text-right">Giá trị</th>
                                    <th>Bắt đầu</th>
                                    <th>Kết thúc</th>
                                </tr>
                            </thead>
                            <tbody>
                                {top_active_discounts.length > 0 ? (
                                    top_active_discounts.map((item, index) => (
                                        <tr key={item.id || index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span 
                                                    className="level-badge"
                                                    style={{ 
                                                        backgroundColor: LEVEL_COLORS[item.discount_level],
                                                        color: "white",
                                                        padding: "2px 8px",
                                                        borderRadius: "12px",
                                                        fontSize: "11px",
                                                        display: "inline-block"
                                                    }}
                                                >
                                                    {LEVEL_LABELS[item.discount_level]}
                                                </span>
                                            </td>
                                            <td className="target-cell" title={item.target_name}>
                                                {item.target_name}
                                            </td>
                                            <td>{item.discount_type === 'percent' ? '%' : 'Cố định'}</td>
                                            <td className="text-right discount-value-cell">
                                                {item.discount_type === 'percent' 
                                                    ? `${item.discount_value}%` 
                                                    : formatCurrency(item.discount_value)}
                                            </td>
                                            <td>{item.start_at ? item.start_at.split('T')[0] : '—'}</td>
                                            <td>{item.end_at ? item.end_at.split('T')[0] : '—'}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center">Không có discount đang hiệu lực</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bảng 3: Top sản phẩm được giảm giá */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiAward /> Top sản phẩm được giảm giá nhiều nhất
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Sản phẩm</th>
                                    <th className="text-center">SL bán (GG)</th>
                                    <th className="text-right">Doanh thu (GG)</th>
                                    <th className="text-right">Tiền giảm</th>
                                    <th className="text-right">TB giảm/đơn</th>
                                </tr>
                            </thead>
                            <tbody>
                                {top_discounted_products.length > 0 ? (
                                    top_discounted_products.map((item, index) => {
                                        const avgDiscountPerUnit = item.sold_with_discount > 0 
                                            ? item.total_discount / item.sold_with_discount 
                                            : 0;
                                        return (
                                            <tr key={item.product_id || index}>
                                                <td>{index + 1}</td>
                                                <td className="product-name-cell" title={item.product_name}>
                                                    {item.product_name}
                                                </td>
                                                <td className="text-center">{formatNumber(item.sold_with_discount)}</td>
                                                <td className="text-right revenue-cell">{formatCurrency(item.revenue_with_discount)}</td>
                                                <td className="text-right discount-cell">{formatCurrency(item.total_discount)}</td>
                                                <td className="text-right avg-discount-cell">{formatCurrency(avgDiscountPerUnit)}</td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="text-center">Chưa có dữ liệu</td>
                                    </tr>
                                )}
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
            title: "Tổng discount",
            value: formatNumber(total_discounts),
            icon: <FiTag />,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            unit: "chương trình"
        },
        {
            title: "Đang active",
            value: formatNumber(active_discounts),
            icon: <FiTrendingUp />,
            color: "#10b981",
            bgColor: "#ecfdf5",
            unit: "chương trình"
        },
        {
            title: "SP được giảm giá",
            value: formatNumber(discounted_products),
            icon: <FiPackage />,
            color: "#f59e0b",
            bgColor: "#fffbeb",
            unit: "sản phẩm"
        },
        {
            title: "Tổng tiền giảm",
            value: formatCurrency(total_discount_amount),
            icon: <FiDollarSign />,
            color: "#ef4444",
            bgColor: "#fef2f2",
            unit: ""
        }
    ];
    
    return (
        <div className="report-card">
            <div className="report-header">
                <div>
                    <h2 className="report-title">
                        <FiPercent className="report-icon" />
                        Báo cáo giảm giá sản phẩm
                    </h2>
                    <p className="report-subtitle">
                        Thống kê hiệu quả các chương trình giảm giá
                    </p>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button 
                            className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
                            onClick={() => setViewMode('chart')}
                        >
                            <FiPercent /> Biểu đồ
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
                            <span>Doanh thu từ SP giảm giá</span>
                            <strong>{formatCurrency(total_revenue_from_discounted)}</strong>
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
                            {card.unit && <span className="stat-mini-unit">{card.unit}</span>}
                        </div>
                    </div>
                ))}
            </div>
            
            {/* Hiển thị biểu đồ hoặc bảng */}
            {viewMode === 'chart' ? (
                <>
                    {/* 2 cột: Phân bố discount và Top discount đang active */}
                    <div className="two-columns">
                        {/* Biểu đồ tròn - Phân bố theo cấp độ */}
                        <div className="chart-container">
                            <h3>Phân bố discount theo cấp độ</h3>
                            {pieData.length > 0 ? (
                                <>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={pieData}
                                                dataKey="value"
                                                nameKey="name"
                                                cx="50%"
                                                cy="50%"
                                                outerRadius={90}
                                                label={({ name, percent }) => `${name}: ${percent}%`}
                                                labelLine={true}
                                            >
                                                {pieData.map((entry, index) => (
                                                    <Cell 
                                                        key={`cell-${index}`} 
                                                        fill={LEVEL_COLORS[entry.level] || "#94a3b8"} 
                                                    />
                                                ))}
                                            </Pie>
                                            <Tooltip formatter={(value) => [value, "Số lượng"]} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="legend-inline">
                                        {pieData.map((item, idx) => (
                                            <div key={idx} className="legend-inline-item">
                                                <div className="legend-color" style={{ backgroundColor: LEVEL_COLORS[item.level] || "#94a3b8" }}></div>
                                                <span>{item.name}</span>
                                                <strong>{item.value}</strong>
                                                <span>({item.percent}%)</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            ) : (
                                <div className="empty-chart">Không có dữ liệu</div>
                            )}
                        </div>
                        
                        {/* Bảng Top discount đang active */}
                        <div className="product-table-container">
                            <h3>
                                <FiClock className="inline-icon" />
                                🏆 Discount đang hiệu lực ({active_discounts} chương trình)
                            </h3>
                            {top_active_discounts.length > 0 ? (
                                <table className="discount-table">
                                    <thead>
                                        <tr>
                                            <th>Cấp độ</th>
                                            <th>Đối tượng</th>
                                            <th>Loại</th>
                                            <th>Giá trị</th>
                                            <th>Thời gian</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {top_active_discounts.map((discount, idx) => (
                                            <tr key={discount.id}>
                                                <td>
                                                    <span 
                                                        className="level-badge"
                                                        style={{ 
                                                            backgroundColor: LEVEL_COLORS[discount.discount_level],
                                                            color: "white",
                                                            padding: "2px 8px",
                                                            borderRadius: "12px",
                                                            fontSize: "11px",
                                                            display: "inline-block"
                                                        }}
                                                    >
                                                        {LEVEL_LABELS[discount.discount_level]}
                                                    </span>
                                                </td>
                                                <td className="target-cell" title={discount.target_name}>
                                                    {discount.target_name}
                                                </td>
                                                <td>{discount.discount_type === 'percent' ? '%' : 'Fixed'}</td>
                                                <td className="discount-value-cell">
                                                    {discount.discount_type === 'percent' 
                                                        ? `${discount.discount_value}%` 
                                                        : formatCurrency(discount.discount_value)}
                                                </td>
                                                <td className="date-cell">
                                                    {discount.start_at ? discount.start_at.split('T')[0] : '—'} 
                                                    → {discount.end_at ? discount.end_at.split('T')[0] : '—'}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            ) : (
                                <div className="empty-table">Không có discount đang hiệu lực</div>
                            )}
                        </div>
                    </div>
                    
                    {/* Bảng Top 10 sản phẩm được giảm giá nhiều nhất */}
                    <div className="data-table-wrapper">
                        <h3>🏆 Top 10 sản phẩm được giảm giá nhiều nhất</h3>
                        {top_discounted_products.length > 0 ? (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Sản phẩm</th>
                                        <th className="text-center">SL bán (GG)</th>
                                        <th className="text-right">Doanh thu (GG)</th>
                                        <th className="text-right">Tiền giảm</th>
                                        <th className="text-right">TB giảm/đơn</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {top_discounted_products.map((product, idx) => {
                                        const avgDiscountPerUnit = product.sold_with_discount > 0 
                                            ? product.total_discount / product.sold_with_discount 
                                            : 0;
                                        return (
                                            <tr key={product.product_id}>
                                                <td className="rank-cell">{idx + 1}</td>
                                                <td className="product-name-cell" title={product.product_name}>
                                                    {product.product_name}
                                                </td>
                                                <td className="text-center">{formatNumber(product.sold_with_discount)}</td>
                                                <td className="text-right revenue-cell">{formatCurrency(product.revenue_with_discount)}</td>
                                                <td className="text-right discount-cell">{formatCurrency(product.total_discount)}</td>
                                                <td className="text-right avg-discount-cell">{formatCurrency(avgDiscountPerUnit)}</td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-table">Chưa có dữ liệu</div>
                        )}
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
                    gap: 16px;
                }
                
                .stat-badge {
                    background: #f8fafc;
                    padding: 8px 16px;
                    border-radius: 12px;
                    text-align: center;
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
                
                .stat-mini-unit {
                    font-size: 11px;
                    color: #94a3b8;
                    margin-left: 2px;
                }
                
                .two-columns {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 24px;
                    margin-bottom: 24px;
                }
                
                .chart-container {
                    margin-bottom: 24px;
                }
                
                .chart-container h3 {
                    font-size: 16px;
                    font-weight: 600;
                    color: #0f172a;
                    margin-bottom: 16px;
                }
                
                .product-table-container {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 16px;
                }
                
                .product-table-container h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    color: #0f172a;
                }
                
                .discount-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .discount-table th {
                    text-align: left;
                    padding: 10px 8px;
                    background: #e2e8f0;
                    color: #0f172a;
                    font-weight: 600;
                    font-size: 12px;
                    border-radius: 8px;
                }
                
                .discount-table td {
                    padding: 10px 8px;
                    border-bottom: 1px solid #e2e8f0;
                    font-size: 12px;
                }
                
                .target-cell {
                    max-width: 150px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .discount-value-cell {
                    font-weight: 600;
                    color: #ef4444;
                }
                
                .date-cell {
                    font-size: 11px;
                    color: #64748b;
                }
                
                .legend-inline {
                    display: flex;
                    justify-content: center;
                    gap: 24px;
                    margin-top: 16px;
                    flex-wrap: wrap;
                }
                
                .legend-inline-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                }
                
                .legend-color {
                    width: 12px;
                    height: 12px;
                    border-radius: 2px;
                }
                
                .inline-icon {
                    display: inline;
                    margin-right: 4px;
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
                
                .rank-cell {
                    font-weight: 700;
                    color: #3b82f6;
                    width: 40px;
                }
                
                .product-name-cell {
                    max-width: 250px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .revenue-cell {
                    font-weight: 600;
                    color: #10b981;
                }
                
                .discount-cell {
                    font-weight: 600;
                    color: #ef4444;
                }
                
                .avg-discount-cell {
                    font-weight: 600;
                    color: #f59e0b;
                }
                
                .empty-chart {
                    height: 250px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    background: #f8fafc;
                    border-radius: 12px;
                }
                
                .empty-table {
                    text-align: center;
                    padding: 40px;
                    color: #94a3b8;
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
                
                .total-row {
                    background: #f1f5f9;
                    font-weight: 600;
                }
                
                .total-row td {
                    padding: 12px 16px;
                    border-top: 2px solid #cbd5e1;
                    border-bottom: none;
                }
                
                .level-badge {
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
                    .legend-inline {
                        flex-direction: column;
                        align-items: center;
                    }
                    .table-actions {
                        flex-direction: column;
                        width: 100%;
                    }
                    .export-btn {
                        justify-content: center;
                    }
                }
            `}</style>
        </div>
    );
}

export default DiscountReport;