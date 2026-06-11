import axios from "axios";

const API_URL = "http://127.0.0.1:5555/api";

const getToken = () => {
    return localStorage.getItem("token");
};

// =========================
// GET ALL
// =========================
export const getProducts = async (params) => {
    return axios.get(
        `${API_URL}/products`,
        { params }
    );
};

// =========================
// GET DETAIL
// =========================
export const getProductDetail = async (id) => {
    if (!id) {
        throw new Error("ID sản phẩm không hợp lệ");
    }
    return axios.get(`${API_URL}/products/${id}`);
};

// =========================
// CREATE
// =========================
export const createProduct = async (productData) => {
    const token = getToken();
    if (!token) {
        throw new Error("Chưa đăng nhập!");
    }

    const formData = new FormData();
    formData.append("name", productData.name);
    formData.append("product_code", productData.product_code);
    formData.append("category_id", productData.category_id);
    formData.append("brand_id", productData.brand_id);
    formData.append("description", productData.description || "");
    formData.append("variants", JSON.stringify(productData.variants));

    if (productData.images) {
        productData.images.forEach((file) => {
            formData.append("images", file);
        });
    }

    return axios.post(`${API_URL}/products`, formData, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
};

// =========================
// UPDATE
// =========================
export const updateProduct = async (id, formData) => {
    const token = getToken();
    return axios.put(`${API_URL}/products/${id}`, formData, {
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data"
        }
    });
};

// =========================
// DELETE - ✅ THÊM FUNCTION NÀY
// =========================
export const deleteProduct = async (id) => {
    const token = getToken();
    
    if (!token) {
        throw new Error("Chưa đăng nhập!");
    }
    
    return axios.delete(`${API_URL}/products/${id}`, {
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
};

// =========================
// SEARCH PRODUCTS
// =========================
export const searchProducts = async (keyword, limit = null) => {
    try {
        let url = `${API_URL}/products?keyword=${encodeURIComponent(keyword)}`;
        
        if (limit && limit > 0) {
            url += `&limit=${limit}`;
        }
        
        console.log("Searching products with URL:", url);
        
        const response = await axios.get(url);
        
        console.log("Search response:", response.data);
        
        // Cấu trúc response: { success, message, data: { products, pagination } }
        if (response.data && response.data.success && response.data.data) {
            if (response.data.data.products && Array.isArray(response.data.data.products)) {
                console.log("Found products array, length:", response.data.data.products.length);
                return response.data.data.products;
            }
            if (Array.isArray(response.data.data)) {
                return response.data.data;
            }
        }
        
        if (Array.isArray(response.data)) {
            return response.data;
        }
        
        if (response.data && response.data.products && Array.isArray(response.data.products)) {
            return response.data.products;
        }
        
        console.warn("No products array found, returning empty array");
        return [];
        
    } catch (error) {
        console.error('Search products error:', error);
        return [];
    }
};

// =========================
// SEARCH PRODUCTS WITH ADVANCED FILTERS
// =========================
export const searchProductsAdvanced = async (filters) => {
    try {
        const params = new URLSearchParams();
        
        if (filters.keyword) params.append('keyword', filters.keyword);
        if (filters.limit) params.append('limit', filters.limit);
        if (filters.category_id) params.append('category_id', filters.category_id);
        if (filters.brand_id) params.append('brand_id', filters.brand_id);
        if (filters.min_price) params.append('min_price', filters.min_price);
        if (filters.max_price) params.append('max_price', filters.max_price);
        if (filters.sort) params.append('sort', filters.sort);
        if (filters.page) params.append('page', filters.page);
        
        const url = `${API_URL}/products?${params.toString()}`;
        console.log("Advanced search URL:", url);
        
        const response = await axios.get(url);
        
        if (response.data && response.data.success) {
            return {
                products: response.data.data?.products || [],
                pagination: response.data.data?.pagination || null,
                total: response.data.data?.products?.length || 0,
                success: true
            };
        }
        
        return {
            products: [],
            pagination: null,
            total: 0,
            success: false
        };
        
    } catch (error) {
        console.error('Advanced search error:', error);
        return {
            products: [],
            pagination: null,
            total: 0,
            success: false,
            error: error.message
        };
    }
};