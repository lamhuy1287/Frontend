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
    FiList,
    FiRefreshCw
} from "react-icons/fi";
import socket from "../../socket";
import toast from "react-hot-toast";
import "./Dashboard.css";
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

const formatDate = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleDateString("vi-VN");
};

const formatDateTime = (date) => {
    if (!date) return "";
    return new Date(date).toLocaleString("vi-VN");
};

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
            today: 0,
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
    
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [lastUpdate, setLastUpdate] = useState(new Date());
    const [newOrderAlert, setNewOrderAlert] = useState(null);

    useEffect(() => {
        loadDashboard();
        
        const handleNewOrder = (order) => {
            console.log("📦 Đơn hàng mới:", order);
            
            setNewOrderAlert({
                id: order.id,
                customer: order.customer_name,
                amount: order.total_price,
                timestamp: new Date()
            });
            
            setTimeout(() => setNewOrderAlert(null), 5000);
            refreshDashboard();
        };
        
        const handleOrderUpdated = (updatedOrder) => {
            console.log("🔄 Đơn hàng cập nhật:", updatedOrder);
            toast.info(`Đơn hàng #${updatedOrder.order_id} đã chuyển sang trạng thái mới`, {
                duration: 5000,
                position: "top-right"
            });
            refreshDashboard();
        };
        
        const handleNewProduct = (product) => {
            console.log("🆕 Sản phẩm mới:", product);
            toast.success(`Sản phẩm mới: ${product.name}`, {
                duration: 5000,
                position: "top-right"
            });
            refreshDashboard();
        };
        
        const handleStockUpdated = (data) => {
            console.log("📦 Cập nhật tồn kho:", data);
            if (data.stock <= 5) {
                toast.error(`⚠️ Sản phẩm ${data.product_name} sắp hết hàng! Còn ${data.stock} sản phẩm`, {
                    duration: 10000,
                    position: "top-right",
                    icon: "⚠️"
                });
            }
            refreshDashboard();
        };
        
        const handleNewCustomer = (user) => {
            console.log("👤 Khách hàng mới:", user);
            toast.success(`Chào mừng khách hàng mới: ${user.name}`, {
                duration: 5000,
                position: "top-right"
            });
            refreshDashboard();
        };
        
        const handleRevenueSpike = (data) => {
            console.log("📈 Doanh thu tăng đột biến:", data);
            toast.success(`📈 Doanh thu hôm nay tăng ${data.growth_percent}% so với hôm qua!`, {
                duration: 7000,
                position: "top-right",
                icon: "🚀"
            });
        };
        
        socket.on("new_order", handleNewOrder);
        socket.on("order_updated", handleOrderUpdated);
        socket.on("product_created", handleNewProduct);
        socket.on("stock_updated", handleStockUpdated);
        socket.on("new_customer_registered", handleNewCustomer);
        socket.on("revenue_spike", handleRevenueSpike);
        
        return () => {
            socket.off("new_order", handleNewOrder);
            socket.off("order_updated", handleOrderUpdated);
            socket.off("product_created", handleNewProduct);
            socket.off("stock_updated", handleStockUpdated);
            socket.off("new_customer_registered", handleNewCustomer);
            socket.off("revenue_spike", handleRevenueSpike);
        };
    }, []);

    const loadDashboard = async () => {
        try {
            const data = await getDashboard();
            setStats(data);
            setLastUpdate(new Date());
        } catch (err) {
            console.error(err);
            toast.error("Không thể tải dữ liệu dashboard");
        }
    };
    
    const refreshDashboard = async () => {
        setIsRefreshing(true);
        await loadDashboard();
        setIsRefreshing(false);
    };

    const orderStatusData = stats.order_status_report || [];
    const ordersByMonth = stats.orders_by_month?.map((item) => ({
        label: item.label,
        count: item.count
    })) || [];

    const revenueCompareData = stats.revenue_compare?.map((item) => {
        const currentYear = new Date().getFullYear();
        const previousYear = currentYear - 1;
        
        return {
            month: `T${item.month}`,
            [previousYear]: item.previous_year || 0,
            [currentYear]: item.current_year || 0
        };
    }) || [];

    const dailyRevenueData = stats.daily_revenue?.map((item) => ({
        date: item.date.slice(5),
        revenue: item.revenue
    })) || [];

    return (
        <div className="dashboard-container">
            {newOrderAlert && (
                <div className="new-order-floating-alert">
                    <div className="alert-content">
                        <div className="alert-icon">🛒</div>
                        <div className="alert-info">
                            <h4>Đơn hàng mới!</h4>
                            <p>#{newOrderAlert.id} - {newOrderAlert.customer}</p>
                            <small>{currencyFormatter(newOrderAlert.amount)}</small>
                        </div>
                    </div>
                </div>
            )}
            
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
                    <div className="update-info">
                        <FiClock className="update-icon" />
                        <span>Cập nhật lần cuối: {formatDateTime(lastUpdate)}</span>
                        <button 
                            className={`refresh-btn ${isRefreshing ? 'refreshing' : ''}`}
                            onClick={refreshDashboard}
                            disabled={isRefreshing}
                        >
                            <FiRefreshCw className={isRefreshing ? 'spin' : ''} />
                            {isRefreshing ? 'Đang tải...' : 'Làm mới'}
                        </button>
                    </div>
                </div>
                <div className="revenue-card">
                    <div className="revenue-header">
                        <FiCalendar className="revenue-icon" />
                        <span>Doanh thu hôm nay</span>
                    </div>
                    <h2 className="revenue-amount">
                        {currencyFormatter(stats.revenue.today || 0)}
                    </h2>
                    <div className="revenue-compare">
                        <div className="compare-item">
                            <span className="compare-label">Tháng này:</span>
                            <span className="compare-value">{currencyFormatter(stats.revenue.current_month || 0)}</span>
                        </div>
                        <div className="compare-item">
                            <span className="compare-label">Tháng trước:</span>
                            <span className="compare-value">{currencyFormatter(stats.revenue.previous_month || 0)}</span>
                        </div>
                    </div>
                    {/* <div className={`growth-badge ${stats.revenue.growth_percent >= 0 ? 'positive' : 'negative'}`}>
                        {stats.revenue.growth_percent >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                        <span>{Math.abs(stats.revenue.growth_percent)}% so với hôm qua</span>
                    </div> */}
                </div>
            </div>

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

            <div className="card full-width">
                <div className="card-header">
                    <h3 className="card-title">So sánh doanh thu theo năm</h3>
                    <p className="card-subtitle">So sánh doanh thu giữa năm {new Date().getFullYear() - 1} và {new Date().getFullYear()}</p>
                </div>
                <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={revenueCompareData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0"/>
                        <XAxis dataKey="month" stroke="#94a3b8"/>
                        <YAxis stroke="#94a3b8"/>
                        <Tooltip formatter={(value) => [currencyFormatter(value), "Doanh thu"]}/>
                        <Legend />
                        <Bar 
                            dataKey={new Date().getFullYear() - 1} 
                            fill="#94a3b8" 
                            radius={[8, 8, 0, 0]} 
                            name={`Năm ${new Date().getFullYear() - 1}`}
                        />
                        <Bar 
                            dataKey={new Date().getFullYear()} 
                            fill="#3b82f6" 
                            radius={[8, 8, 0, 0]} 
                            name={`Năm ${new Date().getFullYear()}`}
                        />
                    </BarChart>
                </ResponsiveContainer>
            </div>

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
        </div>
    );
}

// Component StatCard
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
        </div>
    );
}

// Component OrderStatusCard
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
        </div>
    );
}

// Component ProductTable
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
        </div>
    );
}

export default Dashboard;