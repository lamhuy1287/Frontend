// src/pages/admin/Reports/components/DiscountReport.jsx
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
import { FiTag, FiPercent, FiDollarSign, FiPackage, FiTrendingUp, FiClock } from "react-icons/fi";

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

function DiscountReport({ data, loading }) {
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
                <div className="stats-mini">
                    <div className="stat-badge">
                        <span>Doanh thu từ SP giảm giá</span>
                        <strong>{formatCurrency(total_revenue_from_discounted)}</strong>
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
                                <th>SL bán (có giảm giá)</th>
                                <th>Doanh thu (có giảm giá)</th>
                                <th>Tiền được giảm</th>
                                <th>TB giảm/đơn</th>
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
                                        <td className="sold-cell">{formatNumber(product.sold_with_discount)}</td>
                                        <td className="revenue-cell">{formatCurrency(product.revenue_with_discount)}</td>
                                        <td className="discount-cell">{formatCurrency(product.total_discount)}</td>
                                        <td className="avg-discount-cell">{formatCurrency(avgDiscountPerUnit)}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <div className="empty-table">Chưa có dữ liệu</div>
                )}
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
                
                .sold-cell {
                    font-weight: 600;
                    color: #3b82f6;
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
                }
                
                @media (max-width: 640px) {
                    .stats-mini-grid {
                        grid-template-columns: 1fr;
                    }
                    .report-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .stats-mini {
                        flex-direction: column;
                        width: 100%;
                    }
                    .legend-inline {
                        flex-direction: column;
                        align-items: center;
                    }
                }
            `}</style>
        </div>
    );
}

export default DiscountReport;