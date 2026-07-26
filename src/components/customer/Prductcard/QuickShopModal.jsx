import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { addToCart } from "../../../services/cartService";
import { useCart } from "../../../context/CartContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import "./QuickShopModal.css";

function QuickShopModal({ product, onClose }) {
  const { increaseCartCount } = useCart();
  const navigate = useNavigate();

  const modalRef = useRef(null);
  const closeTimeoutRef = useRef(null);
  const previousFocusRef = useRef(null);

  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loadingAdd, setLoadingAdd] = useState(false);
  const [loadingBuy, setLoadingBuy] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  const variants = useMemo(() => product?.variants || [], [product]);
  const mainImage = useMemo(
    () => product?.images?.[0]?.image_url || product?.thumbnail || "/placeholder-image.jpg",
    [product]
  );

  const isVariantOutOfStock = useCallback((variant) => {
    if (!variant) return true;
    const stock = variant.quantity ?? variant.stock ?? 0;
    return stock === 0;
  }, []);

  const availableStock = useMemo(() => {
    if (!selectedVariant) return 0;
    return selectedVariant.quantity ?? selectedVariant.stock ?? 0;
  }, [selectedVariant]);

  const originalPrice = useMemo(
    () => Number(selectedVariant?.price || 0),
    [selectedVariant]
  );
  const salePrice = useMemo(
    () => Number(selectedVariant?.sale_price ?? selectedVariant?.price ?? 0),
    [selectedVariant]
  );
  const hasDiscount = useMemo(
    () => originalPrice > 0 && salePrice < originalPrice,
    [originalPrice, salePrice]
  );

  useEffect(() => {
    if (product?.variants?.length) {
      const firstInStock = product.variants.find(v => !isVariantOutOfStock(v));
      setSelectedVariant(firstInStock || product.variants[0]);
      setQuantity(1);
    } else {
      setSelectedVariant(null);
      setQuantity(1);
    }
  }, [product, isVariantOutOfStock]);

  const handleClose = useCallback(() => {
    if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    setIsClosing(true);
    closeTimeoutRef.current = setTimeout(() => {
      onClose();
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
        previousFocusRef.current = null;
      }
    }, 250);
  }, [onClose]);

  useEffect(() => {
    if (!product) return;
    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = "hidden";
    document.body.classList.add("qsm-modal-open");

    if (modalRef.current) {
      modalRef.current.focus();
    }

    return () => {
      document.body.style.overflow = "";
      document.body.classList.remove("qsm-modal-open");
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, [product]);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === "Escape") handleClose();
    };
    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [handleClose]);

  const handleVariantChange = useCallback(
    (variant) => {
      if (isVariantOutOfStock(variant)) {
        toast.error("Biến thể này đã hết hàng. Vui lòng chọn phân loại khác.");
        return;
      }
      setSelectedVariant(variant);
      setQuantity(1);
    },
    [isVariantOutOfStock]
  );

  const handleAddToCart = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
    if (!selectedVariant) {
      toast.error("Vui lòng chọn phân loại");
      return;
    }
    if (isVariantOutOfStock(selectedVariant)) {
      toast.error("Sản phẩm này đã hết hàng!");
      return;
    }
    if (quantity > availableStock) {
      toast.error(`Số lượng không đủ. Chỉ còn ${availableStock} sản phẩm.`);
      return;
    }

    setLoadingAdd(true);
    try {
      await addToCart({
        product_variant_id: selectedVariant.id,
        quantity,
      });
      increaseCartCount(quantity);
      toast.success("Đã thêm vào giỏ hàng!", { position: "top-right", autoClose: 2000 });
      handleClose();
    } catch (error) {
      console.error("ADD CART ERROR:", error);
      toast.error(error.response?.data?.message || "Thêm vào giỏ thất bại");
    } finally {
      setLoadingAdd(false);
    }
  }, [selectedVariant, quantity, availableStock, increaseCartCount, handleClose, isVariantOutOfStock]);

  const handleBuyNow = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập");
      return;
    }
    if (!selectedVariant) {
      toast.error("Vui lòng chọn phân loại");
      return;
    }
    if (isVariantOutOfStock(selectedVariant)) {
      toast.error("Sản phẩm này đã hết hàng!");
      return;
    }
    if (quantity > availableStock) {
      toast.error(`Số lượng không đủ. Chỉ còn ${availableStock} sản phẩm.`);
      return;
    }

    setLoadingBuy(true);
    try {
      const finalPrice = salePrice || originalPrice;
      const buyNowData = {
        buyNow: true,
        product: {
          id: product.id,
          name: product.name,
          image: mainImage,
        },
        variant: {
          id: selectedVariant.id,
          variant_name: selectedVariant.variant_name,
        },
        price: finalPrice,
        quantity,
        subtotal: finalPrice * quantity,
      };
      navigate("/checkout", { state: buyNowData });
    } catch (error) {
      console.error("BUY NOW ERROR:", error);
      toast.error(error.response?.data?.message || "Mua ngay thất bại");
    } finally {
      setLoadingBuy(false);
    }
  }, [selectedVariant, quantity, availableStock, product, mainImage, salePrice, originalPrice, navigate, isVariantOutOfStock]);

  const handleDecrease = useCallback(() => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  }, []);

  const handleIncrease = useCallback(() => {
    setQuantity((prev) => {
      if (prev < availableStock) return prev + 1;
      toast.error(`Chỉ còn ${availableStock} sản phẩm`);
      return prev;
    });
  }, [availableStock]);

  if (!product) return null;

  const isOutOfStock = !selectedVariant || isVariantOutOfStock(selectedVariant);

  return createPortal(
    <div
      className={`qsm-overlay ${isClosing ? "qsm-closing" : ""}`}
      onClick={handleClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qsm-title"
    >
      <div
        ref={modalRef}
        className={`qsm-modal ${isClosing ? "qsm-closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        <button
          className="qsm-close"
          onClick={handleClose}
          aria-label="Đóng cửa sổ"
        >
          ✕
        </button>

        <div className="qsm-content">
          <div className="qsm-left">
            <img
              src={mainImage}
              alt={product.name}
              className="qsm-image"
              loading="lazy"
            />
          </div>

          <div className="qsm-right">
            <h2 id="qsm-title" className="qsm-title">
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

            {variants.length > 0 && (
              <div className="qsm-section">
                <h4 className="qsm-section-title">Phân loại</h4>
                <div className="qsm-variants">
                  {variants.map((variant) => {
                    const outOfStock = isVariantOutOfStock(variant);
                    return (
                      <button
                        key={variant.id}
                        className={`qsm-variant-btn ${
                          selectedVariant?.id === variant.id ? "qsm-active" : ""
                        }`}
                        onClick={() => handleVariantChange(variant)}
                        disabled={outOfStock}
                        aria-pressed={selectedVariant?.id === variant.id}
                      >
                        {variant.variant_name}
                        {outOfStock && " (Hết hàng)"}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="qsm-section">
              <h4 className="qsm-section-title">Số lượng</h4>
              <div className="qsm-qty-wrapper">
                <button
                  className="qsm-qty-btn"
                  onClick={handleDecrease}
                  disabled={quantity <= 1 || isOutOfStock}
                  aria-label="Giảm số lượng"
                >
                  −
                </button>
                <span className="qsm-qty-value">{quantity}</span>
                <button
                  className="qsm-qty-btn"
                  onClick={handleIncrease}
                  disabled={quantity >= availableStock || isOutOfStock}
                  aria-label="Tăng số lượng"
                >
                  +
                </button>
              </div>
              {selectedVariant && (
                <div className="qsm-stock-info">
                  {isOutOfStock ? (
                    <span className="qsm-stock-out">Hết hàng</span>
                  ) : (
                    <span>Còn lại: {availableStock} sản phẩm</span>
                  )}
                </div>
              )}
            </div>

            <div className="qsm-actions">
              <button
                className="qsm-add-cart-btn"
                onClick={handleAddToCart}
                disabled={loadingAdd || isOutOfStock}
              >
                {loadingAdd
                  ? "Đang thêm..."
                  : isOutOfStock
                  ? "Hết hàng"
                  : "Thêm vào giỏ"}
              </button>
              <button
                className="qsm-buy-now-btn"
                onClick={handleBuyNow}
                disabled={loadingBuy || isOutOfStock}
              >
                {loadingBuy
                  ? "Đang xử lý..."
                  : isOutOfStock
                  ? "Hết hàng"
                  : "Mua ngay"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default QuickShopModal;