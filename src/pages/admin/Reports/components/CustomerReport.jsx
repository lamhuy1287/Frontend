// src/pages/admin/Reports/components/CustomerReport.jsx
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
import { FiUsers, FiUserPlus, FiUserCheck, FiTrendingUp, FiDollarSign, FiShoppingCart } from "react-icons/fi";

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

function CustomerReport({ data, loading }) {
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
            
            {/* Biểu đồ khách hàng mới theo ngày */}
            <div className="chart-container">
                <h3>Khách hàng mới theo ngày</h3>
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
                    <h3>Phân khúc khách hàng</h3>
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
                </div>
            </div>
            
            {/* Bảng top khách hàng */}
            <div className="data-table-wrapper">
                <h3>🏆 Top khách hàng mua nhiều nhất</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Tên khách hàng</th>
                            <th>Email</th>
                            <th>Số đơn hàng</th>
                            <th>Tổng chi tiêu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {top_customers.length > 0 ? (
                            top_customers.map((customer, idx) => (
                                <tr key={idx}>
                                    <td>{idx + 1}</td>
                                    <td><strong>{customer.name}</strong></td>
                                    <td>{customer.email}</td>
                                    <td>{customer.order_count}</td>
                                    <td className="revenue-cell">{formatCurrency(customer.total_spent)}</td>
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
            
            {/* Bảng chi tiết phân khúc */}
            <div className="data-table-wrapper">
                <h3>Chi tiết phân khúc khách hàng</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Phân khúc</th>
                            <th>Số lượng</th>
                            <th>Tỷ lệ</th>
                        </tr>
                    </thead>
                    <tbody>
                        {customer_segments.map((segment) => (
                            <tr key={segment.segment}>
                                <td>
                                    <span 
                                        className="segment-badge" 
                                        style={{ 
                                            backgroundColor: SEGMENT_COLORS[segment.segment],
                                            color: "white",
                                            padding: "4px 12px",
                                            borderRadius: "20px",
                                            fontSize: "12px",
                                            display: "inline-block"
                                        }}
                                    >
                                        {SEGMENT_LABELS[segment.segment]}
                                    </span>
                                </td>
                                <td className="count-cell">{formatNumber(segment.count)}</td>
                                <td>
                                    <div className="percent-bar">
                                        <div 
                                            className="percent-fill" 
                                            style={{ 
                                                width: `${segment.percent}%`,
                                                backgroundColor: SEGMENT_COLORS[segment.segment]
                                            }}
                                        />
                                        <span className="percent-text">{segment.percent}%</span>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                    {/* <tfoot>
                        <tr className="total-row">
                            <td><strong>Tổng cộng</strong></td>
                            <td><strong>{formatNumber(total_customers)}</strong></td>
                            <td><strong>100%</strong></td>
                        </tr>
                    </tfoot> */}
                </table>
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
                
                .percent-bar {
                    position: relative;
                    width: 120px;
                    height: 24px;
                    background: #e2e8f0;
                    border-radius: 12px;
                    overflow: hidden;
                }
                
                .percent-fill {
                    height: 100%;
                    transition: width 0.3s;
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
                
                .empty-chart {
                    height: 300px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: #94a3b8;
                    background: #f8fafc;
                    border-radius: 12px;
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
                }
            `}</style>
        </div>
    );
}

export default CustomerReport;