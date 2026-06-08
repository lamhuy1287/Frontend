import { useEffect, useState } from "react";
import { getDashboard } from "../../services/adminService";
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Legend,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";
import {
    FiPackage,
    FiShoppingCart,
    FiUsers,
    FiDollarSign,
    FiTrendingUp,
    FiTrendingDown,
    FiCalendar,
    FiClock,
    FiAward,
    FiList
} from "react-icons/fi";

const statusColors = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    shipping: "#06b6d4",
    completed: "#10b981",
    cancelled: "#ef4444",
    return_requested: "#8b5cf6"
};

const statusLabels = {
    pending: "Chờ xử lý",
    confirmed: "Đã xác nhận",
    shipping: "Đang giao",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    return_requested: "Yêu cầu hoàn trả"
};

const currencyFormatter = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0
    }).format(value || 0);

// Hàm cắt ngắn tên sản phẩm
const truncateProductName = (name, maxLength = 25) => {
    if (!name) return "";
    return name.length > maxLength ? name.substring(0, maxLength) + "..." : name;
};

function Dashboard() {
    const [stats, setStats] = useState({
        report_period: { from: "", to: "" },
        summary: {
            total_products: 0,
            total_orders: 0,
            total_users: 0,
            total_revenue: 0
        },
        revenue: {
            current_month: 0,
            previous_month: 0,
            last_30_days: 0,
            growth_percent: 0
        },
        recent_orders: {
            new_orders: 0,
            returned_orders: 0,
            cancelled_orders: 0
        },
        orders_by_month: [],
        revenue_compare: [],
        daily_revenue: [],
        order_status_report: [],
        top_products: [],
        low_products: []
    });

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            const data = await getDashboard();
            setStats(data);
        } catch (err) {
            console.error(err);
        }
    };

    const orderStatusData = stats.order_status_report || [];
    const ordersByMonth = stats.orders_by_month?.map((item) => ({
        label: item.label,
        count: item.count
    })) || [];

    const revenueCompareData = stats.revenue_compare?.map((item) => ({
        month: `T${item.month}`,
        previous_year: item.previous_year,
        current_year: item.current_year
    })) || [];

    const dailyRevenueData = stats.daily_revenue?.map((item) => ({
        date: item.date.slice(5),
        revenue: item.revenue
    })) || [];

    return (
        <div className="dashboard-container">
            {/* Header Section */}
            <div className="header-section">
                <div className="header-left">
                    <div className="welcome-badge">
                        <FiAward className="welcome-icon" />
                        <span>ADMIN PANEL</span>
                    </div>
                    <h1 className="header-title">Tổng quan hệ thống</h1>
                    <p className="header-description">
                        Theo dõi doanh thu, đơn hàng và hiệu suất bán hàng theo thời gian thực
                    </p>
                </div>
                <div className="revenue-card">
                    <div className="revenue-header">
                        <FiCalendar className="revenue-icon" />
                        <span>Doanh thu 30 ngày</span>
                    </div>
                    <h2 className="revenue-amount">
                        {currencyFormatter(stats.revenue.last_30_days)}
                    </h2>
                    <div className={`growth-badge ${stats.revenue.growth_percent >= 0 ? 'positive' : 'negative'}`}>
                        {stats.revenue.growth_percent >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                        <span>{Math.abs(stats.revenue.growth_percent)}%</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <StatCard
                    title="Tổng sản phẩm"
                    value={stats.summary.total_products}
                    icon={<FiPackage />}
                    gradient="linear-gradient(135deg, #3b82f6, #2563eb)"
                />
                <StatCard
                    title="Tổng đơn hàng"
                    value={stats.summary.total_orders}
                    icon={<FiShoppingCart />}
                    gradient="linear-gradient(135deg, #06b6d4, #0891b2)"
                />
                <StatCard
                    title="Khách hàng"
                    value={stats.summary.total_users}
                    icon={<FiUsers />}
                    gradient="linear-gradient(135deg, #8b5cf6, #7c3aed)"
                />
                <StatCard
                    title="Tổng doanh thu"
                    value={currencyFormatter(stats.summary.total_revenue)}
                    icon={<FiDollarSign />}
                    gradient="linear-gradient(135deg, #10b981, #059669)"
                />
            </div>

            {/* Order Status Cards - Hiển thị tất cả trạng thái đơn hàng */}
            <div className="card full-width">
                <div className="card-header">
                    <h3 className="card-title">
                        <FiList className="inline-icon" />
                        Tất cả trạng thái đơn hàng
                    </h3>
                    <div className="date-range">
                        <FiClock />
                        <span>{`${formatDate(stats.report_period?.from)} → ${formatDate(stats.report_period?.to)}`}</span>
                    </div>
                </div>
                <div className="all-status-grid">
                    {orderStatusData.map((status) => (
                        <OrderStatusCard
                            key={status.status}
                            label={statusLabels[status.status]}
                            value={status.count}
                            color={statusColors[status.status]}
                        />
                    ))}
                </div>
            </div>

            {/* Revenue Trend - Hàng 1 */}
            <div className="card full-width">
                <div className="card-header">
                    <div>
                        <h3 className="card-title">Xu hướng doanh thu</h3>
                        <p className="card-subtitle">Biến động doanh thu theo ngày trong 30 ngày gần nhất</p>
                    </div>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <AreaChart data={dailyRevenueData}>
                        <defs>
                            <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                        <XAxis dataKey="date" stroke="#94a3b8"/>
                        <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}M`} stroke="#94a3b8"/>
                        <Tooltip formatter={(value) => [currencyFormatter(value), "Doanh thu"]}/>
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#3b82f6"
                            strokeWidth={3}
                            fill="url(#revenueGradient)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            {/* Orders by Month - Hàng 2 */}
            <div className="card full-width">
                <div className="card-header">
                    <h3 className="card-title">Đơn hàng theo tháng</h3>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={ordersByMonth}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                        <XAxis dataKey="label" stroke="#94a3b8"/>
                        <YAxis stroke="#94a3b8"/>
                        <Tooltip />
                        <Bar dataKey="count" fill="#3b82f6" radius={[8, 8, 0, 0]}>
                            {ordersByMonth.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill="#3b82f6" />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Revenue Comparison - Hàng 3 */}
            <div className="card full-width">
                <div className="card-header">
                    <h3 className="card-title">So sánh doanh thu theo năm</h3>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={revenueCompareData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                        <XAxis dataKey="month" stroke="#94a3b8"/>
                        <YAxis stroke="#94a3b8"/>
                        <Tooltip formatter={(value) => [currencyFormatter(value), "Doanh thu"]}/>
                        <Legend />
                        <Bar dataKey="previous_year" fill="#94a3b8" radius={[8, 8, 0, 0]} name="Năm trước"/>
                        <Bar dataKey="current_year" fill="#3b82f6" radius={[8, 8, 0, 0]} name="Năm nay"/>
                    </BarChart>
                </ResponsiveContainer>
            </div>

            {/* Product Tables */}
            <div className="two-column-grid">
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            <FiAward className="inline-icon" />
                            Top sản phẩm bán chạy
                        </h3>
                    </div>
                    <ProductTable products={stats.top_products} type="top" />
                </div>

                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">
                            Top sản phẩm bán chậm
                        </h3>
                    </div>
                    <ProductTable products={stats.low_products} type="low" />
                </div>
            </div>

            <style jsx>{`
                .dashboard-container {
                    padding: 28px;
                    background: linear-gradient(135deg, #f5f7fa 0%, #f8fafc 100%);
                    min-height: 100vh;
                }

                .header-section {
                    background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
                    border-radius: 28px;
                    padding: 36px;
                    margin-bottom: 28px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    box-shadow: 0 20px 35px -10px rgba(0,0,0,0.1);
                }

                .header-left {
                    flex: 1;
                }

                .welcome-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.1);
                    padding: 6px 14px;
                    border-radius: 100px;
                    margin-bottom: 16px;
                }

                .welcome-icon {
                    color: #3b82f6;
                }

                .welcome-badge span {
                    color: #94a3b8;
                    font-size: 0.8rem;
                    font-weight: 600;
                    letter-spacing: 1px;
                }

                .header-title {
                    color: white;
                    font-size: 2rem;
                    margin-bottom: 8px;
                    font-weight: 700;
                }

                .header-description {
                    color: #94a3b8;
                    max-width: 450px;
                    line-height: 1.5;
                    font-size: 0.9rem;
                }

                .revenue-card {
                    background: rgba(255,255,255,0.05);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    padding: 24px;
                    min-width: 280px;
                    border: 1px solid rgba(255,255,255,0.1);
                }

                .revenue-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: #94a3b8;
                    margin-bottom: 12px;
                    font-size: 0.9rem;
                }

                .revenue-icon {
                    color: #3b82f6;
                }

                .revenue-amount {
                    color: white;
                    font-size: 1.8rem;
                    margin-bottom: 16px;
                    font-weight: 700;
                }

                .growth-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: 6px;
                    padding: 6px 14px;
                    border-radius: 100px;
                    font-weight: 600;
                    font-size: 0.85rem;
                }

                .growth-badge.positive {
                    background: rgba(16, 185, 129, 0.2);
                    color: #10b981;
                }

                .growth-badge.negative {
                    background: rgba(239, 68, 68, 0.2);
                    color: #ef4444;
                }

                .stats-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                    gap: 20px;
                    margin-bottom: 28px;
                }

                .two-column-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 20px;
                    margin-bottom: 28px;
                }

                .full-width {
                    grid-column: 1 / -1;
                    margin-bottom: 28px;
                }

                .card {
                    background: white;
                    border-radius: 20px;
                    padding: 28px;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                    transition: all 0.3s ease;
                }

                .card:hover {
                    box-shadow: 0 12px 20px -8px rgba(0,0,0,0.1);
                    transform: translateY(-2px);
                }

                .card-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 24px;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .card-title {
                    font-size: 1.2rem;
                    font-weight: 700;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin: 0;
                }

                .card-subtitle {
                    color: #64748b;
                    font-size: 0.8rem;
                    margin-top: 4px;
                }

                .date-range {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    color: #64748b;
                    font-size: 0.85rem;
                    background: #f8fafc;
                    padding: 6px 12px;
                    border-radius: 12px;
                }

                .inline-icon {
                    color: #3b82f6;
                }

                .all-status-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
                    gap: 16px;
                }

                @media (max-width: 768px) {
                    .dashboard-container {
                        padding: 16px;
                    }
                    .header-section {
                        flex-direction: column;
                        gap: 20px;
                        padding: 24px;
                    }
                    .revenue-card {
                        width: 100%;
                    }
                    .two-column-grid {
                        grid-template-columns: 1fr;
                    }
                    .all-status-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }
            `}</style>
        </div>
    );
}

function StatCard({ title, value, icon, gradient }) {
    return (
        <div className="stat-card">
            <div className="stat-icon" style={{ background: gradient }}>
                {icon}
            </div>
            <div className="stat-info">
                <p className="stat-title">{title}</p>
                <h3 className="stat-value">{value}</h3>
            </div>
            <style jsx>{`
                .stat-card {
                    background: white;
                    border-radius: 20px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.04);
                }
                
                .stat-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 12px 20px -8px rgba(0,0,0,0.1);
                }
                
                .stat-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 24px;
                    color: white;
                }
                
                .stat-info {
                    flex: 1;
                }
                
                .stat-title {
                    color: #64748b;
                    font-size: 0.8rem;
                    margin-bottom: 6px;
                }
                
                .stat-value {
                    color: #0f172a;
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin: 0;
                }
            `}</style>
        </div>
    );
}

function OrderStatusCard({ label, value, color }) {
    return (
        <div className="order-status-card">
            <div className="status-header">
                <div className="status-dot" style={{ background: color }}></div>
                <span className="status-label">{label}</span>
            </div>
            <div className="status-value" style={{ color }}>
                {value}
            </div>
            <style jsx>{`
                .order-status-card {
                    background: #f8fafc;
                    border-radius: 16px;
                    padding: 20px;
                    transition: all 0.3s ease;
                    cursor: pointer;
                }
                
                .order-status-card:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 8px 16px -6px rgba(0,0,0,0.1);
                    background: #f1f5f9;
                }
                
                .status-header {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 12px;
                }
                
                .status-dot {
                    width: 10px;
                    height: 10px;
                    border-radius: 50%;
                }
                
                .status-label {
                    color: #64748b;
                    font-size: 0.85rem;
                    font-weight: 500;
                }
                
                .status-value {
                    font-size: 2rem;
                    font-weight: 800;
                    line-height: 1;
                }
            `}</style>
        </div>
    );
}

function ProductTable({ products, type }) {
    return (
        <div className="product-table-container">
            <table className="product-table">
                <thead>
                    <tr>
                        <th>Sản phẩm</th>
                        <th>Đã bán</th>
                    </tr>
                </thead>
                <tbody>
                    {products?.map((product, index) => (
                        <tr key={index}>
                            <td className="product-name" title={product.name}>
                                {truncateProductName(product.name, 25)}
                            </td>
                            <td className={`product-sold ${type}`}>{product.sold}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <style jsx>{`
                .product-table-container {
                    overflow-x: auto;
                }
                
                .product-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                .product-table th {
                    text-align: left;
                    padding: 12px 8px;
                    color: #64748b;
                    font-weight: 600;
                    font-size: 0.8rem;
                    border-bottom: 2px solid #e2e8f0;
                }
                
                .product-table td {
                    padding: 12px 8px;
                    border-bottom: 1px solid #f1f5f9;
                }
                
                .product-name {
                    font-weight: 500;
                    color: #0f172a;
                    font-size: 0.85rem;
                }
                
                .product-sold {
                    font-weight: 700;
                }
                
                .product-sold.top {
                    color: #10b981;
                }
                
                .product-sold.low {
                    color: #f59e0b;
                }
                
                .product-table tbody tr:hover {
                    background: #f8fafc;
                }
            `}</style>
        </div>
    );
}

// Helper function
function formatDate(date) {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
}

export default Dashboard;