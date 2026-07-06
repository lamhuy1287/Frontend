import axios from "axios";

const API_URL = "http://127.0.0.1:5555/api/users";

const getToken = () => {
    return localStorage.getItem("token");
};

// =========================
// LẤY DANH SÁCH NGƯỜI DÙNG
// =========================

export const getUsers = async (page = 1, limit = 10, sortBy = "successful_orders", sortOrder = "desc") => {
    try {
        const response = await axios.get(
            `${API_URL}`,
            {
                params: {
                    page,
                    limit,
                    sortBy,
                    sortOrder
                },
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// =========================
// TÌM KIẾM NGƯỜI DÙNG
// =========================

export const searchUsers = async (keyword, page = 1, limit = 10) => {
    try {
        const response = await axios.get(
            `${API_URL}/search`,
            {
                params: {
                    keyword,
                    page,
                    limit
                },
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// =========================
// LẤY CHI TIẾT NGƯỜI DÙNG
// =========================

export const getUserDetail = async (userId) => {
    try {
        const response = await axios.get(
            `${API_URL}/${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// =========================
// CẬP NHẬT PROFILE
// =========================

export const updateProfile = async (data) => {
    try {
        const response = await axios.put(
            `${API_URL}/profile`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// =========================
// CẬP NHẬT NGƯỜI DÙNG (ADMIN)
// =========================

export const updateUser = async (userId, data) => {
    try {
        const response = await axios.put(
            `${API_URL}/${userId}`,
            data,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// =========================
// XÓA NGƯỜI DÙNG
// =========================

export const deleteUser = async (userId) => {
    try {
        const response = await axios.delete(
            `${API_URL}/${userId}`,
            {
                headers: {
                    Authorization: `Bearer ${getToken()}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error;
    }
};

// =========================
// EXPORT DEFAULT
// =========================

export default {
    getUsers,
    searchUsers,
    getUserDetail,
    updateProfile,
    updateUser,
    deleteUser
};