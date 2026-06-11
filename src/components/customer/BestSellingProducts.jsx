import { useEffect, useState } from "react";
import { getBestSellingProducts } from "../../services/productService";
import ProductCard from "./PrductCard/ProductCard";

import "./BestSellingProducts.css";

// Import banner image
import bannerImage from "../../assets/Banner_2.png";

function BestSellingProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Banner dọc với ảnh từ assets
    const verticalBanner = {
        imageUrl: bannerImage,
        alt: "Banner quảng cáo dọc",
        link: "/khuyen-mai" // Bạn có thể sửa link này
    };

    // =========================
    // FETCH BEST SELLING PRODUCTS
    // =========================
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const res = await getBestSellingProducts(8); // Lấy 8 sản phẩm
                const productsArray = res.data?.data?.products || [];
                setProducts(productsArray);
            } catch (error) {
                console.log("Lỗi load sản phẩm bán chạy:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
                            />
                        </a>
                    </aside>

                    {/* CỘT PHẢI: GRID SẢN PHẨM (75%) */}
                    <div className="bestselling-products-grid">
                        {products.map((product) => (
                            <div key={product.id} className="bestselling-product-item">
                                <ProductCard product={product} />
                            </div>
                        ))}
                    </div>

                </div>

            </div>
        </section>
    );
}

export default BestSellingProducts;