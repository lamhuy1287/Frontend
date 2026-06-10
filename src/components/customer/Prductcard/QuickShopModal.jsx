import { useState } from "react";

import {
    addToCart
} from "../../../services/cartService";

import {
    useCart
} from "../../../context/CartContext";
import { useNavigate } from "react-router-dom";


function QuickShopModal({
    product,
    onClose
}) {

    // =========================
    // CART CONTEXT
    // =========================

    const {
        increaseCartCount
    } = useCart();

    // =========================
    // STATES
    // =========================

    const [selectedVariant,
        setSelectedVariant] =
        useState(
            product?.variants?.[0] || null
        );

    const [quantity,
        setQuantity] =
        useState(1);

    const [loading,
        setLoading] =
        useState(false);

    const navigate = useNavigate();

    if (!product) return null;

    // =========================
    // CHECK STOCK AVAILABILITY
    // =========================

    const isVariantOutOfStock = (variant) => {
        return variant?.quantity === 0 || variant?.stock === 0;
    };

    const handleVariantChange = (variant) => {
        if (isVariantOutOfStock(variant)) {
            alert("Biến thể này đã hết hàng. Vui lòng chọn phân loại khác.");
            return;
        }
        setSelectedVariant(variant);
        setQuantity(1);
    };

    const originalPrice =
        Number(selectedVariant?.price || 0);

    const salePrice =
        Number(
            selectedVariant?.sale_price ||
            selectedVariant?.price ||
            0
        );

    const hasDiscount =
        originalPrice > 0 &&
        salePrice < originalPrice;

    // =========================
    // ADD TO CART
    // =========================

    const handleAddToCart =
        async () => {

            const token =
                localStorage.getItem(
                    "token"
                );

            if (!token) {
                alert("Vui lòng đăng nhập");
                return;
            }

            if (!selectedVariant) {
                alert("Vui lòng chọn phân loại");
                return;
            }

            if (isVariantOutOfStock(selectedVariant)) {
                alert("Sản phẩm này đã hết hàng!");
                return;
            }

            const availableStock = selectedVariant.quantity || selectedVariant.stock || 0;
            if (quantity > availableStock) {
                alert(`Số lượng không đủ. Chỉ còn ${availableStock} sản phẩm.`);
                return;
            }

            try {

                setLoading(true);

                await addToCart({
                    product_variant_id: selectedVariant.id,
                    quantity
                });

                increaseCartCount(quantity);
                alert("Đã thêm vào giỏ hàng");
                onClose();

            } catch (error) {

                console.log("ADD CART ERROR:", error);
                alert(
                    error.response?.data?.message ||
                    "Add to cart failed"
                );

            } finally {

                setLoading(false);

            }

        };

    // =========================
    // BUY NOW - ĐÃ SỬA LỖI
    // =========================

    const handleBuyNow = async () => {

        const token = localStorage.getItem("token");

        if (!token) {
            alert("Vui lòng đăng nhập");
            return;
        }

        if (!selectedVariant) {
            alert("Vui lòng chọn phân loại");
            return;
        }

        if (isVariantOutOfStock(selectedVariant)) {
            alert("Sản phẩm này đã hết hàng!");
            return;
        }

        const availableStock = selectedVariant.quantity || selectedVariant.stock || 0;
        if (quantity > availableStock) {
            alert(`Số lượng không đủ. Chỉ còn ${availableStock} sản phẩm.`);
            return;
        }

        try {
            setLoading(true);

            // TẠO DỮ LIỆU CHO CHECKOUT
            const finalPrice = salePrice || originalPrice;
            
            const buyNowData = {
                buyNow: true,
                product: {
                    id: product.id,
                    name: product.name,
                    image: product.images?.[0]?.image_url || product.thumbnail || "",
                },
                variant: {
                    id: selectedVariant.id,
                    variant_name: selectedVariant.variant_name,
                },
                price: finalPrice,
                quantity: quantity,
                subtotal: finalPrice * quantity
            };

            // CHUYỂN SANG CHECKOUT KÈM DATA
            navigate("/checkout", { state: buyNowData });

        } catch (error) {
            console.log("BUY NOW ERROR:", error);
            alert(error.response?.data?.message || "Mua ngay thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (

        <>
            <div
                className="quickshop-overlay"
                onClick={onClose}
            >

                <div
                    className="quickshop-modal"
                    onClick={(e) =>
                        e.stopPropagation()
                    }
                >

                    <button
                        className="quickshop-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                    <div className="quickshop-content">

                        <div className="quickshop-left">

                            <img
                                src={
                                    product.images?.[0]
                                        ?.image_url
                                }
                                alt={product.name}
                                className="quickshop-image"
                            />

                        </div>

                        <div className="quickshop-right">

                            <h2>
                                {product.name}
                            </h2>

                            <div className="quick-price">
                                {hasDiscount ? (
                                    <>
                                        <span className="quick-old-price">
                                            {originalPrice.toLocaleString("vi-VN")}đ
                                        </span>

                                        <span className="quick-sale-price">
                                            {salePrice.toLocaleString("vi-VN")}đ
                                        </span>
                                    </>
                                ) : (
                                    <span className="quick-sale-price">
                                        {originalPrice.toLocaleString("vi-VN")}đ
                                    </span>
                                )}
                            </div>

                            {
                                product.variants?.length > 0 && (

                                    <div className="quickshop-section">

                                        <h4>
                                            Phân loại
                                        </h4>

                                        <div className="quickshop-variants">

                                            {
                                                product.variants.map(
                                                    (
                                                        variant
                                                    ) => {

                                                        const isOutOfStock = isVariantOutOfStock(variant);
                                                        
                                                        return (
                                                            <button
                                                                key={
                                                                    variant.id
                                                                }
                                                                className={
                                                                    selectedVariant?.id ===
                                                                        variant.id
                                                                        ? "variant-btn active"
                                                                        : "variant-btn"
                                                                }
                                                                onClick={() =>
                                                                    handleVariantChange(variant)
                                                                }
                                                                disabled={isOutOfStock}
                                                                style={{
                                                                    opacity: isOutOfStock ? 0.5 : 1,
                                                                    cursor: isOutOfStock ? "not-allowed" : "pointer",
                                                                    textDecoration: isOutOfStock ? "line-through" : "none"
                                                                }}
                                                            >

                                                                {variant.variant_name}
                                                                {isOutOfStock && " (Hết hàng)"}

                                                            </button>
                                                        );
                                                    }
                                                )
                                            }

                                        </div>

                                    </div>

                                )
                            }

                            <div className="quickshop-section">

                                <h4>
                                    Số lượng
                                </h4>

                                <div className="qty-wrapper">

                                    <button
                                        onClick={() =>
                                            setQuantity(
                                                (
                                                    prev
                                                ) =>
                                                    prev > 1
                                                        ? prev - 1
                                                        : 1
                                            )
                                        }
                                        disabled={isVariantOutOfStock(selectedVariant)}
                                    >
                                        -
                                    </button>

                                    <span>
                                        {quantity}
                                    </span>

                                    <button
                                        onClick={() => {
                                            const maxStock = selectedVariant?.quantity || selectedVariant?.stock || Infinity;
                                            if (quantity < maxStock) {
                                                setQuantity(prev => prev + 1);
                                            } else {
                                                alert(`Chỉ còn ${maxStock} sản phẩm`);
                                            }
                                        }}
                                        disabled={isVariantOutOfStock(selectedVariant)}
                                    >
                                        +
                                    </button>

                                </div>

                                {selectedVariant && (
                                    <div style={{ fontSize: "13px", color: "#666", marginTop: "8px" }}>
                                        {isVariantOutOfStock(selectedVariant) ? (
                                            <span style={{ color: "#ee4d2d", fontWeight: "bold" }}>Hết hàng</span>
                                        ) : (
                                            <span>Còn lại: {selectedVariant.quantity || selectedVariant.stock || 0} sản phẩm</span>
                                        )}
                                    </div>
                                )}

                            </div>

                            <div className="quickshop-actions">

                                <button
                                    className="add-cart-btn"
                                    onClick={
                                        handleAddToCart
                                    }
                                    disabled={loading || isVariantOutOfStock(selectedVariant)}
                                >

                                    {
                                        loading
                                            ? "Đang thêm..."
                                            : (isVariantOutOfStock(selectedVariant) ? "Hết hàng" : "Thêm vào giỏ")
                                    }

                                </button>

                                <button
                                    className="buy-now-btn"
                                    onClick={handleBuyNow}
                                    disabled={loading || isVariantOutOfStock(selectedVariant)}
                                >
                                    {loading ? "Đang xử lý..." : (isVariantOutOfStock(selectedVariant) ? "Hết hàng" : "Mua ngay")}
                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

            <style>

                {`

/* =========================
   OVERLAY
========================= */

.quickshop-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);

    display: flex;
    justify-content: center;
    align-items: center;

    z-index: 9999;

    backdrop-filter: blur(4px);

    animation: fadeIn 0.25s ease;
}

/* =========================
   MODAL
========================= */

.quickshop-modal {
    width: 950px;
    max-width: 95%;
    max-height: 92vh;

    background: #fff;
    border-radius: 20px;

    overflow: hidden;
    position: relative;

    box-shadow:
        0 20px 60px rgba(0, 0, 0, 0.25);

    animation: popupShow 0.3s ease;
}

/* =========================
   CONTENT
========================= */

.quickshop-content {
    display: grid;
    grid-template-columns: 420px 1fr;
}

/* =========================
   LEFT
========================= */

.quickshop-left {
    background: #f8f8f8;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 24px;
}

.quickshop-image {
    width: 100%;
    max-width: 360px;
    aspect-ratio: 1/1;

    object-fit: cover;

    border-radius: 18px;
    background: white;
}

/* =========================
   RIGHT
========================= */

.quickshop-right {
    padding: 32px;

    overflow-y: auto;
    max-height: 92vh;
}

.quickshop-right h2 {
    font-size: 28px;
    font-weight: 700;
    line-height: 1.4;

    margin-bottom: 18px;

    color: #222;
}

/* =========================
   PRICE
========================= */

.quick-price {
    margin-bottom: 28px;
}

.quick-old-price {
    display: block;
    font-size: 16px;
    color: #999;
    text-decoration: line-through;
    margin-bottom: 8px;
}

.quick-sale-price {
    display: block;
    font-size: 34px;
    font-weight: 800;
    color: #ee4d2d;
}

.quickshop-price .old-price {
    font-size: 16px;
    color: #999;
    text-decoration: line-through;
    margin-bottom: 8px;
}

.quickshop-price .sale-price {
    display: block;
    font-size: 34px;
    font-weight: 800;
    color: #ee4d2d;
}

.quickshop-price .discount-percent {
    display: inline-block;
    margin-top: 8px;
    padding: 6px 10px;
    border-radius: 10px;
    background: #ee4d2d;
    color: white;
    font-size: 14px;
    font-weight: 700;
}

/* =========================
   SECTION
========================= */

.quickshop-section {
    margin-bottom: 28px;
}

.quickshop-section h4 {
    font-size: 15px;
    font-weight: 600;

    margin-bottom: 14px;

    color: #555;
}

/* =========================
   VARIANTS
========================= */

.quickshop-variants {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
}

.variant-btn {
    border: 1px solid #ddd;
    background: white;

    padding: 10px 18px;

    border-radius: 12px;

    cursor: pointer;

    font-size: 14px;
    font-weight: 500;

    transition: all 0.25s ease;
}

.variant-btn:hover:not(:disabled) {
    border-color: #ee4d2d;
    color: #ee4d2d;
}

.variant-btn.active {
    background: #fff1ee;
    border-color: #ee4d2d;
    color: #ee4d2d;

    font-weight: 700;
}

.variant-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* =========================
   QUANTITY
========================= */

.qty-wrapper {
    display: inline-flex;
    align-items: center;

    border: 1px solid #ddd;
    border-radius: 12px;

    overflow: hidden;
}

.qty-wrapper button {
    width: 42px;
    height: 42px;

    border: none;
    background: white;

    cursor: pointer;

    font-size: 20px;
    font-weight: 600;

    transition: 0.2s;
}

.qty-wrapper button:hover:not(:disabled) {
    background: #f5f5f5;
}

.qty-wrapper button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.qty-wrapper span {
    width: 60px;

    text-align: center;

    font-size: 16px;
    font-weight: 600;
}

/* =========================
   ACTIONS
========================= */

.quickshop-actions {
    display: flex;
    gap: 16px;

    margin-top: 36px;
}

.add-cart-btn,
.buy-now-btn {
    flex: 1;

    height: 52px;

    border: none;
    border-radius: 14px;

    font-size: 16px;
    font-weight: 700;

    cursor: pointer;

    transition: all 0.25s ease;
}

.add-cart-btn {
    background: #fff1ee;
    color: #ee4d2d;

    border: 1px solid #ee4d2d;
}

.add-cart-btn:hover:not(:disabled) {
    background: #ffe4dc;
}

.buy-now-btn {
    background: #ee4d2d;
    color: white;
}

.buy-now-btn:hover:not(:disabled) {
    background: #d93f21;
}

button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* =========================
   CLOSE BUTTON
========================= */

.quickshop-close {
    position: absolute;

    top: 18px;
    right: 18px;

    width: 38px;
    height: 38px;

    border: none;
    border-radius: 50%;

    background: #f3f3f3;

    cursor: pointer;

    font-size: 18px;
    font-weight: bold;

    z-index: 10;

    transition: all 0.2s ease;
}

.quickshop-close:hover {
    background: #e5e5e5;
    transform: rotate(90deg);
}

/* =========================
   ANIMATIONS
========================= */

@keyframes popupShow {
    from {
        opacity: 0;
        transform: scale(0.9) translateY(20px);
    }

    to {
        opacity: 1;
        transform: scale(1) translateY(0);
    }
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }

    to {
        opacity: 1;
    }
}

/* =========================
   MOBILE
========================= */

@media (max-width: 768px) {

    .quickshop-modal {
        width: 95%;
        border-radius: 18px;
    }

    .quickshop-content {
        grid-template-columns: 1fr;
    }

    .quickshop-left {
        padding: 18px;
    }

    .quickshop-image {
        max-width: 260px;
    }

    .quickshop-right {
        padding: 20px;
    }

    .quickshop-right h2 {
        font-size: 22px;
    }

    .quick-price {
        margin-bottom: 28px;
    }

    .quick-old-price {
        display: block;
        font-size: 16px;
        color: #999;
        text-decoration: line-through;
        margin-bottom: 8px;
    }

    .quick-sale-price {
        display: block;
        font-size: 28px;
        font-weight: 800;
        color: #ee4d2d;
    }

    .quickshop-actions {
        flex-direction: column;
    }
}

                `}

            </style>

        </>

    );

}

export default QuickShopModal;