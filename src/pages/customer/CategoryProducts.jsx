import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import CustomerLayout
    from "../../layouts/CustomerLayout";

import ProductCard
    from "../../components/customer/Prductcard/ProductCard";

import FilterSidebar
    from "../../components/customer/filters/FilterSidebar";

import {
    getProducts
} from "../../services/productService";

import {
    getCategories
} from "../../services/categoryService";

import {
    getBrands
} from "../../services/brandService";

function CategoryProducts() {

    // =========================
    // PARAMS
    // =========================

    const { id } = useParams();

    // =========================
    // STATES
    // =========================

    const [products, setProducts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [categoryName,
        setCategoryName] =
        useState("");

    const [brands, setBrands] =
        useState([]);

    const [childCategories,
        setChildCategories] =
        useState([]);

    // =========================
    // FILTER STATES
    // =========================

    const [selectedBrand,
        setSelectedBrand] =
        useState(null);

    const [selectedChildCategory,
        setSelectedChildCategory] =
        useState(null);

    const [selectedPrice,
        setSelectedPrice] =
        useState(null);

    const [sortBy,
        setSortBy] =
        useState("newest");

    // =========================
    // LOAD FILTER DATA
    // =========================

    useEffect(() => {

        loadFilters();

    }, [id]);

    const loadFilters = async () => {

        try {

            // =====================
            // LOAD BRANDS
            // =====================

            const brandRes =
                await getBrands();

            const brandData =

                brandRes.data?.data?.brands ||

                brandRes.data?.brands ||

                brandRes.data?.data ||

                [];

            setBrands(brandData);

            // =====================
            // LOAD CATEGORIES
            // =====================

            const categoryRes =
                await getCategories();

            const categories =
                Array.isArray(categoryRes)
                    ? categoryRes
                    : categoryRes?.data || [];

            // =====================
            // FIND CURRENT CATEGORY
            // =====================

            const currentCategory =
                categories.find(
                    (item) =>
                        item.id === Number(id)
                );

            if (currentCategory) {

                setCategoryName(
                    currentCategory.name
                );

                setChildCategories(

                    Array.isArray(
                        currentCategory.children
                    )

                        ? currentCategory.children

                        : []
                );

            } else {

                setCategoryName("");

                setChildCategories([]);
            }

        } catch (error) {

            console.log(
                "LOAD FILTER ERROR:",
                error
            );
        }
    };

    // =========================
    // FETCH PRODUCTS
    // =========================

    useEffect(() => {

        fetchProducts();

    }, [
        id,
        selectedBrand,
        selectedChildCategory,
        selectedPrice,
        sortBy
    ]);

const fetchProducts = async () => {

    try {

        setLoading(true);

        // =====================
        // PARAMS - CHỈ GỬI SORT, KHÔNG GỬI SORT_BY
        // =====================

        const params = {};

        // Category ID
        const categoryId = selectedChildCategory || id;
        if (categoryId) {
            params.category_id = categoryId;
        }

        params.limit = 50;

        // ✅ CHỈ GỬI SORT, KHÔNG GỬI SORT_BY
        if (sortBy === "price_asc") {
            params.sort = "price_asc";
        } else if (sortBy === "price_desc") {
            params.sort = "price_desc";
        } else if (sortBy === "newest") {
            params.sort = "newest";
        } else if (sortBy === "best_selling") {
            params.sort = "best_selling";
        } else {
            params.sort = "newest";
        }

        // ❌ KHÔNG gửi params.sort_by
        // ❌ KHÔNG gửi params.sort = sortParam + params.sort_by = sortParam

        // =====================
        // BRAND FILTER
        // =====================

        if (selectedBrand) {
            params.brand_id = selectedBrand;
        }

        // =====================
        // PRICE FILTER
        // =====================

        if (selectedPrice === "under_500") {
            params.max_price = 500000;
        }
        else if (selectedPrice === "500_1000") {
            params.min_price = 500000;
            params.max_price = 1000000;
        }
        else if (selectedPrice === "over_1000") {
            params.min_price = 1000000;
        }

        // =====================
        // DEBUG LOG
        // =====================
        console.log("=== FETCH PRODUCTS PARAMS ===");
        console.log("Params:", params);

        // =====================
        // API CALL
        // =====================

        const res = await getProducts(params);
        
        console.log("API Response:", res.data);

        // =====================
        // DATA
        // =====================

        let productsData = [];
        
        if (res.data?.data?.products) {
            productsData = res.data.data.products;
        } else if (res.data?.data && Array.isArray(res.data.data)) {
            productsData = res.data.data;
        } else if (res.data?.products && Array.isArray(res.data.products)) {
            productsData = res.data.products;
        } else if (Array.isArray(res.data)) {
            productsData = res.data;
        }

        console.log("Products loaded:", productsData.length);
        
        setProducts(productsData);

    } catch (error) {

        console.log("LOAD PRODUCTS ERROR:", error);
        setProducts([]);

    } finally {

        setLoading(false);
    }
};

    // =========================
    // CLEAR FILTER
    // =========================

    const clearFilters = () => {

        setSelectedBrand(null);
        setSelectedChildCategory(null);
        setSelectedPrice(null);
        setSortBy("newest");

    };

    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <CustomerLayout>

                <div style={styles.loading}>
                    Đang tải sản phẩm...
                </div>

            </CustomerLayout>

        );
    }

    // =========================
    // RENDER
    // =========================

    return (

        <CustomerLayout>

            <div style={styles.container}>

                {/* HEADER */}

                <div
                    style={{
                        ...styles.header,
                        textAlign: "center"
                    }}
                >

                    <h2 style={styles.title}>

                        {categoryName ||
                            "Danh mục"}

                    </h2>

                </div>

                {/* CONTENT */}

                <div style={styles.content}>

                    {/* SIDEBAR */}

                    <div style={styles.sidebar}>

                        <FilterSidebar

                            brands={brands}

                            childCategories={
                                childCategories
                            }

                            selectedBrand={
                                selectedBrand
                            }

                            setSelectedBrand={
                                setSelectedBrand
                            }

                            selectedChildCategory={
                                selectedChildCategory
                            }

                            setSelectedChildCategory={
                                setSelectedChildCategory
                            }

                            selectedPrice={
                                selectedPrice
                            }

                            setSelectedPrice={
                                setSelectedPrice
                            }
                        />

                        {/* CLEAR FILTER */}

                        <button
                            style={
                                styles.clearFilterBtn
                            }
                            onClick={
                                clearFilters
                            }
                        >

                            Xóa bộ lọc

                        </button>

                    </div>

                    {/* PRODUCTS */}

                    <div style={styles.productsSection}>

                        {/* TOOLBAR */}

                        <div style={styles.toolbar}>

                            <div
                                style={
                                    styles.resultCount
                                }
                            >

                                {
                                    products.length
                                } sản phẩm

                            </div>

                            <div
                                style={
                                    styles.sortBox
                                }
                            >

                                <span
                                    style={
                                        styles.sortLabel
                                    }
                                >

                                    Sắp xếp:

                                </span>

                                <select
                                    value={sortBy}
                                    onChange={(e) =>
                                        setSortBy(
                                            e.target.value
                                        )
                                    }
                                    style={
                                        styles.sortSelect
                                    }
                                >

                                    <option value="newest">
                                        Mới nhất
                                    </option>

                                    <option value="price_asc">
                                        Giá tăng dần
                                    </option>

                                    <option value="price_desc">
                                        Giá giảm dần
                                    </option>

                                    <option value="best_selling">
                                        Bán chạy
                                    </option>

                                </select>

                            </div>

                        </div>

                        {/* EMPTY */}

                        {products.length === 0 ? (

                            <div style={styles.empty}>

                                Không có sản phẩm

                            </div>

                        ) : (

                            <div style={styles.grid}>

                                {products.map((product) => (

                                    <div
                                        key={product.id}
                                        style={styles.productItem}
                                    >

                                        <ProductCard
                                            product={{

                                                ...product,

                                                image:
                                                    product.images?.[0]
                                                        ?.image_url ||

                                                    "https://via.placeholder.com/300",

                                                price:
                                                    Number(
                                                        product.variants?.[0]
                                                            ?.price
                                                    ) || 0
                                            }}
                                        />

                                    </div>

                                ))}

                            </div>

                        )}

                    </div>

                </div>

            </div>

        </CustomerLayout>

    );
}

