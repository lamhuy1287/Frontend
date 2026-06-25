// src/pages/admin/Reports/components/ProductReport.jsx
import { useState } from "react";
import { 
    PieChart,
    Pie,
    Cell,
    Tooltip,
    ResponsiveContainer
} from "recharts";
import { 
    FiPackage, 
    FiTrendingUp,
    FiTable,
    FiFileText,
    FiFile,
    FiBarChart2,
    FiAward,
    FiTrendingDown
} from "react-icons/fi";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const CATEGORY_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

function ProductReport({ data, loading, dateRange }) {
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
        top_products = [],
        low_products = [],
        category_sales = []
    } = data;
    
    const {
        total_sold = 0,
        total_revenue = 0,
        unique_products = 0,
        avg_price = 0
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
                ['BÁO CÁO SẢN PHẨM'],
                [`Kỳ báo cáo: ${dateRange?.startDate?.toLocaleDateString("vi-VN") || ''} - ${dateRange?.endDate?.toLocaleDateString("vi-VN") || ''}`],
                [],
                ['Chỉ tiêu', 'Giá trị'],
                ['Tổng sản phẩm đã bán', total_sold],
                ['Doanh thu từ sản phẩm', total_revenue],
                ['Số sản phẩm đã bán (SKU)', unique_products],
                ['Giá bán trung bình', avg_price],
            ];
            const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
            XLSX.utils.book_append_sheet(wb, ws1, 'Tổng quan');
            
            // Sheet 2: Top sản phẩm bán chạy
            if (top_products.length > 0) {
                const topData = [
                    ['STT', 'Tên sản phẩm', 'Số lượng bán', 'Doanh thu', 'Đóng góp (%)'],
                    ...top_products.map((item, index) => [
                        index + 1,
                        item.name,
                        item.sold,
                        item.revenue,
                        item.contribution || 0
                    ])
                ];
                const ws2 = XLSX.utils.aoa_to_sheet(topData);
                XLSX.utils.book_append_sheet(wb, ws2, 'Top sản phẩm');
            }
            
            // Sheet 3: Sản phẩm bán chậm
            if (low_products.length > 0) {
                const lowData = [
                    ['STT', 'Tên sản phẩm', 'Số lượng bán', 'Doanh thu'],
                    ...low_products.map((item, index) => [
                        index + 1,
                        item.name,
                        item.sold,
                        item.revenue
                    ])
                ];
                const ws3 = XLSX.utils.aoa_to_sheet(lowData);
                XLSX.utils.book_append_sheet(wb, ws3, 'Sản phẩm bán chậm');
            }
            
            // Sheet 4: Phân bố theo danh mục
            if (category_sales.length > 0) {
                const categoryData = [
                    ['Danh mục', 'Số lượng bán', 'Tỷ lệ (%)'],
                    ...category_sales.map(item => [
                        item.category_name,
                        item.sold,
                        item.percent || 0
                    ])
                ];
                const ws4 = XLSX.utils.aoa_to_sheet(categoryData);
                XLSX.utils.book_append_sheet(wb, ws4, 'Phân bố theo danh mục');
            }
            
            const fileName = `Bao_cao_san_pham_${new Date().toISOString().split('T')[0]}.xlsx`;
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
            doc.text('BÁO CÁO SẢN PHẨM', pageWidth / 2, 20, { align: 'center' });
            
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
                ['Tổng sản phẩm đã bán', formatNumber(total_sold)],
                ['Doanh thu từ sản phẩm', formatCurrency(total_revenue)],
                ['Số sản phẩm đã bán (SKU)', formatNumber(unique_products)],
                ['Giá bán trung bình', formatCurrency(avg_price)],
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
            
            // 1. Top sản phẩm bán chạy
            if (top_products.length > 0) {
                if (finalY > 230) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('1. TOP 10 SẢN PHẨM BÁN CHẠY', 14, finalY);
                
                const topData = [
                    ['STT', 'Tên sản phẩm', 'Số lượng', 'Doanh thu', 'Đóng góp'],
                    ...top_products.slice(0, 10).map((item, index) => [
                        index + 1,
                        item.name,
                        item.sold,
                        formatCurrency(item.revenue),
                        `${item.contribution || 0}%`
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
                
                finalY = doc.lastAutoTable.finalY + 10;
            }
            
            // 2. Sản phẩm bán chậm
            if (low_products.length > 0) {
                if (finalY > 230) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('2. TOP 10 SẢN PHẨM BÁN CHẬM', 14, finalY);
                
                const lowData = [
                    ['STT', 'Tên sản phẩm', 'Số lượng', 'Doanh thu'],
                    ...low_products.slice(0, 10).map((item, index) => [
                        index + 1,
                        item.name,
                        item.sold,
                        formatCurrency(item.revenue)
                    ])
                ];
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [lowData[0]],
                    body: lowData.slice(1),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] },
                    styles: { fontSize: 8 },
                    margin: { left: 14, right: 14 },
                });
                
                finalY = doc.lastAutoTable.finalY + 10;
            }
            
            // 3. Phân bố theo danh mục
            if (category_sales.length > 0) {
                if (finalY > 230) {
                    doc.addPage();
                    finalY = 20;
                }
                
                doc.setFontSize(14);
                doc.setTextColor(15, 23, 42);
                doc.text('3. PHÂN BỐ THEO DANH MỤC', 14, finalY);
                
                const categoryData = [
                    ['Danh mục', 'Số lượng bán', 'Tỷ lệ (%)'],
                    ...category_sales.map(item => [
                        item.category_name,
                        item.sold,
                        `${item.percent || 0}%`
                    ])
                ];
                
                autoTable(doc, {
                    startY: finalY + 5,
                    head: [categoryData[0]],
                    body: categoryData.slice(1),
                    theme: 'grid',
                    headStyles: { fillColor: [59, 130, 246] },
                    styles: { fontSize: 9 },
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
            
            doc.save(`Bao_cao_san_pham_${new Date().toISOString().split('T')[0]}.pdf`);
            
            setExporting(false);
        } catch (error) {
            console.error('Lỗi xuất PDF:', error);
            setExporting(false);
            alert('Có lỗi xảy ra khi xuất file PDF');
        }
    };

    // Component bảng dữ liệu
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

                {/* Bảng 1: Top sản phẩm bán chạy */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiAward /> Top 10 sản phẩm bán chạy
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên sản phẩm</th>
                                    <th className="text-center">Số lượng bán</th>
                                    <th className="text-right">Doanh thu</th>
                                    <th className="text-center">Đóng góp</th>
                                </tr>
                            </thead>
                            <tbody>
                                {top_products.length > 0 ? (
                                    top_products.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td className="product-name" title={item.name}>{item.name}</td>
                                            <td className="text-center">{formatNumber(item.sold)}</td>
                                            <td className="text-right revenue-cell">{formatCurrency(item.revenue)}</td>
                                            <td className="text-center">
                                                <div className="percent-bar">
                                                    <div 
                                                        className="percent-fill" 
                                                        style={{ 
                                                            width: `${item.contribution || 0}%`,
                                                            background: '#3b82f6'
                                                        }}
                                                    />
                                                    <span className="percent-text">{item.contribution || 0}%</span>
                                                </div>
                                            </td>
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

                {/* Bảng 2: Sản phẩm bán chậm */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiTrendingDown /> Top 10 sản phẩm bán chậm
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Tên sản phẩm</th>
                                    <th className="text-center">Số lượng bán</th>
                                    <th className="text-right">Doanh thu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {low_products.length > 0 ? (
                                    low_products.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td className="product-name" title={item.name}>{item.name}</td>
                                            <td className="text-center">{formatNumber(item.sold)}</td>
                                            <td className="text-right">{formatCurrency(item.revenue)}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">Chưa có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Bảng 3: Phân bố theo danh mục */}
                <div className="table-section">
                    <h4 className="table-title">
                        <FiBarChart2 /> Phân bố sản phẩm theo danh mục
                    </h4>
                    <div className="table-responsive">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>STT</th>
                                    <th>Danh mục</th>
                                    <th className="text-center">Số lượng bán</th>
                                    <th className="text-center">Tỷ lệ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {category_sales.length > 0 ? (
                                    category_sales.map((item, index) => (
                                        <tr key={index}>
                                            <td>{index + 1}</td>
                                            <td>
                                                <span 
                                                    className="category-badge"
                                                    style={{ 
                                                        backgroundColor: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
                                                        color: 'white',
                                                        padding: '4px 12px',
                                                        borderRadius: '20px',
                                                        fontSize: '12px',
                                                        display: 'inline-block'
                                                    }}
                                                >
                                                    {item.category_name}
                                                </span>
                                            </td>
                                            <td className="text-center">{formatNumber(item.sold)}</td>
                                            <td className="text-center">
                                                <span className="percent-badge">{item.percent || 0}%</span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center">Chưa có dữ liệu</td>
                                    </tr>
                                )}
                            </tbody>
                            <tfoot>
                                <tr className="total-row">
                                    <td colSpan="2"><strong>Tổng cộng</strong></td>
                                    <td className="text-center"><strong>{formatNumber(total_sold)}</strong></td>
                                    <td className="text-center"><strong>100%</strong></td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        );
    };
    
    // 4 thẻ thống kê
    const statCards = [
        {
            title: "Tổng SP đã bán",
            value: formatNumber(total_sold),
            unit: "sản phẩm",
            icon: <FiPackage />,
            color: "#3b82f6",
            bgColor: "#eff6ff"
        },
        {
            title: "Doanh thu từ SP",
            value: formatCurrency(total_revenue),
            unit: "",
            icon: <FiTrendingUp />,
            color: "#10b981",
            bgColor: "#ecfdf5"
        },
        {
            title: "Số SP đã bán (SKU)",
            value: formatNumber(unique_products),
            unit: "sản phẩm",
            icon: <FiPackage />,
            color: "#f59e0b",
            bgColor: "#fffbeb"
        },
        {
            title: "Giá bán trung bình",
            value: formatCurrency(avg_price),
            unit: "/sp",
            icon: <FiTrendingUp />,
            color: "#8b5cf6",
            bgColor: "#f5f3ff"
        }
    ];
    
    // Component bảng đơn giản
    const ProductTable = ({ products, title, type }) => {
        return (
            <div className="product-table-container">
                <h3>{title}</h3>
                <table className="product-rank-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Sản phẩm</th>
                            <th>Đã bán</th>
                            <th>Doanh thu</th>
                            {type === 'top' && <th>Đóng góp</th>}
                        </tr>
                    </thead>
                    <tbody>
                        {products.length > 0 ? (
                            products.map((product, idx) => (
                                <tr key={product.id}>
                                    <td className="rank-cell">{idx + 1}</td>
                                    <td className="product-name-cell" title={product.name}>
                                        {product.name}
                                    </td>
                                    <td className="sold-cell">
                                        {formatNumber(product.sold)}
                                    </td>
                                    <td className="revenue-cell">
                                        {formatCurrency(product.revenue)}
                                    </td>
                                    {type === 'top' && (
                                        <td className="percent-cell">
                                            <div className="percent-bar-small">
                                                <div 
                                                    className="percent-fill-small" 
                                                    style={{ width: `${product.contribution || 0}%` }}
                                                />
                                                <span>{product.contribution || 0}%</span>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={type === 'top' ? 5 : 4} className="empty-row">
                                    Chưa có dữ liệu
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        );
    };
    
    // Chuẩn bị dữ liệu cho pie chart
    const pieData = category_sales.map((item, index) => ({
        name: item.category_name,
        value: item.sold,
        percent: item.percent,
        color: CATEGORY_COLORS[index % CATEGORY_COLORS.length]
    }));
    
    return (
        <div className="report-card">
            <div className="report-header">
                <div>
                    <h2 className="report-title">
                        <FiPackage className="report-icon" />
                        Báo cáo sản phẩm
                    </h2>
                    <p className="report-subtitle">
                        Thống kê số lượng bán, doanh thu và hiệu suất sản phẩm
                    </p>
                </div>
                <div className="header-actions">
                    <div className="view-toggle">
                        <button 
                            className={`view-btn ${viewMode === 'chart' ? 'active' : ''}`}
                            onClick={() => setViewMode('chart')}
                        >
                            <FiBarChart2 /> Biểu đồ
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
                    {/* 2 cột: Top sản phẩm và Sản phẩm bán chậm */}
                    <div className="two-columns">
                        <ProductTable 
                            products={top_products} 
                            title="🏆 Top 10 sản phẩm bán chạy" 
                            type="top"
                        />
                        <ProductTable 
                            products={low_products} 
                            title="📉 Top 10 sản phẩm bán chậm" 
                            type="low"
                        />
                    </div>
                    
                    {/* Biểu đồ phân bố theo danh mục */}
                    <div className="chart-container">
                        <h3>Phân bố sản phẩm theo danh mục</h3>
                        <div className="category-chart-wrapper">
                            <div className="pie-chart">
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={pieData}
                                            dataKey="value"
                                            nameKey="name"
                                            cx="50%"
                                            cy="50%"
                                            outerRadius={100}
                                            label={({ name, percent }) => `${name}: ${percent}%`}
                                            labelLine={true}
                                        >
                                            {pieData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip formatter={(value) => [formatNumber(value), "Số lượng"]} />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="category-legend">
                                {pieData.map((item, idx) => (
                                    <div key={idx} className="legend-item">
                                        <div className="legend-color" style={{ backgroundColor: item.color }}></div>
                                        <span className="legend-name">{item.name}</span>
                                        <span className="legend-value">{formatNumber(item.value)}</span>
                                        <span className="legend-percent">({item.percent}%)</span>
                                    </div>
                                ))}
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
                
                .product-table-container {
                    background: #f8fafc;
                    border-radius: 12px;
                    padding: 16px;
                }
                
                .product-table-container h3 {
                    font-size: 16px;
                    font-weight: 600;
                    margin-bottom: 16px;
                    color: #0f172a;
                }
                
                .product-rank-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .product-rank-table th {
                    text-align: left;
                    padding: 10px 8px;
                    background: #e2e8f0;
                    color: #0f172a;
                    font-weight: 600;
                    font-size: 12px;
                }
                
                .product-rank-table td {
                    padding: 10px 8px;
                    border-bottom: 1px solid #e2e8f0;
                    font-size: 13px;
                }
                
                .product-rank-table tr:hover {
                    background: #f1f5f9;
                }
                
                .rank-cell {
                    font-weight: 700;
                    color: #3b82f6;
                    width: 40px;
                }
                
                .product-name-cell {
                    max-width: 150px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .sold-cell {
                    font-weight: 600;
                    color: #3b82f6;
                    width: 80px;
                }
                
                .revenue-cell {
                    font-weight: 600;
                    color: #10b981;
                }
                
                .percent-cell {
                    width: 120px;
                }
                
                .percent-bar-small {
                    position: relative;
                    width: 80px;
                    height: 20px;
                    background: #e2e8f0;
                    border-radius: 10px;
                    overflow: hidden;
                }
                
                .percent-fill-small {
                    height: 100%;
                    background: #3b82f6;
                    border-radius: 10px;
                    transition: width 0.3s;
                }
                
                .percent-bar-small span {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 10px;
                    font-weight: 600;
                    color: #0f172a;
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
                
                .category-chart-wrapper {
                    display: flex;
                    gap: 24px;
                    flex-wrap: wrap;
                }
                
                .pie-chart {
                    flex: 1;
                    min-width: 300px;
                }
                
                .category-legend {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    justify-content: center;
                }
                
                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                
                .legend-color {
                    width: 16px;
                    height: 16px;
                    border-radius: 4px;
                }
                
                .legend-name {
                    flex: 1;
                    font-size: 13px;
                    color: #0f172a;
                }
                
                .legend-value {
                    font-weight: 600;
                    color: #0f172a;
                }
                
                .legend-percent {
                    color: #64748b;
                    font-size: 12px;
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
                
                .category-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    color: white;
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
                
                .total-row {
                    background: #f1f5f9;
                    font-weight: 600;
                }
                
                .total-row td {
                    padding: 12px 16px;
                    border-top: 2px solid #cbd5e1;
                    border-bottom: none;
                }
                
                .product-name {
                    max-width: 200px;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }
                
                .percent-bar {
                    position: relative;
                    width: 100px;
                    height: 24px;
                    background: #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                    margin: 0 auto;
                }
                
                .percent-fill {
                    height: 100%;
                    transition: width 0.3s;
                    border-radius: 12px;
                }
                
                .percent-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    font-size: 11px;
                    font-weight: 600;
                    color: #0f172a;
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
                    .category-chart-wrapper {
                        flex-direction: column;
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
                    .legend-item {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    );
}

export default ProductReport;