// src/pages/admin/Reports/components/RevenueReport.js
import { useState } from "react";
import {
    AreaChart,
    Area,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { 
    FiTrendingUp, 
    FiTrendingDown, 
    FiDollarSign, 
    FiShoppingCart, 
    FiPackage,
    FiTable,
    FiFileText,
    FiFile,
    FiCalendar,
    FiPieChart,
    FiCreditCard
} from "react-icons/fi";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

function RevenueReport({ data, loading, dateRange, compareMode }) {
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
    
    // Lấy dữ liệu từ props (cấu trúc từ backend)
    const {
        summary = {},
        daily_revenue = [],
        revenue_by_category = [],
        revenue_by_payment = [],
        comparison = {}
    } = data;
    
    const {
        total_revenue = 0,
        total_orders = 0,
        total_products_sold = 0,
        avg_order_value = 0
    } = summary;
    
    const {
        growth_percent = 0,
        revenue_change = 0
    } = comparison;
    
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
    
    const isPositive = growth_percent >= 0;

    // ============ HÀM XUẤT EXCEL NÂNG CAO ============
    const exportToExcel = () => {
        try {
            setExporting(true);
            
            const wb = XLSX.utils.book_new();
            
            // ===== SHEET 1: TỔNG QUAN =====
            const summaryData = [
                ['BÁO CÁO DOANH THU'],
                [`Kỳ báo cáo: ${dateRange.startDate.toLocaleDateString("vi-VN")} - ${dateRange.endDate.toLocaleDateString("vi-VN")}`],
                [],
                ['THỐNG KÊ TỔNG QUAN'],
                ['Chỉ tiêu', 'Giá trị'],
                ['Tổng doanh thu', total_revenue],
                ['Tổng đơn hàng', total_orders],
                ['Sản phẩm đã bán', total_products_sold],
                ['Giá trị đơn hàng trung bình', avg_order_value],
                ['Tăng trưởng', `${growth_percent}%`],
                [],
                ['THÔNG TIN SO SÁNH'],
                ['Chỉ tiêu', 'Giá trị'],
                ['Tốc độ tăng trưởng', `${growth_percent}%`],
                ['Thay đổi doanh thu', revenue_change],
                ['So sánh với', compareMode === "previous_period" ? "Kỳ trước" : "Cùng kỳ năm trước"],
                ['Ngày xuất', new Date().toLocaleString("vi-VN")]
            ];
            
            const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
            ws1['!cols'] = [
                { wch: 35 },
                { wch: 30 }
            ];
            ws1['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } },
                { s: { r: 1, c: 0 }, e: { r: 1, c: 1 } },
                { s: { r: 3, c: 0 }, e: { r: 3, c: 1 } },
                { s: { r: 11, c: 0 }, e: { r: 11, c: 1 } }
            ];
            XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');
            
            // ===== SHEET 2: DOANH THU THEO NGÀY =====
            if (daily_revenue.length > 0) {
                const total = daily_revenue.reduce((sum, i) => sum + i.revenue, 0);
                const dailyData = [
                    ['DOANH THU THEO NGÀY'],
                    ['STT', 'Ngày', 'Doanh thu', 'Tỷ lệ (%)'],
                    ...daily_revenue.map((item, index) => {
                        const percent = total > 0 ? (item.revenue / total * 100) : 0;
                        return [index + 1, item.date, item.revenue, parseFloat(percent.toFixed(1))];
                    }),
                    ['', 'TỔNG CỘNG', total, 100]
                ];
                
                const ws2 = XLSX.utils.aoa_to_sheet(dailyData);
                ws2['!cols'] = [
                    { wch: 8 },
                    { wch: 20 },
                    { wch: 25 },
                    { wch: 15 }
                ];
                ws2['!merges'] = [
                    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }
                ];
                XLSX.utils.book_append_sheet(wb, ws2, 'Doanh thu theo ngày');
            }
            
            // ===== SHEET 3: DOANH THU THEO DANH MỤC =====
            if (revenue_by_category.length > 0) {
                const total = revenue_by_category.reduce((sum, i) => sum + i.revenue, 0);
                const categoryData = [
                    ['DOANH THU THEO DANH MỤC'],
                    ['STT', 'Danh mục', 'Doanh thu', 'Tỷ lệ (%)'],
                    ...revenue_by_category.map((item, index) => {
                        const percent = total > 0 ? (item.revenue / total * 100) : 0;
                        return [index + 1, item.category_name, item.revenue, parseFloat(percent.toFixed(1))];
                    }),
                    ['', 'TỔNG CỘNG', total, 100]
                ];
                
                const ws3 = XLSX.utils.aoa_to_sheet(categoryData);
                ws3['!cols'] = [
                    { wch: 8 },
                    { wch: 25 },
                    { wch: 25 },
                    { wch: 15 }
                ];
                ws3['!merges'] = [
                    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }
                ];
                XLSX.utils.book_append_sheet(wb, ws3, 'Doanh thu theo danh mục');
            }
            
            // ===== SHEET 4: DOANH THU THEO PHƯƠNG THỨC THANH TOÁN =====
            if (revenue_by_payment.length > 0) {
                const total = revenue_by_payment.reduce((sum, i) => sum + i.revenue, 0);
                const paymentData = [
                    ['DOANH THU THEO PHƯƠNG THỨC THANH TOÁN'],
                    ['STT', 'Phương thức', 'Doanh thu', 'Tỷ lệ (%)'],
                    ...revenue_by_payment.map((item, index) => {
                        const percent = total > 0 ? (item.revenue / total * 100) : 0;
                        return [index + 1, item.payment_method, item.revenue, parseFloat(percent.toFixed(1))];
                    }),
                    ['', 'TỔNG CỘNG', total, 100]
                ];
                
                const ws4 = XLSX.utils.aoa_to_sheet(paymentData);
                ws4['!cols'] = [
                    { wch: 8 },
                    { wch: 30 },
                    { wch: 25 },
                    { wch: 15 }
                ];
                ws4['!merges'] = [
                    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }
                ];
                XLSX.utils.book_append_sheet(wb, ws4, 'Doanh thu theo thanh toán');
            }
            
            // ===== SHEET 5: THỐNG KÊ CHI TIẾT =====
            const detailData = [
                ['THỐNG KÊ CHI TIẾT'],
                [],
                ['1. Thông tin chung'],
                ['Tổng doanh thu', total_revenue],
                ['Tổng đơn hàng', total_orders],
                ['Sản phẩm đã bán', total_products_sold],
                ['Giá trị đơn hàng trung bình', avg_order_value],
                [],
                ['2. Thông tin tăng trưởng'],
                ['Tăng trưởng', `${growth_percent}%`],
                ['Thay đổi doanh thu', revenue_change],
                ['Chế độ so sánh', compareMode === "previous_period" ? "Kỳ trước" : "Cùng kỳ năm trước"],
                [],
                ['3. Thông tin xuất file'],
                ['Ngày xuất', new Date().toLocaleString("vi-VN")],
                ['Người xuất', 'Admin'],
                ['Định dạng', 'Excel']
            ];
            
            const ws5 = XLSX.utils.aoa_to_sheet(detailData);
            ws5['!cols'] = [
                { wch: 35 },
                { wch: 30 }
            ];
            ws5['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: 1 } }
            ];
            XLSX.utils.book_append_sheet(wb, ws5, 'Thống kê chi tiết');
            
            // Xuất file
            const fileName = `Bao_cao_doanh_thu_${new Date().toISOString().split('T')[0]}.xlsx`;
            XLSX.writeFile(wb, fileName);
            
            setExporting(false);
        } catch (error) {
            console.error('Lỗi xuất Excel:', error);
            setExporting(false);
            alert('Có lỗi xảy ra khi xuất file Excel');
        }
    };

    // ============ HÀM XUẤT PDF NÂNG CAO ============
    const exportToPDF = () => {
        try {
            setExporting(true);
            
            const doc = new jsPDF('p', 'mm', 'a4');
            const pageWidth = doc.internal.pageSize.getWidth();
            
            // ===== HEADER =====
            doc.setFontSize(22);
            doc.setTextColor(59, 130, 246);
            doc.text('BÁO CÁO DOANH THU', pageWidth / 2, 20, { align: 'center' });
            
            doc.setFontSize(12);
            doc.setTextColor(100, 116, 139);
            doc.text(
                `Kỳ báo cáo: ${dateRange.startDate.toLocaleDateString("vi-VN")} - ${dateRange.endDate.toLocaleDateString("vi-VN")}`,
                pageWidth / 2,
                30,
                { align: 'center' }
            );
            
            doc.setFontSize(10);
            doc.setTextColor(148, 163, 184);
            doc.text(
                `So sánh: ${compareMode === "previous_period" ? "Kỳ trước" : "Cùng kỳ năm trước"} | Ngày xuất: ${new Date().toLocaleString("vi-VN")}`,
                pageWidth / 2,
                37,
                { align: 'center' }
            );
            
            // ===== THỐNG KÊ TỔNG QUAN =====
            doc.setFontSize(14);
            doc.setTextColor(15, 23, 42);
            doc.text('THỐNG KÊ TỔNG QUAN', 14, 48);
            
            const summaryData = [
                ['Chỉ tiêu', 'Giá trị'],
                ['Tổng doanh thu', formatCurrency(total_revenue)],
                ['Tổng đơn hàng', formatNumber(total_orders)],
                ['Sản phẩm đã bán', formatNumber(total_products_sold)],
                ['Giá trị đơn hàng TB', formatCurrency(avg_order_value)],
                ['Tăng trưởng', `${growth_percent}%`],
                ['Thay đổi doanh thu', formatCurrency(revenue_change)]
            ];
            
            autoTable(doc, {
                startY: 53,
                head: [summaryData[0]],
                body: summaryData.slice(1),
                theme: 'grid',
                headStyles: { 
                    fillColor: [59, 130, 246],
                    textColor: [255, 255, 255],
                    fontSize: 10,
                    fontStyle: 'bold'
                },
                styles: { 
                    fontSize: 9,
                    cellPadding: 4
                },
                columnStyles: {
                    0: { cellWidth: 80 },
                    1: { cellWidth: 'auto' }
                },
                margin: { left: 14, right: 14 },
            });
            
            let finalY = doc.lastAutoTable.finalY + 12;
            
            // ===== 1. DOANH THU THEO NGÀY =====
            if (daily_revenue.length > 0) {
                if (finalY > 240) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('1. DOANH THU THEO NGÀY', 14, finalY);
                
                const total = daily_revenue.reduce((sum, i) => sum + i.revenue, 0);
                const dailyData = [
                    ['STT', 'Ngày', 'Doanh thu', 'Tỷ lệ'],
                    ...daily_revenue.slice(0, 15).map((item, index) => {
                        const percent = total > 0 ? (item.revenue / total * 100).toFixed(1) : 0;
                        return [
                            index + 1,
                            item.date,
                            formatCurrency(item.revenue),
                            `${percent}%`
                        ];
                    })
                ];
                
                if (daily_revenue.length > 15) {
                    dailyData.push(['...', `(Hiển thị 15/${daily_revenue.length} ngày)`, '', '']);
                }
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [dailyData[0]],
                    body: dailyData.slice(1),
                    theme: 'grid',
                    headStyles: { 
                        fillColor: [59, 130, 246],
                        textColor: [255, 255, 255],
                        fontSize: 9,
                        fontStyle: 'bold'
                    },
                    styles: { 
                        fontSize: 8,
                        cellPadding: 3
                    },
                    columnStyles: {
                        0: { cellWidth: 12 },
                        1: { cellWidth: 35 },
                        2: { cellWidth: 60 },
                        3: { cellWidth: 25 }
                    },
                    margin: { left: 14, right: 14 },
                });
                
                finalY = doc.lastAutoTable.finalY + 12;
            }
            
            // ===== 2. DOANH THU THEO DANH MỤC =====
            if (revenue_by_category.length > 0) {
                if (finalY > 240) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('2. DOANH THU THEO DANH MỤC', 14, finalY);
                
                const total = revenue_by_category.reduce((sum, i) => sum + i.revenue, 0);
                const categoryData = [
                    ['STT', 'Danh mục', 'Doanh thu', 'Tỷ lệ'],
                    ...revenue_by_category.map((item, index) => {
                        const percent = total > 0 ? (item.revenue / total * 100).toFixed(1) : 0;
                        return [
                            index + 1,
                            item.category_name,
                            formatCurrency(item.revenue),
                            `${percent}%`
                        ];
                    })
                ];
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [categoryData[0]],
                    body: categoryData.slice(1),
                    theme: 'grid',
                    headStyles: { 
                        fillColor: [59, 130, 246],
                        textColor: [255, 255, 255],
                        fontSize: 9,
                        fontStyle: 'bold'
                    },
                    styles: { 
                        fontSize: 9,
                        cellPadding: 4
                    },
                    columnStyles: {
                        0: { cellWidth: 12 },
                        1: { cellWidth: 60 },
                        2: { cellWidth: 55 },
                        3: { cellWidth: 25 }
                    },
                    margin: { left: 14, right: 14 },
                });
                
                finalY = doc.lastAutoTable.finalY + 12;
            }
            
            // ===== 3. DOANH THU THEO PHƯƠNG THỨC THANH TOÁN =====
            if (revenue_by_payment.length > 0) {
                if (finalY > 240) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('3. DOANH THU THEO PHƯƠNG THỨC THANH TOÁN', 14, finalY);
                
                const total = revenue_by_payment.reduce((sum, i) => sum + i.revenue, 0);
                const paymentData = [
                    ['STT', 'Phương thức', 'Doanh thu', 'Tỷ lệ'],
                    ...revenue_by_payment.map((item, index) => {
                        const percent = total > 0 ? (item.revenue / total * 100).toFixed(1) : 0;
                        return [
                            index + 1,
                            item.payment_method,
                            formatCurrency(item.revenue),
                            `${percent}%`
                        ];
                    })
                ];
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [paymentData[0]],
                    body: paymentData.slice(1),
                    theme: 'grid',
                    headStyles: { 
                        fillColor: [59, 130, 246],
                        textColor: [255, 255, 255],
                        fontSize: 9,
                        fontStyle: 'bold'
                    },
                    styles: { 
                        fontSize: 9,
                        cellPadding: 4
                    },
                    columnStyles: {
                        0: { cellWidth: 12 },
                        1: { cellWidth: 60 },
                        2: { cellWidth: 55 },
                        3: { cellWidth: 25 }
                    },
                    margin: { left: 14, right: 14 },
                });
                
                finalY = doc.lastAutoTable.finalY + 12;
            }
            
            // ===== FOOTER =====
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
                
                // Thêm đường kẻ phân cách
                doc.setDrawColor(226, 232, 240);
                doc.setLineWidth(0.5);
                doc.line(14, doc.internal.pageSize.getHeight() - 15, pageWidth - 14, doc.internal.pageSize.getHeight() - 15);
            }
            
            doc.save(`Bao_cao_doanh_thu_${new Date().toISOString().split('T')[0]}.pdf`);
            
            setExporting(false);
        } catch (error) {
            console.error('Lỗi xuất PDF:', error);
            setExporting(false);
            alert('Có lỗi xảy ra khi xuất file PDF');
        }
    };

    // ===== COMPONENT HIỂN THỊ BẢNG DỮ LIỆU =====
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
                
                {/* Bảng 1: Doanh thu theo ngày */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiCalendar /> Doanh thu theo ngày
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Ngày</th>
                                    <th className="text-right">Doanh thu</th>
                                    <th className="text-center">Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {daily_revenue.length > 0 ? (
                                    daily_revenue.map((item, index) => {
                                        const percent = total_revenue > 0 
                                            ? (item.revenue / total_revenue * 100).toFixed(1) 
                                            : 0;
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.date}</td>
                                                <td className="text-right">{formatCurrency(item.revenue)}</td>
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
                                    <td className="text-right"><strong>{formatCurrency(total_revenue)}</strong></td>
                                    <td className="text-center"><strong>100%</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Bảng 2: Doanh thu theo danh mục */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiPieChart /> Doanh thu theo danh mục
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Danh mục</th>
                                    <th className="text-right">Doanh thu</th>
                                    <th className="text-center">Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenue_by_category.length > 0 ? (
                                    revenue_by_category.map((item, index) => {
                                        const total = revenue_by_category.reduce((sum, i) => sum + i.revenue, 0);
                                        const percent = total > 0 ? (item.revenue / total * 100).toFixed(1) : 0;
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.category_name}</td>
                                                <td className="text-right">{formatCurrency(item.revenue)}</td>
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
                                    <td className="text-right">
                                        <strong>
                                            {formatCurrency(revenue_by_category.reduce((sum, i) => sum + i.revenue, 0))}
                                        </strong>
                                    </td>
                                    <td className="text-center"><strong>100%</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>

                {/* Bảng 3: Doanh thu theo phương thức thanh toán */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiCreditCard /> Doanh thu theo phương thức thanh toán
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Phương thức</th>
                                    <th className="text-right">Doanh thu</th>
                                    <th className="text-center">Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {revenue_by_payment.length > 0 ? (
                                    revenue_by_payment.map((item, index) => {
                                        const total = revenue_by_payment.reduce((sum, i) => sum + i.revenue, 0);
                                        const percent = total > 0 ? (item.revenue / total * 100).toFixed(1) : 0;
                                        return (
                                            <tr key={index}>
                                                <td>{index + 1}</td>
                                                <td>{item.payment_method}</td>
                                                <td className="text-right">{formatCurrency(item.revenue)}</td>
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
                                    <td className="text-right">
                                        <strong>
                                            {formatCurrency(revenue_by_payment.reduce((sum, i) => sum + i.revenue, 0))}
                                        </strong>
                                    </td>
                                    <td className="text-center"><strong>100%</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="report-card">
            <div className="report-header">
                <div>
                    <h2 className="report-title">
                        <FiDollarSign className="report-icon" />
                        Báo cáo doanh thu
                    </h2>
                    <p className="report-period">
                        {dateRange.startDate.toLocaleDateString("vi-VN")} - {dateRange.endDate.toLocaleDateString("vi-VN")}
                        {compareMode === "previous_period" ? " (so với kỳ trước)" : " (so với cùng kỳ năm trước)"}
                    </p>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button 
                            className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
                            onClick={() => setViewMode('chart')}
                        >
                            <FiTrendingUp /> Biểu đồ
                        </button>
                        <button 
                            className={`view-btn ${viewMode === 'table' ? 'active' : ''}`}
                            onClick={() => setViewMode('table')}
                        >
                            <FiTable /> Bảng
                        </button>
                    </div>
                    <div className="total-revenue">
                        <span className="total-label">Tổng doanh thu</span>
                        <span className="total-value">{formatCurrency(total_revenue)}</span>
                        <div className={`revenue-change ${isPositive ? "positive" : "negative"}`}>
                            {isPositive ? <FiTrendingUp /> : <FiTrendingDown />}
                            <span>{Math.abs(growth_percent)}%</span>
                            <span className="change-amount">{formatCurrency(Math.abs(revenue_change))}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            {/* 4 thẻ thống kê nhanh */}
            <div className="stats-mini-grid">
                <div className="stat-mini-card">
                    <div className="stat-mini-icon blue">
                        <FiDollarSign />
                    </div>
                    <div className="stat-mini-info">
                        <span className="stat-mini-label">Tổng doanh thu</span>
                        <span className="stat-mini-value">{formatCurrency(total_revenue)}</span>
                    </div>
                </div>
                <div className="stat-mini-card">
                    <div className="stat-mini-icon green">
                        <FiShoppingCart />
                    </div>
                    <div className="stat-mini-info">
                        <span className="stat-mini-label">Tổng đơn hàng</span>
                        <span className="stat-mini-value">{formatNumber(total_orders)}</span>
                    </div>
                </div>
                <div className="stat-mini-card">
                    <div className="stat-mini-icon orange">
                        <FiPackage />
                    </div>
                    <div className="stat-mini-info">
                        <span className="stat-mini-label">Sản phẩm đã bán</span>
                        <span className="stat-mini-value">{formatNumber(total_products_sold)}</span>
                    </div>
                </div>
                <div className="stat-mini-card">
                    <div className="stat-mini-icon purple">
                        <FiDollarSign />
                    </div>
                    <div className="stat-mini-info">
                        <span className="stat-mini-label">Giá trị đơn TB</span>
                        <span className="stat-mini-value">{formatCurrency(avg_order_value)}</span>
                    </div>
                </div>
            </div>
            
            {/* Hiển thị biểu đồ hoặc bảng */}
            {viewMode === 'chart' ? (
                <>
                    {/* Biểu đồ 1: Doanh thu theo ngày */}
                    <div className="chart-container">
                        <h3>
                            <FiCalendar /> Doanh thu theo ngày
                        </h3>
                        <ResponsiveContainer width="100%" height={350}>
                            <AreaChart data={daily_revenue}>
                                <defs>
                                    <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                                <XAxis dataKey="date" stroke="#94a3b8" fontSize={12}/>
                                <YAxis 
                                    tickFormatter={(value) => {
                                        if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                        if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                        return value;
                                    }} 
                                    stroke="#94a3b8"
                                />
                                <Tooltip 
                                    formatter={(value) => [formatCurrency(value), "Doanh thu"]}
                                    labelFormatter={(label) => `Ngày ${label}`}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="revenue"
                                    stroke="#3b82f6"
                                    strokeWidth={2}
                                    fill="url(#revenueGradient)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                    
                    {/* 2 cột: Biểu đồ 2 và 3 */}
                    <div className="two-columns">
                        {/* Biểu đồ 2: Doanh thu theo danh mục */}
                        <div className="chart-container">
                            <h3>
                                <FiPieChart /> Doanh thu theo danh mục
                            </h3>
                            {revenue_by_category.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={revenue_by_category}
                                            dataKey="revenue"
                                            nameKey="category_name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ category_name, percent }) => `${category_name}: ${(percent * 100).toFixed(0)}%`}
                                            labelLine={true}
                                        >
                                            {revenue_by_category.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => formatCurrency(value)} />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-chart">Không có dữ liệu</div>
                            )}
                        </div>
                        
                        {/* Biểu đồ 3: Doanh thu theo phương thức thanh toán */}
                        <div className="chart-container">
                            <h3>
                                <FiCreditCard /> Doanh thu theo phương thức thanh toán
                            </h3>
                            {revenue_by_payment.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={revenue_by_payment} layout="vertical">
                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0"/>
                                        <XAxis 
                                            type="number" 
                                            tickFormatter={(value) => {
                                                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                                                if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                                                return value;
                                            }}
                                        />
                                        <YAxis type="category" dataKey="payment_method" width={100} fontSize={12}/>
                                        <Tooltip formatter={(value) => formatCurrency(value)}/>
                                        <Legend />
                                        <Bar dataKey="revenue" fill="#10b981" radius={[0, 8, 8, 0]} name="Doanh thu">
                                            {revenue_by_payment.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Bar>
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="empty-chart">Không có dữ liệu</div>
                            )}
                        </div>
                    </div>
                </>
            ) : (
                <TableView />
            )}
            
            <style jsx>{`
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
                
                .stats-mini-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: 16px;
                    margin-bottom: 24px;
                }
                
                .stat-mini-card {
                    background: #f8fafc;
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
                    color: white;
                    flex-shrink: 0;
                }
                
                .stat-mini-icon.blue {
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                }
                
                .stat-mini-icon.green {
                    background: linear-gradient(135deg, #10b981, #059669);
                }
                
                .stat-mini-icon.orange {
                    background: linear-gradient(135deg, #f59e0b, #d97706);
                }
                
                .stat-mini-icon.purple {
                    background: linear-gradient(135deg, #8b5cf6, #7c3aed);
                }
                
                .stat-mini-info {
                    flex: 1;
                    min-width: 0;
                }
                
                .stat-mini-label {
                    font-size: 12px;
                    color: #64748b;
                    display: block;
                    margin-bottom: 4px;
                }
                
                .stat-mini-value {
                    font-size: 18px;
                    font-weight: 700;
                    color: #0f172a;
                    word-break: break-word;
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
                
                .empty-chart {
                    height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    background: #f8fafc;
                    border-radius: 12px;
                }
                
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
                
                .report-period {
                    color: #64748b;
                    font-size: 13px;
                    margin-top: 4px;
                }
                
                .total-revenue {
                    text-align: right;
                }
                
                .total-label {
                    font-size: 12px;
                    color: #64748b;
                    display: block;
                }
                
                .total-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #0f172a;
                }
                
                .revenue-change {
                    display: flex;
                    align-items: center;
                    gap: 4px;
                    font-size: 12px;
                    margin-top: 4px;
                    justify-content: flex-end;
                }
                
                .revenue-change.positive {
                    color: #10b981;
                }
                
                .revenue-change.negative {
                    color: #ef4444;
                }
                
                .change-amount {
                    margin-left: 4px;
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
                    }
                    .total-revenue {
                        text-align: left;
                        width: 100%;
                    }
                    .revenue-change {
                        justify-content: flex-start;
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
                    .header-actions {
                        flex-direction: column;
                        align-items: stretch;
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
                    .stat-mini-card {
                        padding: 12px;
                    }
                    .stat-mini-value {
                        font-size: 16px;
                    }
                }
            `}</style>
        </div>
    );
}

export default RevenueReport;