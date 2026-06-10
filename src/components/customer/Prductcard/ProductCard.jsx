
import { Link } from "react-router-dom";

import { useMemo, useState } from "react";

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
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='18'%3ENo Image%3C/text%3E%3C/svg%3E";

function ProductCard({ product }) {

    // =========================
    // CONTEXT
    // =========================

    const {
        increaseCartCount
    } = useCart();

    // =========================
    // STATES
    // =========================

    const [loading,
        setLoading] =
        useState(false);

    const [imageError,
        setImageError] =
        useState(false);

    const [showQuickShop,
        setShowQuickShop] =
        useState(false);

    // =========================
    // VALIDATE
    // =========================

    if (!product) return null;

    // =========================
    // BASIC INFO
    // =========================

    const productId =
        product.id ||
        product._id;

    const productName =
        product.name ||
        "Sản phẩm";

    const variants =
        product.variants || [];

    // =========================
    // PRICE
    // =========================

    const firstVariant =
        variants[0];

    const originalPrice =
        Number(
            product.price ||
            firstVariant?.price ||
            0
        );

    const salePrice =
        Number(
            product.sale_price ??
            firstVariant?.sale_price ??
            originalPrice
        );

    const hasDiscount =
        salePrice < originalPrice;

    const discount =
        product.discount ||
        firstVariant?.discount;

    // =========================
    // STOCK
    // =========================

    const totalQuantity =
        variants.reduce(
            (sum, item) =>
                sum + (
                    Number(item.quantity) || 0
                ),
            0
        );

    const outOfStock =
        totalQuantity <= 0;

    // =========================
    // IMAGE
    // =========================

    const productImage =
        useMemo(() => {

            if (imageError) {
                return FALLBACK_IMAGE;
            }

            const image =
                product.images?.[0]?.image_url
                ||
                product.images?.[0]?.url
                ||
                product.image
                ||
                product.thumbnail;

            return image || FALLBACK_IMAGE;

        }, [product, imageError]);

    // =========================
    // FORMAT PRICE
    // =========================

    const formatPrice =
        (value) =>
            Number(value)
                .toLocaleString(
                    "vi-VN"
                ) + "đ";

    // =========================
    // IMAGE ERROR
    // =========================

    const handleImageError =
        () => {

            setImageError(true);

        };

    // =========================
    // BUY
    // =========================

    const handleBuy =
        async () => {

            // LOGIN CHECK

            const token =
                localStorage.getItem(
                    "token"
                );

            if (!token) {

                alert(
                    "Vui lòng đăng nhập để mua hàng"
                );

                return;
            }

            // OUT OF STOCK

            if (outOfStock) {

                alert(
                    "Sản phẩm hiện đã hết hàng"
                );

                return;
            }

            // NO VARIANT

            if (
                variants.length === 0
            ) {

                alert(
                    "Sản phẩm chưa có phân loại"
                );

                return;
            }

            // MULTIPLE VARIANTS

            if (
                variants.length > 1
            ) {

                setShowQuickShop(
                    true
                );

                return;
            }

            // SINGLE VARIANT

            try {

                setLoading(true);

                await addToCart({

                    product_variant_id:
                        variants[0].id,

                    quantity: 1
                });

                increaseCartCount(1);

                alert(
                    "Đã thêm vào giỏ hàng"
                );

            } catch (error) {

                alert(

                    error.response?.data?.message ||

                    "Thêm giỏ hàng thất bại"
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

                        {/* DISCOUNT */}

                        {discount && (

                            <div className="discount-badge">

                                {
                                    discount.type === "percent"

                                        ? `-${discount.value}%`

                                        : `-${formatPrice(
                                            discount.value
                                        )}`
                                }

                            </div>

                        )}

                        {/* STOCK */}

                        {outOfStock && (

                            <div className="stock-badge">

                                Hết hàng

                            </div>

                        )}

                        <img
                            src={productImage}
                            alt={productName}
                            className="product-image"
                            onError={handleImageError}
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

                    {/* CODE */}

                    {product.product_code && (

                        <p className="product-code">

                            #{product.product_code}

                        </p>

                    )}

                    {/* NAME */}

                    <Link
                        to={`/product/${productId}`}
                        className="product-title-link"
                    >

                        <h3 className="product-title">

                            {productName}

                        </h3>

                    </Link>

                    {/* DESCRIPTION */}

                    {product.short_description && (

                        <p className="product-description">

                            {product.short_description}

                        </p>

                    )}

                    {/* PRICE */}

                    <div className="product-price">

                        {hasDiscount && (

                            <span className="old-price">

                                {formatPrice(
                                    originalPrice
                                )}

                            </span>

                        )}

                        <span className="sale-price">

                            {formatPrice(
                                salePrice
                            )}

                        </span>

                    </div>

                    {/* BUTTON */}

                    <button
                        className="add-to-cart-btn"
                        onClick={handleBuy}
                        disabled={
                            loading ||
                            outOfStock
                        }
                    >

                        {
                            loading
                                ? "Đang thêm..."
                                : outOfStock
                                    ? "Hết hàng"
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

                        onClose={() =>
                            setShowQuickShop(false)
                        }
                    />

                )
            }

        </>

    );
}

export default ProductCard;

