import { useState, useEffect } from "react";
import {
    addToCart
} from "../../../services/cartService";
import {
    useCart
} from "../../../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./QuickShopModal.css";

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
    
    const [isClosing, setIsClosing] = useState(false);

    const navigate = useNavigate();

    // Ngăn scroll body khi modal mở
    useEffect(() => {
        if (product) {
            document.body.style.overflow = 'hidden';
            document.body.style.paddingRight = '0px'; // Fix jump scroll
        }
        return () => {
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '';
        };
    }, [product]);

    // Reset state khi product thay đổi
    useEffect(() => {
        if (product?.variants?.[0]) {
            setSelectedVariant(product.variants[0]);
            setQuantity(1);
        }
    }, [product]);

    // Xử lý đóng modal với animation
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            onClose();
        }, 250);
    };

    if (!product) return null;

    // =========================
    // CHECK STOCK AVAILABILITY
    // =========================

    const isVariantOutOfStock = (variant) => {
        return variant?.quantity === 0 || variant?.stock === 0;
    };

    const handleVariantChange = (variant) => {
        if (isVariantOutOfStock(variant)) {
            toast.warning(
                "Biến thể này đã hết hàng. Vui lòng chọn phân loại khác."
            );
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
                toast.warning("Vui lòng đăng nhập");
                return;
            }

            if (!selectedVariant) {
                toast.warning("Vui lòng chọn phân loại");
                return;
            }

            if (isVariantOutOfStock(selectedVariant)) {
                toast.error("Sản phẩm này đã hết hàng!");
                return;
            }

            const availableStock =
                selectedVariant.quantity ||
                selectedVariant.stock ||
                0;

            if (quantity > availableStock) {
                toast.warning(
                    `Số lượng không đủ. Chỉ còn ${availableStock} sản phẩm.`
                );
                return;
            }

            try {

                setLoading(true);

                await addToCart({
                    product_variant_id: selectedVariant.id,
                    quantity
                });

                increaseCartCount(quantity);
                toast.success(
                    "Đã thêm vào giỏ hàng!",
                    {
                        position: "top-right",
                        autoClose: 2000,
                    }
                );
                handleClose();

            } catch (error) {

                console.log("ADD CART ERROR:", error);
                toast.error(
                    error.response?.data?.message ||
                    "Add to cart failed"
                );

            } finally {

                setLoading(false);

            }

        };

    // =========================
    // BUY NOW
    // =========================

    const handleBuyNow = async () => {

        const token = localStorage.getItem("token");

        if (!token) {
            toast.warning("Vui lòng đăng nhập");
            return;
        }

        if (!selectedVariant) {
            toast.warning("Vui lòng chọn phân loại");
            return;
        }

        if (isVariantOutOfStock(selectedVariant)) {
            toast.error("Sản phẩm này đã hết hàng!");
            return;
        }

        const availableStock = selectedVariant.quantity || selectedVariant.stock || 0;
        if (quantity > availableStock) {
            toast.warning(
                `Số lượng không đủ. Chỉ còn ${availableStock} sản phẩm.`
            );
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
            toast.error(
                error.response?.data?.message ||
                "Mua ngay thất bại"
            );
        } finally {
            setLoading(false);
        }
    };

    return (

        <div
            className={`qsm-overlay ${isClosing ? 'qsm-closing' : ''}`}
            onClick={handleClose}
        >
            <div
                className={`qsm-modal ${isClosing ? 'qsm-closing' : ''}`}
                onClick={(e) =>
                    e.stopPropagation()
                }
            >
                <button
                    className="qsm-close"
                    onClick={handleClose}
                >
                    ✕
                </button>

                <div className="qsm-content">

                    <div className="qsm-left">
                        <img
                            src={
                                product.images?.[0]
                                    ?.image_url || "/placeholder-image.jpg"
                            }
                            alt={product.name}
                            className="qsm-image"
                            loading="lazy"
                        />
                    </div>

                    <div className="qsm-right">
                        <h2 className="qsm-title">
                            {product.name}
                        </h2>

                        <div className="qsm-price">
                            {hasDiscount ? (
                                <>
                                    <span className="qsm-old-price">
                                        {originalPrice.toLocaleString("vi-VN")}đ
                                    </span>
                                    <span className="qsm-sale-price">
                                        {salePrice.toLocaleString("vi-VN")}đ
                                    </span>
                                </>
                            ) : (
                                <span className="qsm-sale-price">
                                    {originalPrice.toLocaleString("vi-VN")}đ
                                </span>
                            )}
                        </div>

                        {
                            product.variants?.length > 0 && (
                                <div className="qsm-section">
                                    <h4 className="qsm-section-title">
                                        Phân loại
                                    </h4>
                                    <div className="qsm-variants">
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
                                                                    ? "qsm-variant-btn qsm-active"
                                                                    : "qsm-variant-btn"
                                                            }
                                                            onClick={() =>
                                                                handleVariantChange(variant)
                                                            }
                                                            disabled={isOutOfStock}
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

                        <div className="qsm-section">
                            <h4 className="qsm-section-title">
                                Số lượng
                            </h4>
                            <div className="qsm-qty-wrapper">
                                <button
                                    className="qsm-qty-btn"
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
                                <span className="qsm-qty-value">
                                    {quantity}
                                </span>
                                <button
                                    className="qsm-qty-btn"
                                    onClick={() => {
                                        const maxStock = selectedVariant?.quantity || selectedVariant?.stock || Infinity;
                                        if (quantity < maxStock) {
                                            setQuantity(prev => prev + 1);
                                        } else {
                                            toast.warning(
                                                `Chỉ còn ${maxStock} sản phẩm`
                                            );
                                        }
                                    }}
                                    disabled={isVariantOutOfStock(selectedVariant)}
                                >
                                    +
                                </button>
                            </div>
                            {selectedVariant && (
                                <div className="qsm-stock-info">
                                    {isVariantOutOfStock(selectedVariant) ? (
                                        <span className="qsm-stock-out">Hết hàng</span>
                                    ) : (
                                        <span>Còn lại: {selectedVariant.quantity || selectedVariant.stock || 0} sản phẩm</span>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="qsm-actions">
                            <button
                                className="qsm-add-cart-btn"
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
                                className="qsm-buy-now-btn"
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
    );
}

export default QuickShopModal;