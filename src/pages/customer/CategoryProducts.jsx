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

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [categoryName, setCategoryName] = useState("");
    const [brands, setBrands] = useState([]);
    const [childCategories, setChildCategories] = useState([]);

    // =========================
    // FILTER STATES
    // =========================

    const [selectedBrand, setSelectedBrand] = useState(null);
    const [selectedChildCategory, setSelectedChildCategory] = useState(null);
    const [selectedPrice, setSelectedPrice] = useState(null);
    const [sortBy, setSortBy] = useState("newest");

    // =========================
    // LOAD FILTER DATA
    // =========================

    useEffect(() => {
        loadFilters();
    }, [id]);

    const loadFilters = async () => {

        try {

            // LOAD BRANDS
            const brandRes = await getBrands();

            let brandData = [];
            if (brandRes?.data && Array.isArray(brandRes.data)) {
                brandData = brandRes.data;
            } else if (brandRes?.data?.brands && Array.isArray(brandRes.data.brands)) {
                brandData = brandRes.data.brands;
            } else if (brandRes?.brands && Array.isArray(brandRes.brands)) {
                brandData = brandRes.brands;
            } else if (Array.isArray(brandRes)) {
                brandData = brandRes;
            }

            setBrands(brandData);

            // LOAD CATEGORIES
            const categoryRes = await getCategories();

            let categories = [];
            if (categoryRes?.data && Array.isArray(categoryRes.data)) {
                categories = categoryRes.data;
            } else if (Array.isArray(categoryRes)) {
                categories = categoryRes;
            }

            const currentCategory = categories.find(
                (item) => item.id === Number(id)
            );

            if (currentCategory) {
                setCategoryName(currentCategory.name);
                setChildCategories(currentCategory.children || []);
            }

        } catch (error) {
            console.log("LOAD FILTER ERROR:", error);
        }
    };

    // =========================
    // FETCH PRODUCTS & FILTER BRANDS
    // =========================

    const fetchProducts = async () => {

        try {

            setLoading(true);

            const params = {};

            const categoryId = selectedChildCategory || id;
            if (categoryId) {
                params.category_id = categoryId;
            }

            params.limit = 100; // Tăng limit để lấy đủ brand

            if (sortBy === "price_asc") {
                params.sort = "price_asc";
            } else if (sortBy === "price_desc") {
                params.sort = "price_desc";
            } else {
                params.sort = "newest";
            }

            if (selectedBrand) {
                params.brand_id = selectedBrand;
            }

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

            const res = await getProducts(params);

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

            setProducts(productsData);

        } catch (error) {
            console.log("LOAD PRODUCTS ERROR:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // GỌI FETCH PRODUCTS KHI FILTER THAY ĐỔI
    // =========================

    useEffect(() => {
        fetchProducts();
    }, [id, selectedBrand, selectedChildCategory, selectedPrice, sortBy]);

    // =========================
    // 🎯 LỌC BRAND RIÊNG - CHẠY SAU KHI CÓ PRODUCTS
    // =========================
    
    // Lấy danh sách brand_id có trong products
    const brandIdsFromProducts = products.length > 0 
        ? [...new Set(products.map(p => p.brand_id).filter(Boolean))]
        : [];
    
    // Lọc brands chỉ lấy những brand có trong products
    const availableBrands = brands.filter(brand => 
        brandIdsFromProducts.includes(brand.id)
    );

    // =========================
    // LOADING
    // =========================

    if (loading) {
        return (
            <CustomerLayout>
                <div style={styles.loading}>Đang tải sản phẩm...</div>
            </CustomerLayout>
        );
    }

    // =========================
    // RENDER
    // =========================

    return (
        <CustomerLayout>
            <div style={styles.container}>
                <div style={{ ...styles.header, textAlign: "center" }}>
                    <h2 style={styles.title}>{categoryName || "Danh mục"}</h2>
                </div>

                <div style={styles.content}>
                    <div style={styles.sidebar}>
                        <FilterSidebar
                            // ✅ Dùng availableBrands đã được lọc
                            brands={availableBrands}
                            selectedBrand={selectedBrand}
                            setSelectedBrand={setSelectedBrand}
                            childCategories={childCategories}
                            selectedChildCategory={selectedChildCategory}
                            setSelectedChildCategory={setSelectedChildCategory}
                            selectedPrice={selectedPrice}
                            setSelectedPrice={setSelectedPrice}
                            isCollapsible={true}
                        />
                    </div>

                    <div style={styles.productsSection}>
                        <div style={styles.toolbar}>
                            <div style={styles.resultCount}>{products.length} sản phẩm</div>
                            <div style={styles.sortBox}>
                                <span style={styles.sortLabel}>Sắp xếp:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    style={styles.sortSelect}
                                >
                                    <option value="newest">Mới nhất</option>
                                    <option value="price_asc">Giá tăng dần</option>
                                    <option value="price_desc">Giá giảm dần</option>
                                    {/* <option value="best_selling">Bán chạy</option> */}
                                </select>
                            </div>
                        </div>

                        {products.length === 0 ? (
                            <div style={styles.empty}>Không có sản phẩm</div>
                        ) : (
                            <div style={styles.grid}>
                                {products.map((product) => {
                                    const productPrice = product.variants?.[0]?.price || product.price || 0;
                                    const productImage = product.images?.[0]?.image_url || product.image || "https://picsum.photos/300/300";

                                    return (
                                        <div key={product.id} style={styles.productItem}>
                                            <ProductCard
                                                product={{
                                                    ...product,
                                                    image: productImage,
                                                    price: Number(productPrice)
                                                }}
                                            />
                                        </div>
                                    );
                                })}
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
        width: "280px",
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
        border: "1px solid #f3e8df"
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
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "20px"
    },
    productItem: {
        width: "100%"
    }
};

export default CategoryProducts;