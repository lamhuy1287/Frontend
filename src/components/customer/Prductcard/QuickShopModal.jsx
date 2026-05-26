import { useState } from "react";

import {
    addToCart
} from "../../../services/cartService";

import {
    useCart
} from "../../../context/CartContext";


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

    if (!product) return null;

    // =========================
    // FORMAT PRICE
    // =========================

    const formatPrice = (
        value
    ) => {

        return (
            Number(value)
                .toLocaleString("vi-VN")
            + "₫"
        );

    };

    // =========================
    // ADD TO CART
    // =========================

    const handleAddToCart =
        async () => {

            const token =
                localStorage.getItem(
                    "token"
                );

            // CHƯA LOGIN
            if (!token) {

                alert(
                    "Vui lòng đăng nhập"
                );

                return;

            }

            // CHƯA CHỌN VARIANT
            if (!selectedVariant) {

                alert(
                    "Vui lòng chọn phân loại"
                );

                return;

            }

            try {

                setLoading(true);

                await addToCart({

                    product_variant_id:
                        selectedVariant.id,

                    quantity

                });

                increaseCartCount(
                    quantity
                );

                alert(
                    "Đã thêm vào giỏ hàng"
                );

                onClose();

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
            {/* =========================
                CSS
            ========================= */}

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

.quickshop-price {
    font-size: 34px;
    font-weight: 800;

    color: #ee4d2d;

    margin-bottom: 28px;
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

.variant-btn:hover {
    border-color: #ee4d2d;
    color: #ee4d2d;
}

.variant-btn.active {
    background: #fff1ee;
    border-color: #ee4d2d;
    color: #ee4d2d;

    font-weight: 700;
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

.qty-wrapper button:hover {
    background: #f5f5f5;
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

.add-cart-btn:hover {
    background: #ffe4dc;
}

.buy-now-btn {
    background: #ee4d2d;
    color: white;
}

.buy-now-btn:hover {
    background: #d93f21;
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

    .quickshop-price {
        font-size: 28px;
    }

    .quickshop-actions {
        flex-direction: column;
    }
}

                `}

            </style>

            {/* =========================
                MODAL
            ========================= */}

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

                    {/* CLOSE */}

                    <button
                        className="quickshop-close"
                        onClick={onClose}
                    >
                        ✕
                    </button>

                    <div className="quickshop-content">

                        {/* LEFT */}

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

                        {/* RIGHT */}

                        <div className="quickshop-right">

                            <h2>
                                {product.name}
                            </h2>

                            {/* PRICE */}

                            <div className="quickshop-price">

                                {
                                    formatPrice(
                                        selectedVariant?.price
                                    )
                                }

                            </div>

                            {/* VARIANTS */}

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
                                                    ) => (

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
                                                                setSelectedVariant(
                                                                    variant
                                                                )
                                                            }
                                                        >

                                                            {
                                                                variant.variant_name
                                                            }

                                                        </button>

                                                    )
                                                )
                                            }

                                        </div>

                                    </div>

                                )
                            }

                            {/* QUANTITY */}

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
                                    >
                                        -
                                    </button>

                                    <span>
                                        {quantity}
                                    </span>

                                    <button
                                        onClick={() =>
                                            setQuantity(
                                                (
                                                    prev
                                                ) =>
                                                    prev + 1
                                            )
                                        }
                                    >
                                        +
                                    </button>

                                </div>

                            </div>

                            {/* ACTIONS */}

                            <div className="quickshop-actions">

                                {/* ADD TO CART */}

                                <button
                                    className="add-cart-btn"
                                    onClick={
                                        handleAddToCart
                                    }
                                    disabled={loading}
                                >

                                    {
                                        loading
                                            ? "Đang thêm..."
                                            : "Thêm vào giỏ"
                                    }

                                </button>

                                {/* BUY NOW */}

                                <button
                                    className="buy-now-btn"
                                >

                                    Mua ngay

                                </button>

                            </div>

                        </div>

                    </div>

                </div>

            </div>

        </>

    );

}

export default QuickShopModal;