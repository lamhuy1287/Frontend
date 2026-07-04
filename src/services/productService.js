// productService.js
import axios from "axios";

const API_URL = "http://127.0.0.1:5555/api";

const getToken = () => {
    return localStorage.getItem("token");
};

// =========================
// GET ALL - CÓ HỖ TRỢ stock_filter
// =========================
export const getProducts = async (params) => {
    const cleanedParams = {};
    if (params) {
        Object.keys(params).forEach(key => {
            const value = params[key];
            if (value !== undefined && value !== null && value !== '' && value !== 'all') {
                cleanedParams[key] = value;
            }
        });
    }
    
    return axios.get(`${API_URL}/products`, { params: cleanedParams });
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
// DELETE
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
// GET STOCK SUMMARY
// =========================
export const getStockSummary = async () => {
    const token = getToken();
    
    try {
        const response = await axios.get(`${API_URL}/products/stock-summary`, {
            headers: token ? {
                "Authorization": `Bearer ${token}`
            } : {}
        });
        return response;
    } catch (error) {
        console.error("Get stock summary error:", error);
        return { 
            data: { 
                success: false, 
                message: "Không thể lấy thông tin tồn kho",
                data: {
                    low_stock: 0,
                    out_of_stock: 0,
                    in_stock: 0,
                    total_products: 0
                }
            } 
        };
    }
};

// =========================
// GET LOW STOCK PRODUCTS
// =========================
export const getLowStockProducts = async (page = 1, limit = 20) => {
    return getProducts({
        page,
        limit,
        stock_filter: "low_stock"
    });
};

// =========================
// GET OUT OF STOCK PRODUCTS
// =========================
export const getOutOfStockProducts = async (page = 1, limit = 20) => {
    return getProducts({
        page,
        limit,
        stock_filter: "out_of_stock"
    });
};

// =========================
// GET PRODUCTS WITH LOW STOCK VARIANTS
// =========================
export const getProductsWithLowStockVariants = async (page = 1, limit = 20) => {
    return getProducts({
        page,
        limit,
        stock_filter: "has_low_stock_variant"
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
        if (filters.stock_filter) params.append('stock_filter', filters.stock_filter);
        
        const url = `${API_URL}/products?${params.toString()}`;
        console.log("Advanced search URL:", url);
        
        const response = await axios.get(url);
        
        if (response.data && response.data.success) {
            return {
                products: response.data.data?.products || [],
                pagination: response.data.data?.pagination || null,
                total: response.data.data?.total || 0,
                page: response.data.data?.page || 1,
                limit: response.data.data?.limit || filters.limit || 10,
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

// =========================
// GET BEST SELLING PRODUCTS
// =========================
export const getBestSellingProducts = async (limit = 8) => {
    try {
        const response = await axios.get(`${API_URL}/products/best-selling?limit=${limit}`);
        return response;
    } catch (error) {
        console.error("Get best selling products error:", error);
        return { data: { data: { products: [] } } };
    }
};

// =========================
// HELPER: KIỂM TRA TRẠNG THÁI TỒN KHO
// =========================
export const getStockStatusInfo = (totalQuantity) => {
    if (totalQuantity === 0) {
        return {
            status: "out_of_stock",
            label: "Hết hàng",
            color: "red",
            bgColor: "#f8d7da",
            icon: "❌"
        };
    }
    if (totalQuantity <= 5) {
        return {
            status: "low_stock",
            label: `Sắp hết (còn ${totalQuantity})`,
            color: "orange",
            bgColor: "#fff3cd",
            icon: "⚠️"
        };
    }
    return {
        status: "in_stock",
        label: "Còn hàng",
        color: "green",
        bgColor: "transparent",
        icon: "✓"
    };
};

// =========================
// HELPER: TÍNH TỔNG SỐ LƯỢNG TỪ VARIANTS
// =========================
export const getTotalQuantityFromVariants = (variants) => {
    if (!variants || variants.length === 0) return 0;
    return variants.reduce((sum, variant) => sum + (variant.quantity || 0), 0);
};

// =========================
// HELPER: KIỂM TRA BIẾN THỂ SẮP HẾT
// =========================
export const hasLowStockVariant = (variants) => {
    if (!variants || variants.length === 0) return false;
    return variants.some(v => v.quantity > 0 && v.quantity <= 5);
};

// =========================
// HELPER: LẤY DANH SÁCH BIẾN THỂ SẮP HẾT
// =========================
export const getLowStockVariants = (variants) => {
    if (!variants || variants.length === 0) return [];
    return variants.filter(v => v.quantity > 0 && v.quantity <= 5);
};

// =========================
// HELPER: LẤY DANH SÁCH BIẾN THỂ HẾT HÀNG
// =========================
export const getOutOfStockVariants = (variants) => {
    if (!variants || variants.length === 0) return [];
    return variants.filter(v => v.quantity === 0);
};