import { useEffect, useState, useCallback, useMemo } from "react";
import { getBestSellingProducts } from "../../services/productService";
import ProductCard from "./PrductCard/ProductCard";

import "./BestSellingProducts.css";

// Import banner image
import bannerImage from "../../assets/Banner_2.png";

function BestSellingProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Banner dọc với ảnh từ assets - Dùng useMemo để tránh tạo lại object
    const verticalBanner = useMemo(() => ({
        imageUrl: bannerImage,
        alt: "Banner quảng cáo dọc",
        link: "/khuyen-mai"
    }), []);

    // =========================
    // FETCH BEST SELLING PRODUCTS
    // =========================
    useEffect(() => {
        let isMounted = true; // Chống memory leak
        
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await getBestSellingProducts(8);
                const productsArray = res.data?.data?.products || [];
                
                if (isMounted) {
                    setProducts(productsArray);
                }
            } catch (error) {
                console.log("Lỗi load sản phẩm bán chạy:", error);
                if (isMounted) {
                    setProducts([]);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();
        
        return () => {
            isMounted = false;
        };
    }, []); // Empty array - chỉ chạy 1 lần

    // =========================
    // HANDLE ADD TO CART CALLBACK - Tránh tạo function mới mỗi lần render
    // =========================
    const handleAddToCartSuccess = useCallback((productId, quantity) => {
        console.log(`Added ${quantity} of product ${productId} to cart`);
        // Có thể dispatch event hoặc update state nếu cần
    }, []);

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <section className="bestselling-loading">
                <div className="bestselling-spinner"></div>
                <p>Đang tải sản phẩm bán chạy...</p>
            </section>
        );
    }

    if (products.length === 0) {
        return null;
    }

    // =========================
    // UI - LAYOUT 2 CỘT (25% BANNER + 75% PRODUCTS)
    // =========================
    return (
        <section className="bestselling-products">
            <div className="bestselling-container">
                {/* HEADER */}
                <div className="bestselling-header">
                    <div className="bestselling-title-wrapper">
                        <h2 className="bestselling-title">
                            🔥 Sản phẩm bán chạy
                        </h2>
                        <p className="bestselling-subtitle">
                            Những sản phẩm được yêu thích nhất
                        </p>
                    </div>
                </div>

                {/* LAYOUT 2 CỘT */}
                <div className="bestselling-two-columns">
                    {/* CỘT TRÁI: BANNER DỌC (25%) */}
                    <aside className="bestselling-banner">
                        <a href={verticalBanner.link}>
                            <img
                                src={verticalBanner.imageUrl}
                                alt={verticalBanner.alt}
                                className="banner-image"
                                loading="lazy"
                            />
                        </a>
                    </aside>

                    {/* CỘT PHẢI: GRID SẢN PHẨM (75%) */}
                    <div className="bestselling-products-grid">
                        {products.map((product) => (
                            <div key={product.id} className="bestselling-product-item">
                                <ProductCard 
                                    product={product} 
                                    onAddToCartSuccess={handleAddToCartSuccess}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

export default BestSellingProducts;