import { Link } from "react-router-dom";
import { useState } from "react";

const FALLBACK_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300' viewBox='0 0 300 300'%3E%3Crect width='300' height='300' fill='%23f3f4f6'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' fill='%239ca3af' font-size='14'%3ENo Image%3C/text%3E%3C/svg%3E";

function ProductCard({ product, onAddToCart }) {
    const [imageError, setImageError] = useState(false);
    
    if (!product) return null;

    const productId = product.id || product._id;
    const productName = product.name || "Không có tên";
    
    // Lấy giá từ variants hoặc trực tiếp
    let originalPrice = 0;  // Giá gốc
    let salePrice = 0;      // Giá khuyến mãi
    
    // Trường hợp có variants (lấy variant đầu tiên làm mặc định)
    if (product.variants && product.variants.length > 0) {
        const firstVariant = product.variants[0];
        originalPrice = Number(firstVariant.price) || 0;
        salePrice = Number(firstVariant.discount_price) || originalPrice;
    } else {
        // Trường hợp không có variants
        originalPrice = Number(product.price) || Number(product.original_price) || 0;
        salePrice = Number(product.discount_price) || Number(product.sale_price) || originalPrice;
    }
    
    const hasDiscount = salePrice < originalPrice && salePrice > 0;
    const displayPrice = hasDiscount ? salePrice : originalPrice;
    
    // Lấy ảnh
    const getProductImage = () => {
        if (imageError) return FALLBACK_IMAGE;
        
        let imageUrl = "";
        if (product.images && product.images.length > 0) {
            imageUrl = product.images[0].image_url || product.images[0].url || "";
        }
        
        if (!imageUrl) {
            imageUrl = product.image || product.thumbnail || "";
        }
        
        if (!imageUrl) {
            return FALLBACK_IMAGE;
        }
        
        return imageUrl;
    };
    
    const formatPrice = (value) => {
        if (!value || isNaN(value) || value === 0) return "Liên hệ";
        return value.toLocaleString("vi-VN") + "₫";
    };
    
    const handleAddToCart = () => {
        if (onAddToCart) {
            onAddToCart({
                ...product,
                quantity: 1,
                price: displayPrice
            });
        }
    };
    
    const handleImageError = () => {
        setImageError(true);
    };

    return (
        <div className="group relative bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
            
            {/* IMAGE CONTAINER */}
            <Link to={`/product/${productId}`} className="block">
                <div className="relative pt-[100%] overflow-hidden bg-gray-100">
                    <img
                        src={getProductImage()}
                        alt={productName}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={handleImageError}
                        loading="lazy"
                    />
                </div>
            </Link>

            {/* CONTENT */}
            <div className="p-4">
                
                {/* TAGS / BADGES (nếu có) */}
                {product.badge && (
                    <span className="inline-block bg-red-500 text-white text-xs px-2 py-1 rounded mb-2">
                        {product.badge}
                    </span>
                )}
                
                {/* PRODUCT CODE */}
                {product.product_code && (
                    <p className="text-gray-400 text-xs mb-1">
                        {product.product_code}
                    </p>
                )}
                
                {/* PRODUCT NAME */}
                <Link to={`/product/${productId}`}>
                    <h3 className="font-medium text-gray-900 text-sm line-clamp-2 hover:text-blue-600 transition-colors min-h-[40px]">
                        {productName}
                    </h3>
                </Link>
                
                {/* DESCRIPTION (nếu có) */}
                {product.short_description && (
                    <p className="text-gray-500 text-xs mt-1 line-clamp-1">
                        {product.short_description}
                    </p>
                )}
                
                {/* PRICE */}
                <div className="mt-3">
                    {hasDiscount ? (
                        <div className="flex items-baseline gap-2 flex-wrap">
                            <span className="text-gray-400 line-through text-sm">
                                {formatPrice(originalPrice)}
                            </span>
                            <span className="text-red-600 font-bold text-lg">
                                {formatPrice(salePrice)}
                            </span>
                        </div>
                    ) : (
                        <span className="text-red-600 font-bold text-lg">
                            {formatPrice(displayPrice)}
                        </span>
                    )}
                </div>
                
                {/* BUY BUTTON */}
                <button
                    onClick={handleAddToCart}
                    className="mt-4 w-full bg-white border-2 border-gray-900 text-gray-900 py-2 rounded-lg text-sm font-medium hover:bg-gray-900 hover:text-white transition-colors duration-300"
                >
                    Chọn mua
                </button>
            </div>
        </div>
    );
}

export default ProductCard;