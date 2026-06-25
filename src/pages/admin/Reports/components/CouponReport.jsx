// src/pages/admin/Reports/components/CouponReport.jsx
import { useState } from "react";
import { 
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts";
import { 
    FiTag, 
    FiPercent, 
    FiDollarSign, 
    FiShoppingCart, 
    FiTrendingUp, 
    FiClock,
    FiTable,
    FiFileText,
    FiFile,
    FiAward
} from "react-icons/fi";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

function CouponReport({ data, loading, dateRange }) {
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
        top_coupons = [],
        coupon_usage_by_date = [],
        active_coupons = []
    } = data;
    
    const {
        total_coupons = 0,
        active_coupons: activeCouponsCount = 0,
        orders_with_coupon = 0,
        total_discount_amount = 0
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

    // Hàm xuất Excel
    const exportToExcel = () => {
        try {
            setExporting(true);
            
            const wb = XLSX.utils.book_new();
            
            // Sheet 1: Tổng quan
            const summaryData = [
                ['BÁO CÁO MÃ GIẢM GIÁ'],
                [`Kỳ báo cáo: ${dateRange?.startDate?.toLocaleDateString("vi-VN") || ''} - ${dateRange?.endDate?.toLocaleDateString("vi-VN") || ''}`],
                [],
                ['Chỉ tiêu', 'Giá trị'],
                ['Tổng số coupon', total_coupons],
                ['Coupon đang active', activeCouponsCount],
                ['Số đơn dùng coupon', orders_with_coupon],
                ['Tổng tiền giảm', total_discount_amount],
            ];
            const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');
            
            // Sheet 2: Xu hướng sử dụng coupon
            if (coupon_usage_by_date.length > 0) {
                const usageData = [
                    ['Ngày', 'Số đơn dùng coupon'],
                    ...coupon_usage_by_date.map(item => [item.date, item.count])
                ];
                const ws2 = XLSX.utils.aoa_to_sheet(usageData);
                XLSX.utils.book_append_sheet(wb, ws2, 'Xu hướng sử dụng coupon');
            }
            
            // Sheet 3: Top coupon
            if (top_coupons.length > 0) {
                const topData = [
                    ['STT', 'Mã giảm giá', 'Số lần dùng', 'Tổng giảm giá', 'Giảm TB/lần'],
                    ...top_coupons.map((item, index) => [
                        index + 1,
                        item.code,
                        item.usage_count,
                        item.total_discount,
                        item.avg_discount_per_order
                    ])
                ];
                const ws3 = XLSX.utils.aoa_to_sheet(topData);
                XLSX.utils.book_append_sheet(wb, ws3, 'Top coupon');
            }
            
            // Sheet 4: Coupon đang hiệu lực
            if (active_coupons.length > 0) {
                const activeData = [
                    ['STT', 'Mã giảm giá', 'Loại', 'Giá trị', 'Đơn tối thiểu', 'Số lần dùng', 'Bắt đầu', 'Kết thúc'],
                    ...active_coupons.map((item, index) => [
                        index + 1,
                        item.code,
                        item.discount_type === 'percent' ? 'Phần trăm' : 'Cố định',
                        item.discount_type === 'percent' ? `${item.discount_value}%` : item.discount_value,
                        item.min_order_value || '',
                        `${item.used_count || 0}/${item.usage_limit || '∞'}`,
                        item.start_at || '',
                        item.end_at || ''
                    ])
                ];
                const ws4 = XLSX.utils.aoa_to_sheet(activeData);
                XLSX.utils.book_append_sheet(wb, ws4, 'Coupon đang hiệu lực');
            }
            
            const fileName = `Bao_cao_coupon_${new Date().toISOString().split('T')[0]}.xlsx`;
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
            doc.text('BÁO CÁO MÃ GIẢM GIÁ', pageWidth / 2, 20, { align: 'center' });
            
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
                ['Tổng số coupon', formatNumber(total_coupons)],
                ['Coupon đang active', formatNumber(activeCouponsCount)],
                ['Số đơn dùng coupon', formatNumber(orders_with_coupon)],
                ['Tổng tiền giảm', formatCurrency(total_discount_amount)],
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
            
            // 1. Xu hướng sử dụng coupon
            if (coupon_usage_by_date.length > 0) {
                if (finalY > 230) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('1. XU HƯỚNG SỬ DỤNG COUPON THEO NGÀY', 14, finalY);
                
                const usageData = [
                    ['Ngày', 'Số đơn dùng coupon'],
                    ...coupon_usage_by_date.slice(0, 20).map(item => [item.date, item.count])
                ];
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [usageData[0]],
                    body: usageData.slice(1),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] },
                    styles: { fontSize: 8 },
                    margin: { left: 14, right: 14 },
                });
                
                if (coupon_usage_by_date.length > 20) {
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(`* Hiển thị 20/ ${coupon_usage_by_date.length} ngày`, 14, doc.lastAutoTable.finalY + 5);
                    finalY = doc.lastAutoTable.finalY + 10;
                } else {
                    finalY = doc.lastAutoTable.finalY + 10;
                }
            }
            
            // 2. Top coupon
            if (top_coupons.length > 0) {
                if (finalY > 230) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('2. TOP 10 MÃ GIẢM GIÁ ĐƯỢC SỬ DỤNG NHIỀU NHẤT', 14, finalY);
                
                const topData = [
                    ['STT', 'Mã giảm giá', 'Số lần dùng', 'Tổng giảm giá', 'Giảm TB/lần'],
                    ...top_coupons.slice(0, 10).map((item, index) => [
                        index + 1,
                        item.code,
                        item.usage_count,
                        formatCurrency(item.total_discount),
                        formatCurrency(item.avg_discount_per_order)
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
                
                if (top_coupons.length > 10) {
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(`* Hiển thị 10/ ${top_coupons.length} mã giảm giá`, 14, doc.lastAutoTable.finalY + 5);
                    finalY = doc.lastAutoTable.finalY + 10;
                } else {
                    finalY = doc.lastAutoTable.finalY + 10;
                }
            }
            
            // 3. Coupon đang hiệu lực
            if (active_coupons.length > 0) {
                if (finalY > 230) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('3. COUPON ĐANG HIỆU LỰC', 14, finalY);
                
                const activeData = [
                    ['Mã', 'Loại', 'Giá trị', 'Đơn tối thiểu', 'Số lần dùng', 'Thời gian'],
                    ...active_coupons.slice(0, 10).map(item => [
                        item.code,
                        item.discount_type === 'percent' ? '%' : 'Fixed',
                        item.discount_type === 'percent' ? `${item.discount_value}%` : formatCurrency(item.discount_value),
                        item.min_order_value ? formatCurrency(item.min_order_value) : '—',
                        `${item.used_count || 0}/${item.usage_limit || '∞'}`,
                        `${item.start_at ? item.start_at.split('T')[0] : '—'} → ${item.end_at ? item.end_at.split('T')[0] : '—'}`
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
                
                if (active_coupons.length > 10) {
                    doc.setFontSize(8);
                    doc.setTextColor(148, 163, 184);
                    doc.text(`* Hiển thị 10/ ${active_coupons.length} coupon`, 14, doc.lastAutoTable.finalY + 5);
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
            
            doc.save(`Bao_cao_coupon_${new Date().toISOString().split('T')[0]}.pdf`);
            
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

                {/* Bảng 1: Xu hướng sử dụng coupon */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiTrendingUp /> Xu hướng sử dụng coupon theo ngày
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Ngày</th>
                                    <th className="text-center">Số đơn dùng coupon</th>
                                    <th className="text-center">Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {coupon_usage_by_date.length > 0 ? (
                                    coupon_usage_by_date.map((item, index) => {
                                        const total = coupon_usage_by_date.reduce((sum, i) => sum + i.count, 0);
                                        const percent = total > 0 ? (item.count / total * 100).toFixed(1) : 0;
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
                                    <td className="text-center">
                                        <strong>{formatNumber(coupon_usage_by_date.reduce((sum, i) => sum + i.count, 0))}</strong>
                                    </td>
                                    <td className="text-center"><strong>100%</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Bảng 2: Top coupon */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiAward /> Top mã giảm giá được sử dụng nhiều nhất
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Mã giảm giá</th>
                                    <th className="text-center">Số lần dùng</th>
                                    <th className="text-right">Tổng giảm giá</th>
                                    <th className="text-right">Giảm TB/lần</th>
                                </tr>
                            </thead>
                            <tbody>
                                {top_coupons.length > 0 ? (
                                    top_coupons.map((item, index) => (
                                        <tr key={item.code}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span className="coupon-code">{item.code}</span>
                                            </td>
                                            <td className="text-center">{formatNumber(item.usage_count)}</td>
                                            <td className="text-right discount-cell">{formatCurrency(item.total_discount)}</td>
                                            <td className="text-right avg-cell">{formatCurrency(item.avg_discount_per_order)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center">Chưa có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bảng 3: Coupon đang hiệu lực */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiTag /> Coupon đang hiệu lực
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Mã giảm giá</th>
                                    <th>Loại</th>
                                    <th className="text-right">Giá trị</th>
                                    <th className="text-right">Đơn tối thiểu</th>
                                    <th className="text-center">Số lần dùng</th>
                                    <th>Thời gian</th>
                                </tr>
                            </thead>
                            <tbody>
                                {active_coupons.length > 0 ? (
                                    active_coupons.map((item, index) => (
                                        <tr key={item.id || index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span className="coupon-code">{item.code}</span>
                                            </td>
                                            <td>
                                                <span className={`type-badge ${item.discount_type === 'percent' ? 'percent' : 'fixed'}`}>
                                                    {item.discount_type === 'percent' ? '%' : 'Fixed'}
                                                </span>
                                            </td>
                                            <td className="text-right value-cell">
                                                {item.discount_type === 'percent' 
                                                    ? `${item.discount_value}%` 
                                                    : formatCurrency(item.discount_value)}
                                            </td>
                                            <td className="text-right">
                                                {item.min_order_value ? formatCurrency(item.min_order_value) : '—'}
                                            </td>
                                            <td className="text-center">
                                                {item.used_count || 0}/{item.usage_limit || '∞'}
                                            </td>
                                            <td className="date-cell">
                                                {item.start_at ? item.start_at.split('T')[0] : '—'} 
                                                → {item.end_at ? item.end_at.split('T')[0] : '—'}
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="7" className="text-center">Không có coupon đang hiệu lực</td>
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
            title: "Tổng số coupon",
            value: formatNumber(total_coupons),
            icon: <FiTag />,
            color: "#3b82f6",
            bgColor: "#eff6ff",
            unit: "mã"
        },
        {
            title: "Coupon đang active",
            value: formatNumber(activeCouponsCount),
            icon: <FiTrendingUp />,
            color: "#10b981",
            bgColor: "#ecfdf5",
            unit: "mã"
        },
        {
            title: "Số đơn dùng coupon",
            value: formatNumber(orders_with_coupon),
            icon: <FiShoppingCart />,
            color: "#f59e0b",
            bgColor: "#fffbeb",
            unit: "đơn"
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
                        Báo cáo mã giảm giá
                    </h2>
                    <p className="report-subtitle">
                        Thống kê hiệu quả sử dụng mã giảm giá
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
                    {/* Biểu đồ xu hướng sử dụng coupon */}
                    <div className="chart-container">
                        <h3>
                            <FiClock className="inline-icon" />
                            Xu hướng sử dụng coupon theo ngày
                        </h3>
                        {coupon_usage_by_date.length > 0 ? (
                            <ResponsiveContainer width="100%" height={350}>
                                <AreaChart data={coupon_usage_by_date}>
                                    <defs>
                                        <linearGradient id="couponGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                                    <YAxis stroke="#94a3b8" />
                                    <Tooltip 
                                        formatter={(value) => [value, "Đơn hàng"]}
                                        labelFormatter={(label) => `Ngày ${label}`}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="count"
                                        stroke="#f59e0b"
                                        strokeWidth={2}
                                        fill="url(#couponGradient)"
                                        name="Số đơn dùng coupon"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <div className="empty-chart">Không có dữ liệu</div>
                        )}
                    </div>
                    
                    {/* Bảng Top mã giảm giá */}
                    <div className="data-table-wrapper">
                        <h3>🏆 Top 10 mã giảm giá được sử dụng nhiều nhất</h3>
                        {top_coupons.length > 0 ? (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Mã giảm giá</th>
                                        <th className="text-center">Số lần dùng</th>
                                        <th className="text-right">Tổng giảm giá</th>
                                        <th className="text-right">Giảm TB/lần</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {top_coupons.map((coupon, idx) => (
                                        <tr key={coupon.code}>
                                            <td className="rank-cell">{idx + 1}</td>
                                            <td className="code-cell">
                                                <span className="coupon-code">{coupon.code}</span>
                                            </td>
                                            <td className="text-center">{formatNumber(coupon.usage_count)}</td>
                                            <td className="text-right discount-cell">{formatCurrency(coupon.total_discount)}</td>
                                            <td className="text-right avg-cell">{formatCurrency(coupon.avg_discount_per_order)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-table">Chưa có dữ liệu</div>
                        )}
                    </div>
                    
                    {/* Bảng Coupon đang hiệu lực */}
                    <div className="data-table-wrapper">
                        <h3>🏷️ Coupon đang hiệu lực</h3>
                        {active_coupons.length > 0 ? (
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Mã giảm giá</th>
                                        <th>Loại</th>
                                        <th className="text-right">Giá trị</th>
                                        <th className="text-right">Đơn tối thiểu</th>
                                        <th className="text-center">Số lần dùng</th>
                                        <th>Thời gian</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {active_coupons.map((coupon, idx) => (
                                        <tr key={coupon.id}>
                                            <td className="rank-cell">{idx + 1}</td>
                                            <td className="code-cell">
                                                <span className="coupon-code">{coupon.code}</span>
                                            </td>
                                            <td className="type-cell">
                                                {coupon.discount_type === 'percent' ? '%' : 'Fixed'}
                                            </td>
                                            <td className="text-right value-cell">
                                                {coupon.discount_type === 'percent' 
                                                    ? `${coupon.discount_value}%` 
                                                    : formatCurrency(coupon.discount_value)}
                                            </td>
                                            <td className="text-right min-order-cell">
                                                {coupon.min_order_value ? formatCurrency(coupon.min_order_value) : '—'}
                                            </td>
                                            <td className="text-center usage-limit-cell">
                                                {coupon.used_count || 0}/{coupon.usage_limit || '∞'}
                                            </td>
                                            <td className="date-cell">
                                                {coupon.start_at ? coupon.start_at.split('T')[0] : '—'} 
                                                → {coupon.end_at ? coupon.end_at.split('T')[0] : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <div className="empty-table">Không có coupon đang hiệu lực</div>
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
                
                .code-cell {
                    font-weight: 600;
                }
                
                .coupon-code {
                    background: #f1f5f9;
                    padding: 4px 8px;
                    border-radius: 6px;
                    font-family: monospace;
                    font-size: 13px;
                }
                
                .discount-cell {
                    font-weight: 600;
                    color: #ef4444;
                }
                
                .avg-cell {
                    font-weight: 600;
                    color: #10b981;
                }
                
                .value-cell {
                    font-weight: 600;
                    color: #f59e0b;
                }
                
                .min-order-cell {
                    color: #64748b;
                }
                
                .usage-limit-cell {
                    font-weight: 500;
                }
                
                .date-cell {
                    font-size: 12px;
                    color: #64748b;
                }
                
                .empty-chart {
                    height: 350px;
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
                
                .type-badge {
                    display: inline-block;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 11px;
                    font-weight: 500;
                }
                
                .type-badge.percent {
                    background: #dbeafe;
                    color: #3b82f6;
                }
                
                .type-badge.fixed {
                    background: #fce4ec;
                    color: #ef4444;
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
                    .stats-mini-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .header-actions {
                        width: 100%;
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

export default CouponReport;