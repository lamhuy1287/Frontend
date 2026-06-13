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
    FiTrendingUp
} from "react-icons/fi";

const CATEGORY_COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

function ProductReport({ data, loading }) {
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
    
    // Component bảng đơn giản (không có nút xem chi tiết)
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
                    border-radius: 0px;
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
                    border-radius: 0px;
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
                    width: 110px;
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
                }
                
                @media (max-width: 640px) {
                    .stats-mini-grid {
                        grid-template-columns: 1fr;
                    }
                    .report-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            `}</style>
        </div>
    );
}

export default ProductReport;