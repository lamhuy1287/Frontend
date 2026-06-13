import axios from "axios";

const API_URL = "http://127.0.0.1:5555/api";

const getToken = () => {
    return localStorage.getItem("token");
};

// ============================
// CREATE COUPON
// ============================
export const createCoupon = async (data) => {
    return axios.post(
        `${API_URL}/admin/coupons`,
        data,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    );
};

// ============================
// GET ALL COUPONS
// ============================
export const getCoupons = async () => {
    return axios.get(
        `${API_URL}/admin/coupons`,
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    );
};

// ============================
// TOGGLE COUPON
// ============================
export const toggleCoupon = async (id) => {
    return axios.put(
        `${API_URL}/admin/coupons/${id}/toggle`,
        {},
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    );
};

// ============================
// VALIDATE COUPON
// ============================
export const validateCoupon = async (
    code,
    orderTotal
) => {
    return axios.post(
        `${API_URL}/validate-coupon`,
        {
            code,
            order_total: orderTotal
        },
        {
            headers: {
                Authorization: `Bearer ${getToken()}`
            }
        }
    );
};