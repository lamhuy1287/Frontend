// src/pages/admin/Reports/components/RevenueReport.js
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
import { FiTrendingUp, FiTrendingDown, FiDollarSign, FiShoppingCart, FiPackage } from "react-icons/fi";

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4", "#ec4899"];

function RevenueReport({ data, loading, dateRange, compareMode }) {
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
            
            {/* Biểu đồ doanh thu theo ngày */}
            <div className="chart-container">
                <h3>Doanh thu theo ngày</h3>
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
            
            {/* 2 cột: Doanh thu theo danh mục và phương thức thanh toán */}
            <div className="two-columns">
                <div className="chart-container">
                    <h3>Doanh thu theo danh mục</h3>
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
                                    label={({ category_name, percent }) => `${category_name}: ${percent}%`}
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
                
                <div className="chart-container">
                    <h3>Doanh thu theo phương thức thanh toán</h3>
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
            
            <style jsx>{`
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
                }
                
                @media (max-width: 640px) {
                    .stats-mini-grid {
                        grid-template-columns: 1fr;
                    }
                    .report-header {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                    .total-revenue {
                        text-align: left;
                    }
                }
            `}</style>
        </div>
    );
}

export default RevenueReport;