// =========================
// STYLES
// =========================

const styles = {

    container: {

        width: "95%",

        maxWidth: "1500px",

        margin: "0 auto",

        padding: "30px 0"
    },

    header: {

        marginBottom: "30px"
    },

    title: {

        fontSize: "28px",

        fontWeight: "700",

        color: "#111",

        marginBottom: "8px"
    },

    loading: {

        padding: "50px",

        textAlign: "center",

        fontSize: "18px"
    },

    empty: {

        width: "100%",

        background: "#fff",

        border: "1px solid #eee",

        borderRadius: "16px",

        padding: "40px",

        textAlign: "center",

        fontSize: "16px",

        color: "#777"
    },

    content: {

        display: "flex",

        gap: "24px",

        alignItems: "flex-start"
    },

    sidebar: {

        width: "260px",

        position: "sticky",

        top: "20px"
    },

    productsSection: {

        flex: 1
    },

    toolbar: {

        width: "100%",

        display: "flex",

        justifyContent: "space-between",

        alignItems: "center",

        marginBottom: "20px",

        background: "#fff",

        padding: "16px 20px",

        borderRadius: "16px",

        border:
            "1px solid #f3e8df"
    },

    resultCount: {

        fontSize: "14px",

        fontWeight: "600",

        color: "#444"
    },

    sortBox: {

        display: "flex",

        alignItems: "center",

        gap: "10px"
    },

    sortLabel: {

        fontSize: "14px",

        color: "#666"
    },

    sortSelect: {

        height: "40px",

        padding: "0 14px",

        borderRadius: "10px",

        border: "1px solid #ddd",

        background: "#fff",

        outline: "none",

        cursor: "pointer",

        fontSize: "13px"
    },

    clearFilterBtn: {

        width: "100%",

        height: "44px",

        border: "none",

        borderRadius: "12px",

        background: "#ff6b00",

        color: "white",

        fontWeight: "600",

        cursor: "pointer",

        marginTop: "16px",

        fontSize: "14px"
    },

    grid: {

        display: "grid",

        gridTemplateColumns:
            "repeat(auto-fill, minmax(220px, 1fr))",

        gap: "20px"
    },

    productItem: {

        width: "100%"
    }
};

export default CategoryProducts;