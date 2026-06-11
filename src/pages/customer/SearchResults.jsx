import { useEffect, useState } from "react";

import { useLocation, useNavigate } from "react-router-dom";

import { FaSearch, FaSpinner } from "react-icons/fa";

// IMPORT LAYOUT VÀ PRODUCT CARD
import CustomerLayout from "../../layouts/CustomerLayout";
import ProductCard from "../../components/customer/Prductcard/ProductCard";

import { searchProducts } from "../../services/productService";

function SearchResults() {

    // =========================
    // STATES
    // =========================

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sortBy, setSortBy] = useState("relevance");

    // =========================
    // HOOKS
    // =========================

    const location = useLocation();
    const navigate = useNavigate();

    // =========================
    // GET SEARCH QUERY
    // =========================

    const searchQuery = new URLSearchParams(location.search).get("q") || "";

    // =========================
    // LOAD SEARCH RESULTS
    // =========================

    useEffect(() => {

        if (!searchQuery) {
            navigate("/");
            return;
        }

        loadSearchResults();

    }, [searchQuery]);

    const loadSearchResults = async () => {

        setLoading(true);
        setError(null);

        try {

            console.log("Searching for:", searchQuery);

            const productsArray = await searchProducts(searchQuery);

            console.log("Products found:", productsArray);
            
            // ✅ Debug cấu trúc giá của sản phẩm đầu tiên
            if (productsArray && productsArray.length > 0) {
                console.log("Sample product price structure:", productsArray[0].price);
                console.log("Sample product variants:", productsArray[0].variants);
                console.log("Full sample product:", productsArray[0]);
            }

            const finalProducts = Array.isArray(productsArray) ? productsArray : [];

            setProducts(finalProducts);

            if (finalProducts.length === 0) {
                setError("Không tìm thấy sản phẩm nào");
            }

        } catch (error) {

            console.log("SEARCH ERROR:", error);
            setError("Có lỗi xảy ra khi tìm kiếm");
            setProducts([]);

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // APPLY SORT
    // =========================

    const getSortedProducts = () => {

        if (!Array.isArray(products) || products.length === 0) {
            return [];
        }

        let result = [...products];

        switch (sortBy) {
            case "price_asc":
                result.sort((a, b) => {
                    const priceA = a.variants?.[0]?.price || a.price || 0;
                    const priceB = b.variants?.[0]?.price || b.price || 0;
                    return priceA - priceB;
                });
                break;
            case "price_desc":
                result.sort((a, b) => {
                    const priceA = a.variants?.[0]?.price || a.price || 0;
                    const priceB = b.variants?.[0]?.price || b.price || 0;
                    return priceB - priceA;
                });
                break;
            case "name_asc":
                result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
                break;
            case "name_desc":
                result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
                break;
            default:
                break;
        }

        return result;
    };

    const sortedProducts = getSortedProducts();

    // =========================
    // LẤY GIÁ SẢN PHẨM (FIX NaN)
    // =========================
    const getProductPrice = (product) => {
        // Ưu tiên lấy giá từ variants đầu tiên
        if (product.variants && product.variants.length > 0 && product.variants[0].price) {
            return Number(product.variants[0].price);
        }
        // Nếu không có variants, lấy price trực tiếp
        if (product.price) {
            return Number(product.price);
        }
        // Fallback
        return 0;
    };

    // =========================
    // LẤY ẢNH SẢN PHẨM
    // =========================
    const getProductImage = (product) => {
        if (product.images && product.images.length > 0 && product.images[0].image_url) {
            return product.images[0].image_url;
        }
        if (product.image) {
            return product.image;
        }
        return "https://via.placeholder.com/300";
    };

    // =========================
    // XỬ LÝ CLICK VÀO SẢN PHẨM
    // =========================
    const handleProductClick = (productId) => {
        if (productId) {
            navigate(`/product/${productId}`);
        }
    };

    // =========================
    // RENDER LOADING
    // =========================

    if (loading) {
        return (
            <CustomerLayout>
                <div style={styles.loadingContainer}>
                    <FaSpinner style={styles.spinner} />
                    <p>Đang tìm kiếm...</p>
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
                    <h1 style={styles.title}>Kết quả tìm kiếm</h1>
                    <div style={styles.searchInfo}>
                        {/* <span style={styles.keyword}>
                            🔍 "{searchQuery}"
                        </span> */}
                        <span style={styles.resultCount}>
                            {products.length} sản phẩm
                        </span>
                    </div>
                </div>

                {/* TOOLBAR - CHỈ HIỆN KHI CÓ SẢN PHẨM */}
                {products.length > 0 && (
                    <div style={styles.toolbar}>
                        <div style={styles.sortBox}>
                            <span style={styles.sortLabel}>Sắp xếp:</span>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                style={styles.sortSelect}
                            >
                                <option value="relevance">Liên quan nhất</option>
                                <option value="price_asc">Giá tăng dần</option>
                                <option value="price_desc">Giá giảm dần</option>
                                <option value="name_asc">Tên A-Z</option>
                                <option value="name_desc">Tên Z-A</option>
                            </select>
                        </div>
                    </div>
                )}

                {/* ERROR STATE */}
                {error ? (
                    <div style={styles.emptyContainer}>
                        <div style={styles.emptyIcon}>🔍</div>
                        <h3 style={styles.emptyTitle}>{error}</h3>
                        <p style={styles.emptyText}>Hãy thử tìm kiếm với từ khóa khác</p>
                        <button onClick={() => navigate("/")} style={styles.backHomeBtn}>
                            Về trang chủ
                        </button>
                    </div>
                ) : products.length === 0 ? (
                    <div style={styles.emptyContainer}>
                        <div style={styles.emptyIcon}>🔍</div>
                        <h3 style={styles.emptyTitle}>Không tìm thấy sản phẩm</h3>
                        <p style={styles.emptyText}>
                            Không có sản phẩm nào phù hợp với từ khóa "{searchQuery}"
                        </p>
                        <button onClick={() => navigate("/")} style={styles.backHomeBtn}>
                            Tiếp tục mua sắm
                        </button>
                    </div>
                ) : (
                    <>
                        {/* PRODUCTS GRID - TỐI ĐA 5 SẢN PHẨM/HÀNG */}
                        <div style={styles.grid}>
                            {sortedProducts.map((product, index) => {
                                const productPrice = getProductPrice(product);
                                const productImage = getProductImage(product);
                                
                                return (
                                    <div 
                                        key={product.id || index} 
                                        style={styles.productItem}
                                        onClick={() => handleProductClick(product.id)}
                                    >
                                        <ProductCard
                                            product={{
                                                ...product,
                                                image: productImage,
                                                price: productPrice
                                            }}
                                        />
                                    </div>
                                );
                            })}
                        </div>

                        {/* SHOW MORE BUTTON (nếu cần) */}
                        {products.length >= 20 && (
                            <div style={styles.showMoreContainer}>
                                <button 
                                    style={styles.showMoreBtn}
                                    onClick={() => {
                                        console.log("Load more products");
                                    }}
                                >
                                    Xem thêm sản phẩm
                                </button>
                            </div>
                        )}
                    </>
                )}

            </div>
        </CustomerLayout>
    );
}

// =========================
// STYLES
// =========================

const styles = {
    container: {
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "30px 20px",
        minHeight: "100vh"
    },

    header: {
        textAlign: "center",
        marginBottom: "30px"
    },

    title: {
        fontSize: "28px",
        fontWeight: "700",
        color: "#111",
        marginBottom: "12px"
    },

    searchInfo: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
        flexWrap: "wrap"
    },

    keyword: {
        fontSize: "16px",
        color: "#ff6b00",
        fontWeight: "600",
        background: "#fff5ee",
        padding: "8px 20px",
        borderRadius: "30px"
    },

    resultCount: {
        fontSize: "14px",
        color: "#666",
        background: "#f5f5f5",
        padding: "8px 20px",
        borderRadius: "30px"
    },

    toolbar: {
        display: "flex",
        justifyContent: "flex-end",
        marginBottom: "24px",
        paddingBottom: "16px",
        borderBottom: "1px solid #eee"
    },

    sortBox: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },

    sortLabel: {
        fontSize: "14px",
        color: "#666",
        fontWeight: "500"
    },

    sortSelect: {
        height: "40px",
        padding: "0 16px",
        borderRadius: "10px",
        border: "1px solid #ddd",
        background: "#fff",
        outline: "none",
        cursor: "pointer",
        fontSize: "14px",
        minWidth: "140px"
    },

    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(5, 1fr)",
        gap: "20px",
        marginTop: "20px"
    },

    productItem: {
        width: "100%",
        cursor: "pointer",  // ✅ Thêm cursor pointer để biết có thể click
        transition: "transform 0.2s ease"
    },

    loadingContainer: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "400px",
        gap: "16px"
    },

    spinner: {
        fontSize: "48px",
        animation: "spin 1s linear infinite",
        color: "#ff6b00"
    },

    emptyContainer: {
        textAlign: "center",
        padding: "60px 20px",
        background: "#fff",
        borderRadius: "16px",
        marginTop: "40px"
    },

    emptyIcon: {
        fontSize: "64px",
        marginBottom: "20px"
    },

    emptyTitle: {
        fontSize: "20px",
        fontWeight: "600",
        color: "#333",
        marginBottom: "10px"
    },

    emptyText: {
        fontSize: "14px",
        color: "#777",
        marginBottom: "24px"
    },

    backHomeBtn: {
        padding: "12px 30px",
        background: "#ff6b00",
        color: "white",
        border: "none",
        borderRadius: "30px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s"
    },

    showMoreContainer: {
        textAlign: "center",
        marginTop: "40px"
    },

    showMoreBtn: {
        padding: "12px 32px",
        background: "transparent",
        color: "#ff6b00",
        border: "2px solid #ff6b00",
        borderRadius: "30px",
        fontSize: "14px",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.3s"
    }
};

// Thêm animation cho spinner
const styleSheet = document.createElement("style");
styleSheet.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(styleSheet);

export default SearchResults;