// src/services/reportService.js

import axios from "axios";

const API_URL = "http://127.0.0.1:5555/api";

const getToken = () => {
    return localStorage.getItem("token");
};

// =========================
// BÁO CÁO DOANH THU
// =========================
export const getRevenueReport = async (params) => {
    const token = getToken();
    
    if (!token) {
        throw new Error("Chưa đăng nhập!");
    }
    
    try {
        const response = await axios.get(
            `${API_URL}/admin/reports/revenue`,
            {
                params: {
                    start_date: params.start_date,
                    end_date: params.end_date,
                    compare_mode: params.compare_mode || 'previous_period'
                },
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        
        if (response.data && response.data.success) {
            return response.data.data;
        }
        
        throw new Error(response.data?.message || "Không thể lấy dữ liệu báo cáo doanh thu");
        
    } catch (error) {
        console.error("Get revenue report error:", error);
        throw error;
    }
};

// =========================
// BÁO CÁO ĐƠN HÀNG
// =========================
export const getOrderReport = async (params) => {
    const token = getToken();
    
    if (!token) {
        throw new Error("Chưa đăng nhập!");
    }
    
    try {
        const response = await axios.get(
            `${API_URL}/admin/reports/orders`,
            {
                params: {
                    start_date: params.start_date,
                    end_date: params.end_date
                },
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        
        if (response.data && response.data.success) {
            return response.data.data;
        }
        
        throw new Error(response.data?.message || "Không thể lấy dữ liệu báo cáo đơn hàng");
        
    } catch (error) {
        console.error("Get order report error:", error);
        throw error;
    }
};

// =========================
// BÁO CÁO KHÁCH HÀNG
// =========================
export const getCustomerReport = async (params) => {
    const token = getToken();
    
    if (!token) {
        throw new Error("Chưa đăng nhập!");
    }
    
    try {
        const response = await axios.get(
            `${API_URL}/admin/reports/customers`,
            {
                params: {
                    start_date: params.start_date,
                    end_date: params.end_date
                },
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        
        if (response.data && response.data.success) {
            return response.data.data;
        }
        
        throw new Error(response.data?.message || "Không thể lấy dữ liệu báo cáo khách hàng");
        
    } catch (error) {
        console.error("Get customer report error:", error);
        throw error;
    }
};

// =========================
// BÁO CÁO SẢN PHẨM
// =========================
export const getProductReport = async (params) => {
    const token = getToken();
    
    if (!token) {
        throw new Error("Chưa đăng nhập!");
    }
    
    try {
        const response = await axios.get(
            `${API_URL}/admin/reports/products`,
            {
                params: {
                    start_date: params.start_date,
                    end_date: params.end_date,
                    product_id: params.product_id || null
                },
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        
        if (response.data && response.data.success) {
            return response.data.data;
        }
        
        throw new Error(response.data?.message || "Không thể lấy dữ liệu báo cáo sản phẩm");
        
    } catch (error) {
        console.error("Get product report error:", error);
        throw error;
    }
};

// =========================
// BÁO CÁO GIẢM GIÁ SẢN PHẨM (DISCOUNT)
// =========================
export const getDiscountReport = async (params) => {
    const token = getToken();
    
    if (!token) {
        throw new Error("Chưa đăng nhập!");
    }
    
    try {
        const response = await axios.get(
            `${API_URL}/admin/reports/discounts`,
            {
                params: {
                    start_date: params.start_date,
                    end_date: params.end_date
                },
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        
        if (response.data && response.data.success) {
            return response.data.data;
        }
        
        throw new Error(response.data?.message || "Không thể lấy dữ liệu báo cáo giảm giá sản phẩm");
        
    } catch (error) {
        console.error("Get discount report error:", error);
        throw error;
    }
};

// =========================
// BÁO CÁO KHUYẾN MÃI (COUPON)
// =========================
export const getCouponReport = async (params) => {
    const token = getToken();
    
    if (!token) {
        throw new Error("Chưa đăng nhập!");
    }
    
    try {
        const response = await axios.get(
            `${API_URL}/admin/reports/coupons`,
            {
                params: {
                    start_date: params.start_date,
                    end_date: params.end_date
                },
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            }
        );
        
        if (response.data && response.data.success) {
            return response.data.data;
        }
        
        throw new Error(response.data?.message || "Không thể lấy dữ liệu báo cáo khuyến mãi");
        
    } catch (error) {
        console.error("Get coupon report error:", error);
        throw error;
    }
};

// =========================
// UTILITY: FORMAT DATE
// =========================
export const formatDateForAPI = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

// =========================
// UTILITY: GET DEFAULT DATE RANGE (30 ngày gần nhất)
// =========================
export const getDefaultDateRange = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    
    return {
        start_date: formatDateForAPI(startDate),
        end_date: formatDateForAPI(endDate)
    };
};