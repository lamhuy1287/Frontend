import axiosClient from "./axiosClient";

// =====================================
// DASHBOARD (GIỮ NGUYÊN)
// =====================================

export const getDashboard = async () => {
    const res = await axiosClient.get("/admin/dashboard");
    return res.data.data;
};

// =====================================
// ✅ THÊM MỚI: USER MANAGEMENT
// =====================================

/**
 * Lấy danh sách users kèm thống kê đơn hàng
 * @param {number} page - Trang hiện tại (default 1)
 * @param {number} limit - Số user mỗi trang (default 10)
 * @param {string} sortBy - Sắp xếp theo (successful_orders, name, email, total_spent)
 * @param {string} sortOrder - asc hoặc desc (default desc)
 */
export const getUsers = async (page = 1, limit = 10, sortBy = "successful_orders", sortOrder = "desc") => {
    const res = await axiosClient.get("/admin/users", {
        params: { page, limit, sort_by: sortBy, sort_order: sortOrder }
    });
    return res.data;
};

/**
 * Tìm kiếm user theo tên, email hoặc số điện thoại
 * @param {string} keyword - Từ khóa tìm kiếm
 * @param {number} page - Trang hiện tại
 * @param {number} limit - Số user mỗi trang
 */
export const searchUsers = async (keyword, page = 1, limit = 10) => {
    const res = await axiosClient.get("/admin/users/search", {
        params: { keyword, page, limit }
    });
    return res.data;
};

/**
 * Lấy chi tiết user kèm lịch sử đơn hàng
 * @param {number} userId - ID của user
 */
export const getUserDetail = async (userId) => {
    const res = await axiosClient.get(`/admin/users/${userId}`);
    return res.data;
};