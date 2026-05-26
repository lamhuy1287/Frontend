import { Link } from "react-router-dom";
import { useState } from "react";

import "./ProductCard.css";

import QuickShopModal
    from "./QuickShopModal";

import {
    addToCart
} from "../../../services/cartService";

import {
    useCart
} from "../../../context/CartContext";

const FALLBACK_IMAGE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

function ProductCard({ product }) {

    // =========================
    // CART CONTEXT
    // =========================

    const {
        increaseCartCount
    } = useCart();

    // =========================
    // STATES
    // =========================

    const [imageError,
        setImageError] =
        useState(false);

    const [showQuickShop,
        setShowQuickShop] =
        useState(false);

    const [loading,
        setLoading] =
        useState(false);

    if (!product) {

        console.log(
            "NO PRODUCT"
        );

        return null;

    }

    const productId =
        product.id || product._id;

    const productName =
        product.name ||
        "Không có tên";

    // =========================
    // PRICE
    // =========================

    let originalPrice = 0;

    let salePrice = 0;

    if (
        product.variants &&
        product.variants.length > 0
    ) {

        const firstVariant =
            product.variants[0];

        originalPrice =
            Number(firstVariant.price) || 0;

        salePrice =
            Number(
                firstVariant.discount_price
            ) || originalPrice;

    } else {

        originalPrice =
            Number(product.price) ||
            Number(
                product.original_price
            ) ||
            0;

        salePrice =
            Number(
                product.discount_price
            ) ||
            Number(product.sale_price) ||
            originalPrice;

    }

    const hasDiscount =
        salePrice < originalPrice &&
        salePrice > 0;

    const displayPrice =
        hasDiscount
            ? salePrice
            : originalPrice;

    // =========================
    // IMAGE
    // =========================

    const getProductImage = () => {

        if (imageError) {

            return FALLBACK_IMAGE;

        }

        let imageUrl = "";

        if (
            product.images &&
            product.images.length > 0
        ) {

            imageUrl =
                product.images[0]
                    .image_url ||
                product.images[0].url ||
                "";

        }

        if (!imageUrl) {

            imageUrl =
                product.image ||
                product.thumbnail ||
                "";

        }

        if (!imageUrl) {

            return FALLBACK_IMAGE;

        }

        return imageUrl;

    };

    // =========================
    // FORMAT PRICE
    // =========================

    const formatPrice = (
        value
    ) => {

        if (
            !value ||
            isNaN(value) ||
            value === 0
        ) {

            return "Liên hệ";

        }

        return (
            value.toLocaleString(
                "vi-VN"
            ) + "₫"
        );

    };

    // =========================
    // IMAGE ERROR
    // =========================

    const handleImageError =
        () => {

            setImageError(true);

        };

    // =========================
    // ADD TO CART / QUICKSHOP
    // =========================

    const handleBuy =
        async () => {

            console.log(
                "CLICK BUY"
            );

            // =========================
            // LOGIN
            // =========================

            const token =
                localStorage.getItem(
                    "token"
                );

            if (!token) {

                alert(
                    "Vui lòng đăng nhập"
                );

                return;

            }

            // =========================
            // NO VARIANTS
            // =========================

            if (
                !product.variants ||
                product.variants.length === 0
            ) {

                alert(
                    "Sản phẩm chưa có phân loại"
                );

                return;

            }

            console.log(
                "TOTAL VARIANTS:",
                product.variants.length
            );

            // =========================
            // MULTIPLE VARIANTS
            // OPEN MODAL
            // =========================

            if (
                product.variants.length > 1
            ) {

                console.log(
                    "OPEN QUICKSHOP"
                );

                setShowQuickShop(
                    true
                );

                return;

            }

            // =========================
            // ONLY 1 VARIANT
            // AUTO ADD CART
            // =========================

            try {

                setLoading(true);

                const variant =
                    product.variants[0];

                console.log(
                    "AUTO ADD CART:",
                    variant
                );

                await addToCart({

                    product_variant_id:
                        variant.id,

                    quantity: 1

                });

                // REALTIME HEADER
                increaseCartCount(
                    1
                );

                console.log(
                    "ADD CART SUCCESS"
                );

                alert(
                    "Đã thêm vào giỏ hàng"
                );

            } catch (error) {

                console.log(
                    "ADD CART ERROR:",
                    error
                );

                alert(
                    error.response?.data?.message ||
                    "Add to cart failed"
                );

            } finally {

                setLoading(false);

            }

        };

    return (

        <>

            <div className="product-card">

                {/* IMAGE */}

                <Link
                    to={`/product/${productId}`}
                    className="product-image-link"
                >

                    <div className="product-image-wrapper">

                        <img
                            src={
                                getProductImage()
                            }
                            alt={
                                productName
                            }
                            className="product-image"
                            onError={
                                handleImageError
                            }
                            loading="lazy"
                        />

                    </div>

                </Link>

                {/* CONTENT */}

                <div className="product-content">

                    {/* BADGE */}

                    {product.badge && (

                        <span className="product-badge">

                            {product.badge}

                        </span>

                    )}

                    {/* PRODUCT CODE */}

                    {product.product_code && (

                        <p className="product-code">

                            {
                                product.product_code
                            }

                        </p>

                    )}

                    {/* PRODUCT NAME */}

                    <Link
                        to={`/product/${productId}`}
                    >

                        <h3 className="product-title">

                            {productName}

                        </h3>

                    </Link>

                    {/* DESCRIPTION */}

                    {product.short_description && (

                        <p className="product-description">

                            {
                                product.short_description
                            }

                        </p>

                    )}

                    {/* PRICE */}

                    <div className="product-price">

                        {hasDiscount ? (

                            <div className="price-group">

                                <span className="old-price">

                                    {
                                        formatPrice(
                                            originalPrice
                                        )
                                    }

                                </span>

                                <span className="sale-price">

                                    {
                                        formatPrice(
                                            salePrice
                                        )
                                    }

                                </span>

                            </div>

                        ) : (

                            <span className="current-price">

                                {
                                    formatPrice(
                                        displayPrice
                                    )
                                }

                            </span>

                        )}

                    </div>

                    {/* BUTTON */}

                    <button
                        onClick={
                            handleBuy
                        }
                        className="add-to-cart-btn"
                        disabled={loading}
                    >

                        {
                            loading
                                ? "Đang thêm..."
                                : "Chọn mua"
                        }

                    </button>

                </div>

            </div>

            {/* QUICK SHOP */}

            {
                showQuickShop && (

                    <QuickShopModal
                        product={product}
                        onClose={() => {

                            console.log(
                                "CLOSE MODAL"
                            );

                            setShowQuickShop(false);

                        }}
                    />

                )
            }

        </>

    );

}

export default ProductCard;