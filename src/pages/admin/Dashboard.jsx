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
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis
} from "recharts";

const statusColors = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    shipping: "#0ea5e9",
    completed: "#10b981",
    cancelled: "#ef4444"
};

const currencyFormatter = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0
    }).format(value);

function Dashboard() {
    const [stats, setStats] = useState({
        summary: {
            total_products: 0,
            total_orders: 0,
            total_users: 0,
            total_revenue: 0
        },
        revenue: {
            current_month: 0,
            previous_month: 0,
            growth_percent: 0
        },
        orders_by_month: [],
        status_summary: {},
        revenue_by_month: []
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

    const orderStatusData = Object.entries(stats.status_summary).map(
        ([name, value]) => ({
            name,
            value
        })
    );

    const ordersByMonth = stats.orders_by_month.map((item) => ({
        label: item.label,
        count: item.count
    }));

    const revenueTrendData =
        stats.revenue_by_month && stats.revenue_by_month.length > 0
            ? stats.revenue_by_month.map((item) => ({
                  label: item.label,
                  revenue: item.amount ?? item.total_revenue ?? item.revenue
              }))
            : stats.orders_by_month.map((item) => ({
                  label: item.label,
                  revenue: item.count
              }));

    const hasRevenueTrend =
        stats.revenue_by_month && stats.revenue_by_month.length > 0;

    return (
        <div style={pageStyle}>
            <div style={headerStyle}>
                <h1>Dashboard</h1>
                <p>Bảng điều khiển quản trị viên với số liệu tổng quan và biểu đồ.</p>
            </div>

            <div style={gridStyle}>
                <StatCard title="Sản phẩm" value={stats.summary.total_products} />
                <StatCard title="Đơn hàng" value={stats.summary.total_orders} />
                <StatCard title="Người dùng" value={stats.summary.total_users} />
                <StatCard
                    title="Doanh thu"
                    value={currencyFormatter(stats.summary.total_revenue)}
                />
            </div>

            <div style={secondaryGridStyle}>
                <div style={cardStyle}>
                    <h3>Doanh thu hàng tháng</h3>
                    <div style={metricRowStyle}>
                        <div>
                            <span>Tháng này</span>
                            <strong>{currencyFormatter(stats.revenue.current_month)}</strong>
                        </div>
                        <div>
                            <span>Tháng trước</span>
                            <strong>{currencyFormatter(stats.revenue.previous_month)}</strong>
                        </div>
                        <div>
                            <span>Tăng trưởng</span>
                            <strong
                                style={{
                                    color:
                                        stats.revenue.growth_percent >= 0
                                            ? "#10b981"
                                            : "#ef4444"
                                }}
                            >
                                {stats.revenue.growth_percent}%
                            </strong>
                        </div>
                    </div>
                </div>

                <div style={cardStyle}>
                    <h3>Trạng thái đơn hàng</h3>
                    <ResponsiveContainer width="100%" height={260}>
                        <PieChart>
                            <Pie
                                data={orderStatusData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={4}
                            >
                                {orderStatusData.map((entry) => (
                                    <Cell
                                        key={entry.name}
                                        fill={statusColors[entry.name] || "#8884d8"}
                                    />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [value, "Số lượng"]} />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={chartsGridStyle}>
                <div style={chartCardStyle}>
                    <h3>Đơn hàng theo tháng</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart data={ordersByMonth} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip formatter={(value) => [value, "Đơn hàng"]} />
                            <Bar dataKey="count" fill="#2563eb" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={chartCardStyle}>
                    <h3>{hasRevenueTrend ? "Doanh thu theo tháng" : "Xu hướng đơn hàng"}</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <AreaChart data={revenueTrendData} margin={{ top: 20, right: 20, left: 0, bottom: 20 }}>
                            <defs>
                                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="label" />
                            <YAxis />
                            <Tooltip formatter={(value) => [hasRevenueTrend ? currencyFormatter(value) : value, hasRevenueTrend ? "Doanh thu" : "Đơn hàng"]} />
                            <Area
                                type="monotone"
                                dataKey="revenue"
                                stroke="#0ea5e9"
                                fillOpacity={1}
                                fill="url(#revenueGradient)"
                            />
                            <Line type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={2} dot />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value }) {
    return (
        <div style={cardStyle}>
            <p style={{ color: "#6b7280", marginBottom: "10px" }}>{title}</p>
            <h2 style={{ margin: 0, fontSize: "2rem" }}>{value}</h2>
        </div>
    );
}

const pageStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
    padding: "24px"
};

const headerStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "6px"
};

const gridStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
    gap: "20px"
};

const secondaryGridStyle = {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "20px",
    alignItems: "stretch"
};

const chartsGridStyle = {
    display: "grid",
    gridTemplateColumns: "1.2fr 0.8fr",
    gap: "20px"
};

const metricRowStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: "16px",
    marginTop: "20px"
};

const cardStyle = {
    background: "white",
    padding: "28px",
    borderRadius: "24px",
    boxShadow: "0 5px 20px rgba(0,0,0,0.06)",
    minHeight: "180px"
};

const chartCardStyle = {
    ...cardStyle,
    minHeight: "360px"
};
export default Dashboard;