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

            console.log(
                "BRAND RESPONSE:",
                brandRes.data
            );

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

                // CATEGORY NAME

                setCategoryName(
                    currentCategory.name
                );

                // CHILD CATEGORY

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
        selectedPrice
    ]);

    const fetchProducts = async () => {

        try {

            setLoading(true);

            // =====================
            // PARAMS
            // =====================

            const params = {

                category_id:
                    selectedChildCategory || id,

                limit: 50
            };

            // =====================
            // BRAND FILTER
            // =====================

            if (selectedBrand) {

                params.brand_id =
                    selectedBrand;
            }

            // =====================
            // PRICE FILTER
            // =====================

            if (
                selectedPrice ===
                "under_500"
            ) {

                params.max_price =
                    500000;
            }

            if (
                selectedPrice ===
                "500_1000"
            ) {

                params.min_price =
                    500000;

                params.max_price =
                    1000000;
            }

            if (
                selectedPrice ===
                "over_1000"
            ) {

                params.min_price =
                    1000000;
            }

            // =====================
            // API
            // =====================

            const res =
                await getProducts(
                    params
                );

            console.log(
                "FILTER PRODUCTS:",
                res.data
            );

            // =====================
            // DATA
            // =====================

            const productsData =
                res.data?.data?.products || [];

            setProducts(
                productsData
            );

        } catch (error) {

            console.log(
                "LOAD PRODUCTS ERROR:",
                error
            );

            setProducts([]);

        } finally {

            setLoading(false);
        }
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

                <div style={styles.header}>

                    <h2 style={styles.title}>

                        {categoryName ||
                            "Danh mục"}

                    </h2>

                </div>

                {/* CONTENT */}

                <div style={styles.content}>

                    {/* SIDEBAR */}

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

                    {/* PRODUCTS */}

                    <div style={styles.productsSection}>

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

        width: "100%",

        maxWidth: "1400px",

        margin: "0 auto",

        padding: "30px 20px"
    },

    header: {

        marginBottom: "30px",
        textAlign: "center"
    },

    title: {

        fontSize: "32px",

        fontWeight: "700",

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

        borderRadius: "12px",

        padding: "40px",

        textAlign: "center",

        fontSize: "18px",

        color: "#777"
    },

    content: {

        display: "flex",

        gap: "25px",

        alignItems: "flex-start"
    },

    productsSection: {

        flex: 1
    },

    grid: {

        display: "grid",

        gridTemplateColumns:
            "repeat(auto-fill, minmax(250px, 1fr))",

        gap: "20px"
    },

    productItem: {

        width: "100%"
    }
};

export default CategoryProducts;