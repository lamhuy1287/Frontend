import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    getProducts,
    deleteProduct,
    getStockSummary,
    getStockStatusInfo,
    getTotalQuantityFromVariants
} from "../../../services/productService";

import {
    getCategories
} from "../../../services/categoryService";

import {
    getBrands
} from "../../../services/brandService";

import ProductTable from "./components/ProductTable";

function ProductList() {

    const [products, setProducts] =
        useState([]);

    const [categories, setCategories] =
        useState([]);

    const [brands, setBrands] =
        useState([]);

    const [keyword, setKeyword] =
        useState("");

    const [categoryId, setCategoryId] =
        useState("");

    const [brandId, setBrandId] =
        useState("");

    const [stockFilter, setStockFilter] =
        useState("all");  // all, low_stock, out_of_stock, has_low_stock_variant

    const [page, setPage] =
        useState(1);

    const [total, setTotal] =
        useState(0);

    const [stockSummary, setStockSummary] =
        useState({
            low_stock: 0,
            out_of_stock: 0,
            in_stock: 0,
            total_products: 0
        });

    const [showWarning, setShowWarning] =
        useState(false);

    const limit = 10;

    const navigate =
        useNavigate();

    // =========================
    // LOAD PRODUCTS
    // =========================

    const fetchProducts =
        async () => {

            try {

                const params = {
                    page,
                    limit,
                    keyword,
                    category_id: categoryId,
                    brand_id: brandId
                };

                // Chỉ thêm stock_filter nếu không phải "all"
                if (stockFilter !== "all") {
                    params.stock_filter = stockFilter;
                }

                console.log("Fetching products with params:", params); // Debug

                const res =
                    await getProducts(params);

                console.log("API Response:", res.data); // Debug

                // Lấy danh sách sản phẩm
                const productsData = res.data.data?.products || [];
                
                // Enrich products với stock status (nếu backend chưa trả đủ)
                const enrichedProducts = productsData.map(product => {
                    // Nếu backend đã trả đầy đủ thông tin
                    if (product.total_quantity !== undefined && product.low_stock_variants !== undefined) {
                        return product;
                    }
                    // Fallback: tự tính từ variants
                    const totalQty = getTotalQuantityFromVariants(product.variants);
                    const stockInfo = getStockStatusInfo(totalQty);
                    
                    // Tính biến thể sắp hết
                    const lowStockVariants = product.variants?.filter(v => v.quantity > 0 && v.quantity <= 5) || [];
                    const outOfStockVariants = product.variants?.filter(v => v.quantity === 0) || [];
                    
                    return {
                        ...product,
                        total_quantity: totalQty,
                        stock_status: stockInfo.status,
                        low_stock_variants: lowStockVariants.map(v => ({
                            id: v.id,
                            variant_name: v.variant_name,
                            quantity: v.quantity
                        })),
                        out_of_stock_variants: outOfStockVariants.map(v => ({
                            id: v.id,
                            variant_name: v.variant_name,
                            quantity: v.quantity
                        }))
                    };
                });

                setProducts(enrichedProducts);
                setTotal(res.data.data?.total || 0);

            } catch (err) {

                console.log("Error fetching products:", err);
            }
        };

    // =========================
    // LOAD STOCK SUMMARY
    // =========================

    const fetchStockSummary =
        async () => {

            try {

                const res =
                    await getStockSummary();

                if (res.data.success) {
                    setStockSummary(res.data.data);
                    // Hiển thị cảnh báo nếu có sản phẩm sắp hết hoặc hết hàng
                    const hasLowStock = res.data.data.low_stock > 0;
                    const hasOutOfStock = res.data.data.out_of_stock > 0;
                    setShowWarning(hasLowStock || hasOutOfStock);
                }

            } catch (err) {

                console.log(err);
            }
        };

    // =========================
    // FLATTEN CATEGORY
    // =========================

    const flattenCategories = (
        categories,
        level = 0
    ) => {

        let result = [];

        categories.forEach(
            (category) => {

                result.push({
                    ...category,
                    level
                });

                if (
                    category.children &&
                    category.children
                        .length > 0
                ) {

                    result = [
                        ...result,

                        ...flattenCategories(
                            category.children,
                            level + 1
                        )
                    ];
                }
            }
        );

        return result;
    };

    // =========================
    // LOAD FILTERS
    // =========================

    const fetchFilters =
        async () => {

            try {

                const categoryRes =
                    await getCategories();

                const brandRes =
                    await getBrands();

                setCategories(
                    flattenCategories(
                        categoryRes.data
                    )
                );

                setBrands(
                    brandRes.data
                );

            } catch (err) {

                console.log(err);
            }
        };

    // =========================
    // DELETE PRODUCT
    // =========================

    const handleDelete =
        async (id) => {

            const confirmDelete =
                window.confirm(
                    "Xóa sản phẩm?"
                );

            if (!confirmDelete)
                return;

            try {

                await deleteProduct(
                    id
                );

                fetchProducts();
                fetchStockSummary();

            } catch (err) {

                console.log(err);
            }
        };

    // =========================
    // RESET PAGE WHEN FILTERS CHANGE
    // =========================

    const handleStockFilterChange = (value) => {
        setStockFilter(value);
        setPage(1);
    };

    // =========================
    // USE EFFECT
    // =========================

    useEffect(() => {

        fetchProducts();

    }, [
        page,
        keyword,
        categoryId,
        brandId,
        stockFilter
    ]);

    useEffect(() => {

        fetchFilters();
        fetchStockSummary();

    }, []);

    // =========================
    // Lấy label cho stock filter
    // =========================
    const getStockFilterLabel = (filter) => {
        switch(filter) {
            case "low_stock":
                return "⚠️ Sắp hết hàng (tổng ≤5)";
            case "out_of_stock":
                return "❌ Hết hàng";
            case "has_low_stock_variant":
                return "⚠️ Có biến thể sắp hết";
            default:
                return "📦 Tất cả trạng thái";
        }
    };

    return (

        <div>

            {/* HEADER */}
            <div
                style={
                    headerStyle
                }
            >

                <h1>
                    Quản lý sản phẩm
                </h1>

                <button
                    style={
                        createBtn
                    }
                    onClick={() =>
                        navigate(
                            "/admin/products/create"
                        )
                    }
                >
                    + Thêm sản phẩm
                </button>

            </div>

            {/* WARNING BANNER */}
            {showWarning && (
                <div
                    style={warningBannerStyle}
                >
                    <span style={{ fontSize: "20px" }}>⚠️</span>
                    <div>
                        <strong>Cảnh báo tồn kho!</strong>
                        <div style={{ fontSize: "13px", marginTop: "4px" }}>
                            {stockSummary.low_stock > 0 && (
                                <span style={{ marginRight: "15px" }}>
                                    🟠 {stockSummary.low_stock} sản phẩm sắp hết hàng
                                </span>
                            )}
                            {stockSummary.out_of_stock > 0 && (
                                <span style={{ color: "#dc2626" }}>
                                    🔴 {stockSummary.out_of_stock} sản phẩm hết hàng
                                </span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            if (stockSummary.low_stock > 0) {
                                handleStockFilterChange("low_stock");
                            } else if (stockSummary.out_of_stock > 0) {
                                handleStockFilterChange("out_of_stock");
                            }
                        }}
                        style={warningButtonStyle}
                    >
                        Xem ngay
                    </button>
                </div>
            )}

            {/* FILTER */}
            <div
                style={
                    filterContainer
                }
            >

                <input
                    type="text"
                    placeholder="Tìm sản phẩm..."
                    value={keyword}
                    onChange={(
                        e
                    ) =>
                        setKeyword(
                            e.target
                                .value
                        )
                    }
                    style={
                        inputStyle
                    }
                />

                {/* CATEGORY */}
                <select
                    value={
                        categoryId
                    }
                    onChange={(
                        e
                    ) =>
                        setCategoryId(
                            e.target
                                .value
                        )
                    }
                    style={
                        selectStyle
                    }
                >

                    <option value="">
                        Tất cả danh mục
                    </option>

                    {categories.map(
                        (
                            category
                        ) => (

                            <option
                                key={
                                    category.id
                                }
                                value={
                                    category.id
                                }
                            >

                                {
                                    "-- ".repeat(
                                        category.level
                                    )
                                }

                                {
                                    category.name
                                }

                            </option>
                        )
                    )}

                </select>

                {/* BRAND */}
                <select
                    value={brandId}
                    onChange={(
                        e
                    ) =>
                        setBrandId(
                            e.target
                                .value
                        )
                    }
                    style={
                        selectStyle
                    }
                >

                    <option value="">
                        Tất cả hãng
                    </option>

                    {brands.map(
                        (
                            brand
                        ) => (

                            <option
                                key={
                                    brand.id
                                }
                                value={
                                    brand.id
                                }
                            >

                                {
                                    brand.name
                                }

                            </option>
                        )
                    )}

                </select>

                {/* STOCK FILTER - CẬP NHẬT THÊM TÙY CHỌN MỚI */}
                <select
                    value={stockFilter}
                    onChange={(e) =>
                        handleStockFilterChange(e.target.value)
                    }
                    style={{
                        ...selectStyle,
                        backgroundColor: stockFilter !== "all" 
                            ? (stockFilter === "low_stock" ? "#fff3cd" : 
                               stockFilter === "has_low_stock_variant" ? "#fef3c7" : "#f8d7da")
                            : "white",
                        fontWeight: stockFilter !== "all" ? "bold" : "normal"
                    }}
                >
                    <option value="all">
                        📦 Tất cả trạng thái
                    </option>
                    <option value="low_stock">
                        ⚠️ Sắp hết hàng (tổng ≤5)
                    </option>
                    <option value="has_low_stock_variant">
                        ⚠️ Có biến thể sắp hết
                    </option>
                    <option value="out_of_stock">
                        ❌ Hết hàng
                    </option>
                </select>

            </div>

            {/* PRODUCT TABLE */}
            <ProductTable
                products={
                    products
                }
                handleDelete={
                    handleDelete
                }
                navigate={navigate}
            />

            {/* PAGINATION */}
            <div
                style={
                    paginationContainer
                }
            >

                {Array.from({
                    length:
                        Math.ceil(
                            total /
                                limit
                        )
                }).map(
                    (_, index) => (

                        <button
                            key={
                                index
                            }
                            onClick={() =>
                                setPage(
                                    index +
                                        1
                                )
                            }
                            style={{
                                ...pageBtn,

                                background:
                                    page ===
                                    index +
                                        1
                                        ? "#2563EB"
                                        : "white",

                                color:
                                    page ===
                                    index +
                                        1
                                        ? "white"
                                        : "black"
                            }}
                        >

                            {
                                index +
                                1
                            }

                        </button>
                    )
                )}

            </div>

        </div>
    );
}

// =========================
// STYLES
// =========================

const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px"
};

const createBtn = {
    background: "#2563EB",
    color: "white",
    border: "none",
    padding: "14px 20px",
    borderRadius: "12px",
    cursor: "pointer"
};

const filterContainer = {
    display: "flex",
    gap: "15px",
    marginBottom: "25px",
    background: "white",
    padding: "20px",
    borderRadius: "20px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)"
};

const inputStyle = {
    flex: 1,
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #ddd"
};

const selectStyle = {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    cursor: "pointer"
};

const paginationContainer = {
    display: "flex",
    gap: "10px",
    marginTop: "25px",
    justifyContent: "center"
};

const pageBtn = {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    cursor: "pointer"
};

const warningBannerStyle = {
    display: "flex",
    alignItems: "center",
    gap: "15px",
    background: "#fef3c7",
    borderLeft: "4px solid #f59e0b",
    padding: "15px 20px",
    borderRadius: "12px",
    marginBottom: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
};

const warningButtonStyle = {
    marginLeft: "auto",
    background: "#f59e0b",
    color: "white",
    border: "none",
    padding: "8px 16px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "13px"
};

export default ProductList;