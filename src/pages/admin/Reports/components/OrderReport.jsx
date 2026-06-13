// src/pages/admin/Reports/components/OrderReport.jsx
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from "recharts";
import { FiShoppingCart, FiClock, FiCheckCircle, FiXCircle, FiTruck } from "react-icons/fi";

const STATUS_COLORS = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    shipping: "#06b6d4",
    completed: "#10b981",
    cancelled: "#ef4444",
    return_requested: "#8b5cf6"
};

const STATUS_LABELS = {
    pending: "Chờ xác nhận",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    return_requested: "Yêu cầu hoàn trả"
};

const STATUS_ORDER = ["pending", "confirmed", "shipping", "completed", "cancelled", "return_requested"];

function OrderReport({ data, loading }) {
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
        orders_by_status = [],
        orders_by_date = [],
        total_orders = 0,
        average_order_value = 0,
        processing_time = {
            avg_confirmation_hours: 0
        },
        summary = {}
    } = data;
    
    const {
        pending = 0,
        confirmed = 0,
        shipping = 0,
        completed = 0,
        cancelled = 0,
        returned = 0
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
    
    // Sắp xếp dữ liệu theo thứ tự
    const sortedStatusData = [...orders_by_status].sort((a, b) => {
        return STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status);
    });
    
    // Chuẩn bị dữ liệu cho pie chart
    const pieData = sortedStatusData.map(item => ({
        name: STATUS_LABELS[item.status] || item.status,
        value: item.count,
        status: item.status
    }));
    
    // 4 thẻ thống kê
    const statCards = [
        {
            title: "Tổng đơn hàng",
            value: formatNumber(total_orders),
            icon: <FiShoppingCart />,
            color: "#3b82f6",
            bgColor: "#eff6ff"
        },
        {
            title: "Đã xác nhận",
            value: formatNumber(confirmed),
            icon: <FiCheckCircle />,
            color: "#3b82f6",
            bgColor: "#eff6ff"
        },
        {
            title: "Đang giao hàng",
            value: formatNumber(shipping),
            icon: <FiTruck />,
            color: "#06b6d4",
            bgColor: "#ecfeff"
        },
        {
            title: "Giao thành công",
            value: formatNumber(completed),
            icon: <FiCheckCircle />,
            color: "#10b981",
            bgColor: "#ecfdf5"
        }
    ];
    
    return (
        <div className="report-card">
            <div className="report-header">
                <div>
                    <h2 className="report-title">
                        <FiShoppingCart className="report-icon" />
                        Báo cáo đơn hàng
                    </h2>
                    <p className="report-subtitle">
                        Thống kê số lượng đơn hàng, trạng thái và hiệu suất xử lý
                    </p>
                </div>
                {/* <div className="stats-mini">
                    <div className="stat-badge">
                        <span>Giá trị đơn TB</span>
                        <strong>{formatCurrency(average_order_value)}</strong>
                    </div>
                    <div className="stat-badge">
                        <span>Thời gian xác nhận</span>
                        <strong>{processing_time.avg_confirmation_hours || 0} giờ</strong>
                    </div>
                </div> */}
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
            
            {/* Biểu đồ đơn hàng theo ngày */}
            <div className="chart-container">
                <h3>Đơn hàng theo ngày</h3>
                <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={orders_by_date}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip 
                            formatter={(value) => [value, "Đơn hàng"]}
                            labelFormatter={(label) => `Ngày ${label}`}
                        />
                        <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Số đơn hàng" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
            
            {/* 2 cột: Phân bố trạng thái và Thời gian xác nhận */}
            <div className="two-columns">
                <div className="chart-container">
                    <h3>Phân bố theo trạng thái</h3>
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
                                            fill={STATUS_COLORS[entry.status] || "#94a3b8"} 
                                        />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => [value, "Đơn hàng"]} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="empty-chart">Không có dữ liệu</div>
                    )}
                </div>
                
                <div className="chart-container">
                    <h3>
                        <FiClock className="inline-icon" />
                        Thời gian xác nhận đơn hàng
                    </h3>
                    <div className="processing-time-card">
                        <div className="time-item">
                            <div className="time-icon">⏱️</div>
                            <div className="time-info">
                                <span className="time-label">Xác nhận đơn hàng</span>
                                <span className="time-value">
                                    {processing_time.avg_confirmation_hours || 0} giờ
                                </span>
                                <span className="time-desc">
                                    Từ lúc đặt hàng đến khi được xác nhận
                                </span>
                            </div>
                        </div>
                        <div className="time-note">
                            * Thời gian vận chuyển sẽ được cập nhật sau khi có dữ liệu
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Bảng chi tiết trạng thái */}
            <div className="data-table-wrapper">
                <h3>Chi tiết đơn hàng theo trạng thái</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Trạng thái</th>
                            <th>Số lượng</th>
                            <th>Doanh thu</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedStatusData.map((item) => (
                            <tr key={item.status}>
                                <td>
                                    <span 
                                        className="status-badge" 
                                        style={{ backgroundColor: STATUS_COLORS[item.status] }}
                                    >
                                        {STATUS_LABELS[item.status] || item.status}
                                    </span>
                                </td>
                                <td className="count-cell">{formatNumber(item.count)}</td>
                                <td className="revenue-cell">{formatCurrency(item.revenue)}</td>
                            </tr>
                        ))}
                    </tbody>
                    {/* <tfoot>
                        <tr className="total-row">
                            <td><strong>Tổng cộng</strong></td>
                            <td><strong>{formatNumber(total_orders)}</strong></td>
                            <td><strong>{formatCurrency(orders_by_status.reduce((sum, item) => sum + (item.revenue || 0), 0))}</strong></td>
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
                
                .processing-time-card {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 20px;
                    height: 300px;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                }
                
                .time-item {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    margin-bottom: 24px;
                }
                
                .time-icon {
                    font-size: 48px;
                }
                
                .time-info {
                    flex: 1;
                }
                
                .time-label {
                    font-size: 14px;
                    color: #64748b;
                    display: block;
                    margin-bottom: 4px;
                }
                
                .time-value {
                    font-size: 28px;
                    font-weight: 700;
                    color: #0f172a;
                    display: block;
                }
                
                .time-desc {
                    font-size: 11px;
                    color: #94a3b8;
                    display: block;
                    margin-top: 4px;
                }
                
                .time-note {
                    text-align: center;
                    font-size: 12px;
                    color: #94a3b8;
                    padding-top: 16px;
                    border-top: 1px solid #e2e8f0;
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
                
                .status-badge {
                    display: inline-block;
                    padding: 4px 12px;
                    border-radius: 20px;
                    color: white;
                    font-size: 12px;
                    font-weight: 500;
                }
                
                .count-cell {
                    font-weight: 600;
                    color: #0f172a;
                }
                
                .revenue-cell {
                    font-weight: 600;
                    color: #10b981;
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
                
                .inline-icon {
                    display: inline;
                    margin-right: 4px;
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

export default OrderReport;