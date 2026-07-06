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
// GET STOCK SUMMARY - CẬP NHẬT
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
                    has_low_stock_variant: 0,
                    has_out_of_stock_variant: 0,
                    in_stock: 0,
                    total_products: 0
                }
            } 
        };
    }
};

// =========================
// GET LOW STOCK PRODUCTS (tổng <= 5)
// =========================
export const getLowStockProducts = async (page = 1, limit = 20) => {
    return getProducts({
        page,
        limit,
        stock_filter: "low_stock"
    });
};

// =========================
// GET OUT OF STOCK PRODUCTS (tổng = 0)
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
// GET PRODUCTS WITH OUT OF STOCK VARIANTS - THÊM MỚI
// =========================
export const getProductsWithOutOfStockVariants = async (page = 1, limit = 20) => {
    return getProducts({
        page,
        limit,
        stock_filter: "has_out_of_stock_variant"
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
// HELPER: KIỂM TRA TRẠNG THÁI TỒN KHO - CẬP NHẬT
// =========================
export const getStockStatusInfo = (totalQuantity) => {
    if (totalQuantity === 0) {
        return {
            status: "out_of_stock",
            label: "Hết hàng",
            color: "#dc2626",
            bgColor: "#fecaca",
            icon: "❌",
            priority: 1 // Độ ưu tiên hiển thị
        };
    }
    if (totalQuantity <= 5) {
        return {
            status: "low_stock",
            label: `Sắp hết (còn ${totalQuantity})`,
            color: "#f59e0b",
            bgColor: "#fef3c7",
            icon: "⚠️",
            priority: 2
        };
    }
    return {
        status: "in_stock",
        label: "Còn hàng",
        color: "#22c55e",
        bgColor: "transparent",
        icon: "✅",
        priority: 3
    };
};

// =========================
// HELPER: LẤY THÔNG TIN TRẠNG THÁI TỪ API - THÊM MỚI
// =========================
export const getStockStatusFromAPI = (product) => {
    if (!product) {
        return {
            status: "unknown",
            label: "Không xác định",
            color: "#6b7280",
            bgColor: "#f3f4f6",
            icon: "❓",
            priority: 4
        };
    }
    
    switch (product.stock_status) {
        case "out_of_stock":
            return {
                status: "out_of_stock",
                label: "Hết hàng (tổng = 0)",
                color: "#dc2626",
                bgColor: "#fecaca",
                icon: "❌",
                priority: 1
            };
        case "low_stock":
            return {
                status: "low_stock",
                label: "Sắp hết hàng (tổng ≤5)",
                color: "#f59e0b",
                bgColor: "#fef3c7",
                icon: "⚠️",
                priority: 2
            };
        case "has_low_stock_variant":
            return {
                status: "has_low_stock_variant",
                label: "Có biến thể sắp hết",
                color: "#f59e0b",
                bgColor: "#fef3c7",
                icon: "🟡",
                priority: 3
            };
        case "has_out_of_stock_variant":
            return {
                status: "has_out_of_stock_variant",
                label: "Có biến thể hết hàng",
                color: "#dc2626",
                bgColor: "#fecaca",
                icon: "🟣",
                priority: 3
            };
        case "in_stock":
            return {
                status: "in_stock",
                label: "Còn hàng",
                color: "#22c55e",
                bgColor: "transparent",
                icon: "✅",
                priority: 4
            };
        default:
            return {
                status: "unknown",
                label: "Không xác định",
                color: "#6b7280",
                bgColor: "#f3f4f6",
                icon: "❓",
                priority: 5
            };
    }
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
// HELPER: KIỂM TRA BIẾN THỂ HẾT HÀNG - THÊM MỚI
// =========================
export const hasOutOfStockVariant = (variants) => {
    if (!variants || variants.length === 0) return false;
    return variants.some(v => v.quantity === 0);
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

// =========================
// HELPER: LẤY THÔNG TIN CHI TIẾT VỀ TỒN KHO CỦA SẢN PHẨM - THÊM MỚI
// =========================
export const getProductStockDetails = (product) => {
    if (!product) {
        return {
            totalQuantity: 0,
            stockStatus: "unknown",
            statusInfo: getStockStatusFromAPI(null),
            lowStockVariants: [],
            outOfStockVariants: [],
            hasLowStockVariant: false,
            hasOutOfStockVariant: false
        };
    }
    
    const variants = product.variants || [];
    const totalQuantity = getTotalQuantityFromVariants(variants);
    const lowStockVariants = getLowStockVariants(variants);
    const outOfStockVariants = getOutOfStockVariants(variants);
    
    // Xác định stock status dựa trên tổng và biến thể
    let stockStatus = "in_stock";
    if (totalQuantity === 0) {
        stockStatus = "out_of_stock";
    } else if (totalQuantity <= 5) {
        stockStatus = "low_stock";
    } else if (lowStockVariants.length > 0) {
        stockStatus = "has_low_stock_variant";
    } else if (outOfStockVariants.length > 0) {
        stockStatus = "has_out_of_stock_variant";
    }
    
    return {
        totalQuantity,
        stockStatus,
        statusInfo: getStockStatusFromAPI({ stock_status: stockStatus }),
        lowStockVariants,
        outOfStockVariants,
        hasLowStockVariant: lowStockVariants.length > 0,
        hasOutOfStockVariant: outOfStockVariants.length > 0
    };
};

// =========================
// HELPER: ĐỊNH DẠNG HIỂN THỊ TỒN KHO CHO BẢNG - THÊM MỚI
// =========================
export const getStockDisplayInfo = (product) => {
    const details = getProductStockDetails(product);
    const { statusInfo, totalQuantity, lowStockVariants, outOfStockVariants } = details;
    
    let displayText = statusInfo.label;
    let detailText = '';
    
    if (totalQuantity > 0) {
        detailText = `Tổng: ${totalQuantity}`;
        if (lowStockVariants.length > 0) {
            detailText += ` | Biến thể sắp hết: ${lowStockVariants.length}`;
        }
        if (outOfStockVariants.length > 0) {
            detailText += ` | Biến thể hết: ${outOfStockVariants.length}`;
        }
    } else {
        detailText = 'Không có hàng';
    }
    
    return {
        ...statusInfo,
        totalQuantity,
        displayText,
        detailText,
        lowStockVariantsCount: lowStockVariants.length,
        outOfStockVariantsCount: outOfStockVariants.length
    };
};

// =========================
// CONSTANTS: DANH SÁCH CÁC LOẠI LỌC TỒN KHO - THÊM MỚI
// =========================
export const STOCK_FILTERS = {
    ALL: { value: "all", label: "📦 Tất cả trạng thái", color: "#6b7280" },
    LOW_STOCK: { value: "low_stock", label: "⚠️ Sắp hết hàng (tổng ≤5)", color: "#f59e0b", bgColor: "#fef3c7" },
    HAS_LOW_STOCK_VARIANT: { value: "has_low_stock_variant", label: "🟡 Có biến thể sắp hết", color: "#f59e0b", bgColor: "#fef3c7" },
    OUT_OF_STOCK: { value: "out_of_stock", label: "❌ Hết hàng", color: "#dc2626", bgColor: "#fecaca" },
    HAS_OUT_OF_STOCK_VARIANT: { value: "has_out_of_stock_variant", label: "🟣 Có biến thể hết hàng", color: "#dc2626", bgColor: "#fecaca" }
};

// =========================
// HELPER: LẤY THÔNG TIN FILTER TỪ VALUE - THÊM MỚI
// =========================
export const getStockFilterInfo = (value) => {
    const filter = Object.values(STOCK_FILTERS).find(f => f.value === value);
    return filter || STOCK_FILTERS.ALL;
};

// =========================
// HELPER: KIỂM TRA CÓ CẢNH BÁO TỒN KHO KHÔNG - THÊM MỚI
// =========================
export const hasStockWarning = (stockSummary) => {
    if (!stockSummary) return false;
    return (
        stockSummary.low_stock > 0 ||
        stockSummary.out_of_stock > 0 ||
        stockSummary.has_low_stock_variant > 0 ||
        stockSummary.has_out_of_stock_variant > 0
    );
};

// =========================
// HELPER: LẤY DANH SÁCH CẢNH BÁO ĐỂ HIỂN THỊ - THÊM MỚI
// =========================
export const getWarningList = (stockSummary) => {
    const warnings = [];
    
    if (!stockSummary) return warnings;
    
    if (stockSummary.low_stock > 0) {
        warnings.push({
            type: "low_stock",
            count: stockSummary.low_stock,
            label: "sắp hết hàng (tổng ≤5)",
            icon: "🟠",
            bgColor: "#fef3c7",
            filter: "low_stock"
        });
    }
    
    if (stockSummary.out_of_stock > 0) {
        warnings.push({
            type: "out_of_stock",
            count: stockSummary.out_of_stock,
            label: "hết hàng (tổng = 0)",
            icon: "🔴",
            bgColor: "#fecaca",
            filter: "out_of_stock"
        });
    }
    
    if (stockSummary.has_low_stock_variant > 0) {
        warnings.push({
            type: "has_low_stock_variant",
            count: stockSummary.has_low_stock_variant,
            label: "có biến thể sắp hết",
            icon: "🟡",
            bgColor: "#fef3c7",
            filter: "has_low_stock_variant",
            dashed: true
        });
    }
    
    if (stockSummary.has_out_of_stock_variant > 0) {
        warnings.push({
            type: "has_out_of_stock_variant",
            count: stockSummary.has_out_of_stock_variant,
            label: "có biến thể hết hàng",
            icon: "🟣",
            bgColor: "#fecaca",
            filter: "has_out_of_stock_variant",
            dashed: true
        });
    }
    
    return warnings;
};