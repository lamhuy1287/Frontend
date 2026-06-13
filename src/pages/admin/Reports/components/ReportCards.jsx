// src/pages/admin/Reports/components/ReportCards.js
import { FiDollarSign, FiShoppingCart, FiUsers, FiPackage } from "react-icons/fi";

function ReportCards({ revenueData, orderData, customerData, loading }) {
    
    const formatCurrency = (value) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND"
        }).format(value || 0);
    };
    
    const cards = [
        {
            title: "Tổng doanh thu",
            value: revenueData?.total_revenue || 0,
            formatter: formatCurrency,
            icon: <FiDollarSign />,
            color: "#3b82f6",
            change: revenueData?.comparison?.percent_change || 0
        },
        {
            title: "Tổng đơn hàng",
            value: orderData?.total_orders || 0,
            formatter: (v) => v.toLocaleString(),
            icon: <FiShoppingCart />,
            color: "#10b981",
            change: orderData?.order_growth || 0
        },
        {
            title: "Khách hàng mới",
            value: customerData?.new_customers || 0,
            formatter: (v) => v.toLocaleString(),
            icon: <FiUsers />,
            color: "#8b5cf6",
            change: customerData?.customer_growth || 0
        },
        {
            title: "Sản phẩm đã bán",
            value: revenueData?.total_products_sold || 0,
            formatter: (v) => v.toLocaleString(),
            icon: <FiPackage />,
            color: "#f59e0b",
            change: revenueData?.product_growth || 0
        }
    ];
    
    if (loading.revenue && loading.orders && loading.customers) {
        return (
            <div className="report-cards">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="report-card-skeleton">
                        <div className="skeleton-icon"></div>
                        <div className="skeleton-content">
                            <div className="skeleton-title"></div>
                            <div className="skeleton-value"></div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }
    
    return (
        <div className="report-cards">
            {cards.map((card, idx) => (
                <div key={idx} className="report-card-item">
                    <div className="card-icon" style={{ backgroundColor: card.color }}>
                        {card.icon}
                    </div>
                    <div className="card-content">
                        <div className="card-title">{card.title}</div>
                        <div className="card-value">{card.formatter(card.value)}</div>
                        {card.change !== 0 && (
                            <div className={`card-change ${card.change > 0 ? 'positive' : 'negative'}`}>
                                {card.change > 0 ? '↑' : '↓'} {Math.abs(card.change)}% so với kỳ trước
                            </div>
                        )}
                    </div>
                </div>
            ))}
        </div>
    );
}

export default ReportCards;