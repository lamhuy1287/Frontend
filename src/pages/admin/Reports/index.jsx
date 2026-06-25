// src/pages/admin/Reports/index.js
import { useState, useEffect, useCallback } from "react";
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

// Get default date range (first day of current month)
const getDefaultDateRange = () => {
    const start = new Date();
    start.setDate(1);
    return { start, end: new Date() };
};

function Reports() {
    // State cho bộ lọc thời gian - khởi tạo với default
    const [dateRange, setDateRange] = useState(() => {
        const { start, end } = getDefaultDateRange();
        return { startDate: start, endDate: end };
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
    const [refreshKey, setRefreshKey] = useState(0);
    
    // State cho dữ liệu
    const [revenueData, setRevenueData] = useState(null);
    const [orderData, setOrderData] = useState(null);
    const [customerData, setCustomerData] = useState(null);
    const [productData, setProductData] = useState(null);
    const [discountData, setDiscountData] = useState(null);
    const [couponData, setCouponData] = useState(null);
    
    // State cho sản phẩm được chọn
    const [selectedProduct, setSelectedProduct] = useState(null);
    
    // Format date helper
    const formatDate = useCallback((date) => {
        if (!date) return '';
        return date.toISOString().split('T')[0];
    }, []);
    
    // Fetch functions
    const fetchRevenueReport = useCallback(async () => {
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
    }, [dateRange, compareMode, formatDate]);
    
    const fetchOrderReport = useCallback(async () => {
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
    }, [dateRange, formatDate]);
    
    const fetchCustomerReport = useCallback(async () => {
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
    }, [dateRange, formatDate]);
    
    const fetchProductReport = useCallback(async () => {
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
    }, [dateRange, selectedProduct, formatDate]);
    
    const fetchDiscountReport = useCallback(async () => {
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
    }, [dateRange, formatDate]);
    
    const fetchCouponReport = useCallback(async () => {
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
    }, [dateRange, formatDate]);
    
    // Hàm refresh tất cả dữ liệu
    const refreshAllData = useCallback(async () => {
        toast.loading("Đang làm mới dữ liệu...", { id: 'refresh' });
        
        await Promise.all([
            fetchRevenueReport(),
            fetchOrderReport(),
            fetchCustomerReport(),
            fetchProductReport(),
            fetchDiscountReport(),
            fetchCouponReport()
        ]);
        
        toast.success("Đã làm mới dữ liệu thành công!", { id: 'refresh' });
    }, [fetchRevenueReport, fetchOrderReport, fetchCustomerReport, fetchProductReport, fetchDiscountReport, fetchCouponReport]);
    
    // Handle refresh - xóa bộ lọc và reload
    const handleRefresh = useCallback(() => {
        // Reset về default date range
        const { start, end } = getDefaultDateRange();
        setDateRange({ startDate: start, endDate: end });
        setRefreshKey(prev => prev + 1);
        
        // Toast thông báo
        toast.success("Đã xóa bộ lọc và làm mới dữ liệu!");
    }, []);
    
    // Tải dữ liệu khi dateRange, compareMode hoặc refreshKey thay đổi
    useEffect(() => {
        refreshAllData();
    }, [dateRange, compareMode, refreshKey, refreshAllData]);
    
    const handleDateRangeChange = useCallback((startDate, endDate) => {
        setDateRange({ startDate, endDate });
    }, []);
    
    const handleSelectProduct = useCallback((product) => {
        setSelectedProduct(product);
    }, []);
    
    // Hàm reset từ DateRangePicker (khi bấm X hoặc Xóa bộ lọc)
    const handleResetFromPicker = useCallback(() => {
        // Reset về default và reload
        const { start, end } = getDefaultDateRange();
        setDateRange({ startDate: start, endDate: end });
        setRefreshKey(prev => prev + 1);
        toast.success("Đã xóa bộ lọc và làm mới dữ liệu!");
    }, []);
    
    return (
        <div className="reports-container" key={refreshKey}>
            {/* Header */}
            <div className="reports-header">
                <div>
                    <h1 className="reports-title">📊 Báo cáo thống kê</h1>
                    <p className="reports-subtitle">
                        Phân tích doanh thu, đơn hàng, khách hàng, sản phẩm, giảm giá và mã giảm giá theo thời gian
                    </p>
                </div>
                <button 
                    className="refresh-btn" 
                    onClick={handleRefresh}
                    disabled={Object.values(loading).some(v => v === true)}
                >
                    <FiRefreshCw className={Object.values(loading).some(v => v === true) ? 'spinning' : ''} />
                    {Object.values(loading).some(v => v === true) ? 'Đang tải...' : 'Xóa bộ lọc'}
                </button>
            </div>
            
            {/* Bộ lọc thời gian */}
            <div className="filters-section">
                <DateRangePicker
                    startDate={dateRange.startDate}
                    endDate={dateRange.endDate}
                    onChange={handleDateRangeChange}
                    onRefresh={handleResetFromPicker}  // Khi bấm X hoặc Xóa bộ lọc
                    onClear={handleResetFromPicker}    // Khi bấm X
                    onApply={(start, end) => {
                        // Khi áp dụng bộ lọc mới
                        setRefreshKey(prev => prev + 1);
                    }}
                />
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