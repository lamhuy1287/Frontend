// src/pages/admin/Reports/components/CouponReport.jsx
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
import { FiTag, FiPercent, FiDollarSign, FiShoppingCart, FiTrendingUp, FiClock } from "react-icons/fi";

function CouponReport({ data, loading }) {
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
            
            {/* Bảng Top mã giảm giá được sử dụng nhiều nhất */}
            <div className="data-table-wrapper">
                <h3>🏆 Top 10 mã giảm giá được sử dụng nhiều nhất</h3>
                {top_coupons.length > 0 ? (
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Mã giảm giá</th>
                                <th>Số lần dùng</th>
                                <th>Tổng giảm giá</th>
                                <th>Giảm TB/lần</th>
                            </tr>
                        </thead>
                        <tbody>
                            {top_coupons.map((coupon, idx) => (
                                <tr key={coupon.code}>
                                    <td className="rank-cell">{idx + 1}</td>
                                    <td className="code-cell">
                                        <span className="coupon-code">{coupon.code}</span>
                                    </td>
                                    <td className="usage-cell">{formatNumber(coupon.usage_count)}</td>
                                    <td className="discount-cell">{formatCurrency(coupon.total_discount)}</td>
                                    <td className="avg-cell">{formatCurrency(coupon.avg_discount_per_order)}</td>
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
                                <th>Giá trị</th>
                                <th>Đơn tối thiểu</th>
                                <th>Số lần dùng</th>
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
                                    <td className="value-cell">
                                        {coupon.discount_type === 'percent' 
                                            ? `${coupon.discount_value}%` 
                                            : formatCurrency(coupon.discount_value)}
                                    </td>
                                    <td className="min-order-cell">
                                        {coupon.min_order_value ? formatCurrency(coupon.min_order_value) : '—'}
                                    </td>
                                    <td className="usage-limit-cell">
                                        {coupon.used_count}/{coupon.usage_limit || '∞'}
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
                
                .usage-cell {
                    font-weight: 600;
                    color: #3b82f6;
                }
                
                .discount-cell {
                    font-weight: 600;
                    color: #ef4444;
                }
                
                .avg-cell {
                    font-weight: 600;
                    color: #10b981;
                }
                
                .type-cell {
                    font-weight: 500;
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

export default CouponReport;