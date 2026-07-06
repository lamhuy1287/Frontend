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
import WarningBanner from "./components/WarningBanner";

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
        useState("all");

    const [page, setPage] =
        useState(1);

    const [total, setTotal] =
        useState(0);

    const [stockSummary, setStockSummary] =
        useState({
            low_stock: 0,
            out_of_stock: 0,
            has_low_stock_variant: 0,
            has_out_of_stock_variant: 0,
            in_stock: 0,
            total_products: 0
        });

    const [showWarning, setShowWarning] =
        useState({
            low_stock: false,
            out_of_stock: false,
            has_low_stock_variant: false,
            has_out_of_stock_variant: false
        });

    const [isWarningVisible, setIsWarningVisible] = useState(true);

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

                if (stockFilter !== "all") {
                    params.stock_filter = stockFilter;
                }

                console.log("Fetching products with params:", params);

                const res =
                    await getProducts(params);

                console.log("API Response:", res.data);

                const productsData = res.data.data?.products || [];
                
                const enrichedProducts = productsData.map(product => {
                    if (product.total_quantity !== undefined && product.low_stock_variants !== undefined) {
                        return product;
                    }
                    const totalQty = getTotalQuantityFromVariants(product.variants);
                    const stockInfo = getStockStatusInfo(totalQty);
                    
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
                    setShowWarning({
                        low_stock: res.data.data.low_stock > 0,
                        out_of_stock: res.data.data.out_of_stock > 0,
                        has_low_stock_variant: res.data.data.has_low_stock_variant > 0,
                        has_out_of_stock_variant: res.data.data.has_out_of_stock_variant > 0
                    });
                    setIsWarningVisible(true);
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
    // CLOSE WARNING
    // =========================

    const handleCloseWarning = () => {
        setIsWarningVisible(false);
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
    // RENDER
    // =========================

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
            {isWarningVisible && (
                <WarningBanner
                    stockSummary={stockSummary}
                    showWarning={showWarning}
                    onFilterChange={handleStockFilterChange}
                    onClose={handleCloseWarning}
                    activeFilter={stockFilter}
                />
            )}

            {/* FILTER - ĐÃ BỎ PHẦN LỌC TRẠNG THÁI */}
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

export default ProductList;