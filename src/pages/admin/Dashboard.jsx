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

const statusColors = {
    pending: "#f59e0b",
    confirmed: "#3b82f6",
    shipping: "#0ea5e9",
    completed: "#10b981",
    cancelled: "#ef4444",
    return_requested: "#8b5cf6"
};

const currencyFormatter = (value) =>
    new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
        maximumFractionDigits: 0
    }).format(value);

function Dashboard() {
    const [stats, setStats] = useState({
        report_period: {
            from: "",
            to: ""
        },
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
        low_products: [],
        status_summary: {}
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

    const renderStatusLabel = ({ x, y, percent }) => {
        if (x == null || y == null) {
            return null;
        }

        return (
            <text
                x={x}
                y={y}
                fill="#ffffff"
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={12}
                fontWeight={600}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    const ordersByMonth = stats.orders_by_month.map((item) => ({
        label: item.label,
        count: item.count
    }));

    const revenueCompareData =
        stats.revenue_compare?.map((item) => ({
            month: `T${item.month}`,
            previous_year: item.previous_year,
            current_year: item.current_year
        })) || [];

    const dailyRevenueData =
        stats.daily_revenue?.map((item) => ({
            date: item.date.slice(5),
            revenue: item.revenue
        })) || [];

    const formatDate = (date) =>
        date
            ? new Date(date).toLocaleDateString("vi-VN")
            : "";

    const reportRange =
        stats.report_period?.from && stats.report_period?.to
            ? `${formatDate(stats.report_period.from)} → ${formatDate(stats.report_period.to)}`
            : "30 ngày gần nhất";

    const previousYearLabel = stats.previous_year || "Năm trước";
    const currentYearLabel = stats.current_year || "Năm hiện tại";

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

            <div style={gridStyle}>
                <StatCard
                    title="Đơn mới"
                    value={stats.recent_orders.new_orders}
                    subtitle={reportRange}
                />
                <StatCard
                    title="Đơn hoàn"
                    value={stats.recent_orders.returned_orders}
                    subtitle={reportRange}
                />
                <StatCard
                    title="Đơn huỷ"
                    value={stats.recent_orders.cancelled_orders}
                    subtitle={reportRange}
                />
            </div>

            <div style={secondaryGridStyle}>
                <div style={cardStyle}>
                    <h3>Doanh thu</h3>
                    <p style={{ color: "#6b7280", marginTop: "8px", marginBottom: "20px" }}>
                        {reportRange}
                    </p>

                    <div style={metricRowStyle}>
                        <div>
                            <span>30 ngày gần nhất</span>
                            <strong>{currencyFormatter(stats.revenue.last_30_days)}</strong>
                        </div>
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
                                dataKey="count"
                                nameKey="label"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={4}
                                labelLine={false}
                                label={renderStatusLabel}
                            >
                                {orderStatusData.map((entry) => (
                                    <Cell
                                        key={entry.status || entry.label}
                                        fill={statusColors[entry.status] || "#8884d8"}
                                    />
                                ))}
                            </Pie>
                            <Tooltip
                                formatter={(value, name, props) => {
                                    const percent =
                                        props?.payload?.percent ??
                                        props?.payload?.payload?.percent ??
                                        0;
                                    return [`${value} đơn`, `${percent}%`];
                                }}
                            />
                            <Legend verticalAlign="bottom" height={36} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div style={statusTableWrapStyle}>
                        <h4>Trạng thái đơn hàng 30 ngày</h4>
                        <table style={statusTableStyle}>
                            <thead>
                                <tr>
                                    <th style={statusTableHeaderStyle}>Trạng thái</th>
                                    <th style={statusTableHeaderStyle}>Số lượng</th>
                                    <th style={statusTableHeaderStyle}>%</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.order_status_report.map((item) => (
                                    <tr key={item.label}>
                                        <td style={statusTableCellStyle}>{item.label}</td>
                                        <td style={statusTableCellStyle}>{item.count}</td>
                                        <td style={statusTableCellStyle}>{item.percent}%</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <div style={chartCardStyle}>
                <h3>Doanh thu 30 ngày gần nhất</h3>
                <ResponsiveContainer width="100%" height={320}>
                    <AreaChart
                        data={dailyRevenueData}
                        margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                    >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis tickFormatter={(value) => `${Math.round(value / 1000000)}M`} />
                        <Tooltip formatter={(value) => [currencyFormatter(value), "Doanh thu"]} />
                        <Area
                            type="monotone"
                            dataKey="revenue"
                            stroke="#0ea5e9"
                            fill="#0ea5e9"
                            fillOpacity={0.2}
                        />
                    </AreaChart>
                </ResponsiveContainer>
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
                    <h3>So sánh doanh thu 2 năm gần nhất</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart
                            data={revenueCompareData}
                            margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip formatter={(value) => [currencyFormatter(value), "Doanh thu"]} />
                            <Legend verticalAlign="bottom" height={36} />
                            <Bar
                                dataKey="previous_year"
                                name={previousYearLabel}
                                fill="#8884d8"
                                radius={[8, 8, 0, 0]}
                            />
                            <Bar
                                dataKey="current_year"
                                name={currentYearLabel}
                                fill="#2563eb"
                                radius={[8, 8, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div style={bottomGridStyle}>
                <div style={chartCardStyle}>
                    <h3>Top 5 sản phẩm bán chạy</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart
                            data={stats.top_products}
                            layout="vertical"
                            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={170} />
                            <Tooltip formatter={(value) => [value, "Đã bán"]} />
                            <Bar dataKey="sold" fill="#2563eb" radius={[8, 0, 0, 8]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                <div style={chartCardStyle}>
                    <h3>Top 5 sản phẩm bán chậm</h3>
                    <ResponsiveContainer width="100%" height={320}>
                        <BarChart
                            data={stats.low_products}
                            layout="vertical"
                            margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis type="number" />
                            <YAxis type="category" dataKey="name" width={170} />
                            <Tooltip formatter={(value) => [value, "Đã bán"]} />
                            <Bar dataKey="sold" fill="#f59e0b" radius={[8, 0, 0, 8]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}

function StatCard({ title, value, subtitle }) {
    return (
        <div style={cardStyle}>
            <p style={{ color: "#6b7280", marginBottom: "10px" }}>{title}</p>
            {subtitle && (
                <p style={{ color: "#9ca3af", fontSize: "0.95rem", marginBottom: "12px" }}>
                    {subtitle}
                </p>
            )}
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

const bottomGridStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "20px"
};

const metricRowStyle = {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
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

const statusTableWrapStyle = {
    marginTop: "24px"
};

const statusTableStyle = {
    width: "100%",
    borderCollapse: "collapse",
    marginTop: "12px"
};

const statusTableHeaderStyle = {
    textAlign: "left",
    padding: "12px",
    borderBottom: "2px solid #e5e7eb"
};

const statusTableCellStyle = {
    padding: "12px",
    borderBottom: "1px solid #e5e7eb"
};

export default Dashboard;