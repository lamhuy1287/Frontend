import { Link } from "react-router-dom";
import { useState } from "react";

import "./ProductCard.css";

const FALLBACK_IMAGE =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

function ProductCard({ product, onAddToCart }) {
    const [imageError, setImageError] = useState(false);

    if (!product) return null;

    const productId = product.id || product._id;
    const productName = product.name || "Không có tên";

    // =========================
    // PRICE
    // =========================
    let originalPrice = 0;
    let salePrice = 0;

    if (product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0];

        originalPrice = Number(firstVariant.price) || 0;

        salePrice =
            Number(firstVariant.discount_price) ||
            originalPrice;
    } else {
        originalPrice =
            Number(product.price) ||
            Number(product.original_price) ||
            0;

        salePrice =
            Number(product.discount_price) ||
            Number(product.sale_price) ||
            originalPrice;
    }

    const hasDiscount =
        salePrice < originalPrice && salePrice > 0;

    const displayPrice = hasDiscount
        ? salePrice
        : originalPrice;

    // =========================
    // IMAGE
    // =========================
    const getProductImage = () => {
        if (imageError) return FALLBACK_IMAGE;

        let imageUrl = "";

        if (product.images && product.images.length > 0) {
            imageUrl =
                product.images[0].image_url ||
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
    const formatPrice = (value) => {
        if (!value || isNaN(value) || value === 0) {
            return "Liên hệ";
        }

        return value.toLocaleString("vi-VN") + "₫";
    };

    // =========================
    // ADD TO CART
    // =========================
    const handleAddToCart = () => {
        if (onAddToCart) {
            onAddToCart({
                ...product,
                quantity: 1,
                price: displayPrice,
            });
        }
    };

    // =========================
    // IMAGE ERROR
    // =========================
    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className="product-card">

            {/* IMAGE */}
            <Link
                to={`/product/${productId}`}
                className="product-image-link"
            >
                <div className="product-image-wrapper">
                    <img
                        src={getProductImage()}
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

                {/* PRODUCT CODE */}
                {product.product_code && (
                    <p className="product-code">
                        {product.product_code}
                    </p>
                )}

                {/* PRODUCT NAME */}
                <Link to={`/product/${productId}`}>
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

                    {hasDiscount ? (
                        <div className="price-group">

                            <span className="old-price">
                                {formatPrice(originalPrice)}
                            </span>

                            <span className="sale-price">
                                {formatPrice(salePrice)}
                            </span>

                        </div>
                    ) : (
                        <span className="current-price">
                            {formatPrice(displayPrice)}
                        </span>
                    )}

                </div>

                {/* BUTTON */}
                <button
                    onClick={handleAddToCart}
                    className="add-to-cart-btn"
                >
                    Chọn mua
                </button>

            </div>
        </div>
    );
}

export default ProductCard;