import { useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import QuickShopModal from "./QuickShopModal";
import "./ProductCard.css";

function ProductCard({ product, onAddToCartSuccess }) {
    const [showQuickShop, setShowQuickShop] = useState(false);
    const navigate = useNavigate();

    // Chuyển sang trang chi tiết sản phẩm
    const handleViewDetail = useCallback(() => {
        navigate(`/product/${product.id}`);
    }, [navigate, product.id]);

    // Mở modal khi click vào nút "Chọn mua" (ngăn không cho chuyển trang)
    const handleOpenModal = useCallback((e) => {
        e.stopPropagation(); // Ngăn sự kiện bubbling lên handleViewDetail
        setShowQuickShop(true);
    }, []);

    // Đóng modal
    const handleCloseModal = useCallback(() => {
        setShowQuickShop(false);
    }, []);

    // Format giá
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN').format(price) + 'đ';
    };

    // Lấy giá hiển thị
    const displayPrice = product.variants?.[0]?.sale_price || 
                        product.variants?.[0]?.price || 
                        product.price || 
                        0;
    
    const originalPrice = product.variants?.[0]?.price || product.price || 0;
    const hasDiscount = originalPrice > displayPrice;

    // Lấy ảnh sản phẩm
    const productImage = product.images?.[0]?.image_url || 
                        product.thumbnail || 
                        "/placeholder-image.jpg";

    return (
        <>
            <div 
                className="product-card-wrapper"
                onClick={handleViewDetail} // Click vào card -> chuyển trang
            >
                <div className="product-card">
                    {/* Ảnh sản phẩm */}
                    <div className="product-card-image">
                        <img 
                            src={productImage} 
                            alt={product.name}
                            loading="lazy"
                        />
                        {hasDiscount && (
                            <span className="product-card-discount">
                                -{Math.round(((originalPrice - displayPrice) / originalPrice) * 100)}%
                            </span>
                        )}
                    </div>

                    {/* Thông tin sản phẩm */}
                    <div className="product-card-info">
                        <h3 className="product-card-title">
                            {product.name}
                        </h3>
                        
                        <div className="product-card-price">
                            {hasDiscount ? (
                                <>
                                    <span className="product-card-old-price">
                                        {formatPrice(originalPrice)}
                                    </span>
                                    <span className="product-card-sale-price">
                                        {formatPrice(displayPrice)}
                                    </span>
                                </>
                            ) : (
                                <span className="product-card-current-price">
                                    {formatPrice(displayPrice)}
                                </span>
                            )}
                        </div>

                        {/* Hiển thị sold count nếu có */}
                        {product.sold_count > 0 && (
                            <div className="product-card-sold">
                                Đã bán: {product.sold_count}
                            </div>
                        )}

                        {/* Nút Chọn mua - click vào đây mở modal, không chuyển trang */}
                        <button 
                            className="product-card-buy-btn"
                            onClick={handleOpenModal}
                        >
                            Chọn mua
                        </button>
                    </div>
                </div>
            </div>

            {/* Render modal ra ngoài bằng Portal */}
            {showQuickShop && createPortal(
                <QuickShopModal
                    product={product}
                    onClose={handleCloseModal}
                />,
                document.body
            )}
        </>
    );
}

export default ProductCard;