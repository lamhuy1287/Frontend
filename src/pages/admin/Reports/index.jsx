// src/pages/admin/Reports/index.js
import { useState, useEffect } from "react";
import {
    FiRefreshCw
} from "react-icons/fi";
import DateRangePicker from "./components/DateRangePicker";
import RevenueReport from "./components/RevenueReport";
import OrderReport from "./components/OrderReport";
import CustomerReport from "./components/CustomerReport";
import ProductReport from "./components/ProductReport";
import DiscountReport from "./components/DiscountReport";
import CouponReport from "./components/CouponReport";
import {
    getRevenueReport,
    getOrderReport,
    getCustomerReport,
    getProductReport,
    getDiscountReport,
    getCouponReport
} from "../../../services/reportService";
import toast from "react-hot-toast";
import "./styles/Reports.css";

function Reports() {
    // State cho bộ lọc thời gian
    const [dateRange, setDateRange] = useState({
        startDate: new Date(new Date().setDate(1)), // Đầu tháng
        endDate: new Date()
    });
    const [compareMode, setCompareMode] = useState("previous_period");
    const [loading, setLoading] = useState({
        revenue: false,
        orders: false,
        customers: false,
        products: false,
        discounts: false,
        coupons: false
    });
    
    // State cho dữ liệu
    const [revenueData, setRevenueData] = useState(null);
    const [orderData, setOrderData] = useState(null);
    const [customerData, setCustomerData] = useState(null);
    const [productData, setProductData] = useState(null);
    const [discountData, setDiscountData] = useState(null);
    const [couponData, setCouponData] = useState(null);
    
    // State cho sản phẩm được chọn (xem chi tiết biến thể)
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // Tải dữ liệu khi dateRange thay đổi
    useEffect(() => {
        fetchRevenueReport();
        fetchOrderReport();
        fetchCustomerReport();
        fetchProductReport();
        fetchDiscountReport();
        fetchCouponReport();
    }, [dateRange, compareMode]);
    
    const fetchRevenueReport = async () => {
        setLoading(prev => ({ ...prev, revenue: true }));
        try {
            const data = await getRevenueReport({
                start_date: formatDate(dateRange.startDate),
                end_date: formatDate(dateRange.endDate),
                compare_mode: compareMode
            });
            setRevenueData(data);
        } catch (error) {
            console.error("Revenue report error:", error);
            toast.error("Không thể tải báo cáo doanh thu");
        } finally {
            setLoading(prev => ({ ...prev, revenue: false }));
        }
    };
    
    const fetchOrderReport = async () => {
        setLoading(prev => ({ ...prev, orders: true }));
        try {
            const data = await getOrderReport({
                start_date: formatDate(dateRange.startDate),
                end_date: formatDate(dateRange.endDate)
            });
            setOrderData(data);
        } catch (error) {
            console.error("Order report error:", error);
            toast.error("Không thể tải báo cáo đơn hàng");
        } finally {
            setLoading(prev => ({ ...prev, orders: false }));
        }
    };
    
    const fetchCustomerReport = async () => {
        setLoading(prev => ({ ...prev, customers: true }));
        try {
            const data = await getCustomerReport({
                start_date: formatDate(dateRange.startDate),
                end_date: formatDate(dateRange.endDate)
            });
            setCustomerData(data);
        } catch (error) {
            console.error("Customer report error:", error);
            toast.error("Không thể tải báo cáo khách hàng");
        } finally {
            setLoading(prev => ({ ...prev, customers: false }));
        }
    };
    
    const fetchProductReport = async () => {
        setLoading(prev => ({ ...prev, products: true }));
        try {
            const data = await getProductReport({
                start_date: formatDate(dateRange.startDate),
                end_date: formatDate(dateRange.endDate),
                product_id: selectedProduct?.id || null
            });
            setProductData(data);
        } catch (error) {
            console.error("Product report error:", error);
            toast.error("Không thể tải báo cáo sản phẩm");
        } finally {
            setLoading(prev => ({ ...prev, products: false }));
        }
    };
    
    const fetchDiscountReport = async () => {
        setLoading(prev => ({ ...prev, discounts: true }));
        try {
            const data = await getDiscountReport({
                start_date: formatDate(dateRange.startDate),
                end_date: formatDate(dateRange.endDate)
            });
            setDiscountData(data);
        } catch (error) {
            console.error("Discount report error:", error);
            toast.error("Không thể tải báo cáo giảm giá sản phẩm");
        } finally {
            setLoading(prev => ({ ...prev, discounts: false }));
        }
    };
    
    const fetchCouponReport = async () => {
        setLoading(prev => ({ ...prev, coupons: true }));
        try {
            const data = await getCouponReport({
                start_date: formatDate(dateRange.startDate),
                end_date: formatDate(dateRange.endDate)
            });
            setCouponData(data);
        } catch (error) {
            console.error("Coupon report error:", error);
            toast.error("Không thể tải báo cáo mã giảm giá");
        } finally {
            setLoading(prev => ({ ...prev, coupons: false }));
        }
    };
    
    const formatDate = (date) => {
        return date.toISOString().split('T')[0];
    };
    
    const handleDateRangeChange = (startDate, endDate) => {
        setDateRange({ startDate, endDate });
    };
    
    const handleRefresh = () => {
        fetchRevenueReport();
        fetchOrderReport();
        fetchCustomerReport();
        fetchProductReport();
        fetchDiscountReport();
        fetchCouponReport();
        toast.success("Đang làm mới dữ liệu...");
    };
    
    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
    };
    
    return (
        <div className="reports-container">
            {/* Header */}
            <div className="reports-header">
                <div>
                    <h1 className="reports-title">📊 Báo cáo thống kê</h1>
                    <p className="reports-subtitle">
                        Phân tích doanh thu, đơn hàng, khách hàng, sản phẩm, giảm giá và mã giảm giá theo thời gian
                    </p>
                </div>
                <button className="refresh-btn" onClick={handleRefresh}>
                    <FiRefreshCw />
                    Làm mới
                </button>
            </div>
            
            {/* Bộ lọc thời gian */}
            <div className="filters-section">
                <DateRangePicker
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    onChange={handleDateRangeChange}
                />
                <div className="compare-mode">
                    <label>So sánh doanh thu với:</label>
                    <select
                        value={compareMode}
                        onChange={(e) => setCompareMode(e.target.value)}
                    >
                        <option value="previous_period">Kỳ trước</option>
                        <option value="previous_year">Cùng kỳ năm trước</option>
                    </select>
                </div>
            </div>
            
            {/* Báo cáo doanh thu */}
            <RevenueReport
                data={revenueData}
                loading={loading.revenue}
                dateRange={dateRange}
                compareMode={compareMode}
            />
            
            {/* Báo cáo đơn hàng */}
            <OrderReport
                data={orderData}
                loading={loading.orders}
            />
            
            {/* Báo cáo khách hàng */}
            <CustomerReport
                data={customerData}
                loading={loading.customers}
            />
            
            {/* Báo cáo sản phẩm */}
            <ProductReport
                data={productData}
                loading={loading.products}
                selectedProduct={selectedProduct}
                onSelectProduct={handleSelectProduct}
                onRefresh={fetchProductReport}
            />
            
            {/* Báo cáo giảm giá sản phẩm */}
            <DiscountReport
                data={discountData}
                loading={loading.discounts}
            />
            
            {/* Báo cáo mã giảm giá */}
            <CouponReport
                data={couponData}
                loading={loading.coupons}
            />
        </div>
    );
}

export default Reports;