import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import CustomerLayout from "../../layouts/CustomerLayout";
import { getProductDetail, getProducts } from "../../services/productService";
import { FaShoppingCart, FaTruck, FaShieldAlt } from "react-icons/fa";
import { addToCart } from "../../services/cartService";
import { useNavigate } from "react-router-dom";
import socket from "../../socket";

function ProductDetail() {
    const { id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedImage, setSelectedImage] = useState("");
    const [selectedVariant, setSelectedVariant] = useState(null);
    const [showFullDescription, setShowFullDescription] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [relatedProducts, setRelatedProducts] = useState([]);
    const [addingCart, setAddingCart] = useState(false);
    const navigate = useNavigate();

    // ========================= CHECK STOCK =========================
    const isVariantOutOfStock = (variant) => {
        return variant?.quantity === 0 || variant?.stock === 0;
    };

    const getAvailableStock = (variant) => {
        return variant?.quantity || variant?.stock || 0;
    };

    // ========================= FETCH PRODUCT =========================
    const fetchProduct = async () => {
        try {
            const res = await getProductDetail(id);
            const productData = res.data.data;
            setProduct(productData);

            // IMAGE
            setSelectedImage((prev) => {
                if (!prev) return productData.images?.[0]?.image_url || "";
                const found = productData.images.find((img) => img.image_url === prev);
                return found?.image_url || productData.images?.[0]?.image_url || "";
            });

            // VARIANT (chỉ chọn variant có hàng)
            const firstAvailableVariant = productData.variants?.find(v => !isVariantOutOfStock(v));
            setSelectedVariant((prev) => {
                if (!prev) return firstAvailableVariant || productData.variants?.[0];
                const found = productData.variants.find((v) => v.id === prev.id);
                if (found && !isVariantOutOfStock(found)) return found;
                return firstAvailableVariant || productData.variants?.[0] || null;
            });

            // RELATED PRODUCTS
            try {
                const relatedRes = await getProducts();
                let allProducts = relatedRes?.data?.data?.products || [];
                allProducts = allProducts.filter((item) => item.id !== productData.id);
                const related = allProducts.filter((item) => item.category_id === productData.category_id);
                setRelatedProducts(related.slice(0, 5));
            } catch (error) {
                console.log(error);
            }
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProduct();
        // REALTIME LISTENER
        socket.on("product_updated", (data) => {
            console.log("SOCKET product_updated:", data);
            if (Number(data.product_id) === Number(id)) {
                console.log("Realtime refresh product");
                fetchProduct();
            }
        });
        // CLEANUP
        return () => {
            socket.off("product_updated");
        };
    }, [id]);

    // Reset quantity khi đổi variant
    useEffect(() => {
        setQuantity(1);
    }, [selectedVariant]);

    // ========================= DESCRIPTION =========================
    const shortDescription = useMemo(() => {
        if (!product?.description) return "";
        return product.description.split("\n").slice(0, 5).join("\n");
    }, [product]);

    // ========================= ADD TO CART =========================
    const handleAddToCart = async () => {
        // CHƯA CHỌN VARIANT
        if (!selectedVariant) {
            alert("Vui lòng chọn phân loại");
            return;
        }

        // CHECK STOCK
        if (isVariantOutOfStock(selectedVariant)) {
            alert("Sản phẩm này đã hết hàng!");
            return;
        }

        // CHECK QUANTITY
        const availableStock = getAvailableStock(selectedVariant);
        if (quantity > availableStock) {
            alert(`Số lượng không đủ. Chỉ còn ${availableStock} sản phẩm.`);
            return;
        }

        // CHƯA LOGIN
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Vui lòng đăng nhập");
            return;
        }

        try {
            setAddingCart(true);
            await addToCart({
                product_variant_id: selectedVariant.id,
                quantity: quantity
            });
            alert("Đã thêm vào giỏ hàng");
        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Add to cart failed");
        } finally {
            setAddingCart(false);
        }
    };

    const handleBuyNow = async () => {
        // CHƯA CHỌN VARIANT
        if (!selectedVariant) {
            alert("Vui lòng chọn phân loại");
            return;
        }

        // CHECK STOCK
        if (isVariantOutOfStock(selectedVariant)) {
            alert("Sản phẩm này đã hết hàng!");
            return;
        }

        // CHECK QUANTITY
        const availableStock = getAvailableStock(selectedVariant);
        if (quantity > availableStock) {
            alert(`Số lượng không đủ. Chỉ còn ${availableStock} sản phẩm.`);
            return;
        }

        // CHƯA LOGIN
        const token = localStorage.getItem("token");
        if (!token) {
            alert("Vui lòng đăng nhập");
            return;
        }

        try {
            setAddingCart(true);

            // 1. thêm vào giỏ (giống Shopee flow)
            await addToCart({
                product_variant_id: selectedVariant.id,
                quantity: quantity
            });

            // 2. chuyển sang checkout
            navigate("/checkout", {
                state: {
                    buyNow: true,
                    product: {
                        id: product.id,
                        name: product.name,
                        image: selectedImage
                    },
                    variant: selectedVariant,
                    quantity: quantity,
                    price: selectedVariant.price
                }
            });

        } catch (error) {
            console.log(error);
            alert(error.response?.data?.message || "Buy now failed");
        } finally {
            setAddingCart(false);
        }
    };

    const handleVariantChange = (variant) => {
        if (isVariantOutOfStock(variant)) {
            alert("Biến thể này đã hết hàng. Vui lòng chọn phân loại khác.");
            return;
        }
        setSelectedVariant(variant);
    };

    const handleQuantityChange = (newQuantity) => {
        if (!selectedVariant) return;
        
        const maxStock = getAvailableStock(selectedVariant);
        if (newQuantity > maxStock) {
            alert(`Chỉ còn ${maxStock} sản phẩm`);
            return;
        }
        
        if (newQuantity < 1) {
            setQuantity(1);
            return;
        }
        
        setQuantity(newQuantity);
    };

    // ========================= LOADING =========================
    if (loading) {
        return (
            <CustomerLayout>
                <div style={styles.loading}>Loading...</div>
            </CustomerLayout>
        );
    }

    // ========================= NOT FOUND =========================
    if (!product) {
        return (
            <CustomerLayout>
                <div style={styles.notFound}>Product not found</div>
            </CustomerLayout>
        );
    }

    // ========================= PRICE =========================
    const price = Number(selectedVariant?.price) || 0;
    const formatPrice = (value) => {
        return value.toLocaleString("vi-VN") + "₫";
    };

    const isOutOfStock = isVariantOutOfStock(selectedVariant);
    const availableStock = selectedVariant ? getAvailableStock(selectedVariant) : 0;

    return (
        <CustomerLayout>
            <div style={styles.page}>
                <div style={styles.container}>
                    {/* MAIN */}
                    <div style={styles.main}>
                        {/* LEFT */}
                        <div>
                            {/* MAIN IMAGE */}
                            <div style={styles.mainImage}>
                                <img src={selectedImage} alt={product.name} style={styles.mainImageImg} />
                            </div>
                            {/* THUMBNAILS */}
                            <div style={styles.thumbnailList}>
                                {product.images?.map((img) => (
                                    <button
                                        key={img.id}
                                        onClick={() => setSelectedImage(img.image_url)}
                                        style={{
                                            ...styles.thumbnail,
                                            border: selectedImage === img.image_url ? "2px solid #ee4d2d" : "2px solid #ddd"
                                        }}
                                    >
                                        <img src={img.image_url} alt="" style={styles.thumbnailImg} />
                                    </button>
                                ))}
                            </div>
                        </div>
                        {/* RIGHT */}
                        <div>
                            {/* NAME */}
                            <h1 style={styles.title}>{product.name}</h1>
                            {/* INFO */}
                            <div style={styles.infoBox}>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Mã sản phẩm:</span>
                                    <span>{product.product_code || "N/A"}</span>
                                </div>
                                <div style={styles.infoRow}>
                                    <span style={styles.infoLabel}>Danh mục:</span>
                                    <span>{product?.category?.name || "Chưa có"}</span>
                                </div>
                            </div>
                            {/* PRICE */}
                            <div style={styles.priceBox}>
                                <div style={styles.price}>{formatPrice(price)}</div>
                            </div>
                            {/* VARIANT */}
                            <div style={styles.section}>
                                <h3 style={styles.sectionTitle}>Lựa chọn</h3>
                                <div style={styles.variantList}>
                                    {product.variants?.map((variant) => {
                                        const isOutOfStockVariant = isVariantOutOfStock(variant);
                                        return (
                                            <button
                                                key={variant.id}
                                                onClick={() => handleVariantChange(variant)}
                                                disabled={isOutOfStockVariant}
                                                style={{
                                                    ...styles.variantBtn,
                                                    border: selectedVariant?.id === variant.id ? "1px solid #ee4d2d" : "1px solid #ccc",
                                                    background: selectedVariant?.id === variant.id ? "#fff1ee" : "white",
                                                    color: selectedVariant?.id === variant.id ? "#ee4d2d" : "#333",
                                                    opacity: isOutOfStockVariant ? 0.5 : 1,
                                                    cursor: isOutOfStockVariant ? "not-allowed" : "pointer",
                                                    textDecoration: isOutOfStockVariant ? "line-through" : "none"
                                                }}
                                            >
                                                {variant.variant_name}
                                                {isOutOfStockVariant && " (Hết hàng)"}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                            {/* QUANTITY */}
                            <div style={styles.section}>
                                <h3 style={styles.sectionTitle}>Số lượng</h3>
                                <div style={styles.quantityWrapper}>
                                    <button 
                                        style={styles.qtyBtn} 
                                        onClick={() => handleQuantityChange(quantity - 1)}
                                        disabled={isOutOfStock || quantity <= 1}
                                    >
                                        -
                                    </button>
                                    <div style={styles.qtyValue}>{quantity}</div>
                                    <button 
                                        style={styles.qtyBtn} 
                                        onClick={() => handleQuantityChange(quantity + 1)}
                                        disabled={isOutOfStock || quantity >= availableStock}
                                    >
                                        +
                                    </button>
                                </div>
                                {!isOutOfStock ? (
                                    <div style={styles.qtyNote}>
                                        Còn lại: {availableStock} sản phẩm | Tối đa {Math.min(5, availableStock)} sản phẩm
                                    </div>
                                ) : (
                                    <div style={{ ...styles.qtyNote, color: "#ee4d2d", fontWeight: "bold" }}>
                                        Hết hàng
                                    </div>
                                )}
                            </div>
                            {/* SERVICES */}
                            <div style={styles.services}>
                                <div style={styles.serviceItem}>
                                    <FaTruck color="#ee4d2d" />
                                    <span>Giao hàng toàn quốc</span>
                                </div>
                                <div style={styles.serviceItem}>
                                    <FaShieldAlt color="#ee4d2d" />
                                    <span>Bảo hành chính hãng</span>
                                </div>
                            </div>
                            {/* BUTTON */}
                            <div style={styles.actions}>
                                <button
                                    style={{
                                        ...styles.addCartBtn,
                                        opacity: (addingCart || isOutOfStock) ? 0.7 : 1,
                                        cursor: (addingCart || isOutOfStock) ? "not-allowed" : "pointer"
                                    }}
                                    onClick={handleAddToCart}
                                    disabled={addingCart || isOutOfStock}
                                >
                                    <FaShoppingCart />
                                    <span>
                                        {addingCart 
                                            ? "Đang thêm..." 
                                            : isOutOfStock 
                                                ? "Hết hàng" 
                                                : "Thêm vào giỏ hàng"
                                        }
                                    </span>
                                </button>
                                <button
                                    style={{
                                        ...styles.buyNowBtn,
                                        opacity: isOutOfStock ? 0.7 : 1,
                                        cursor: isOutOfStock ? "not-allowed" : "pointer"
                                    }}
                                    onClick={handleBuyNow}
                                    disabled={addingCart || isOutOfStock}
                                >
                                    {addingCart 
                                        ? "Đang xử lý..." 
                                        : isOutOfStock 
                                            ? "Hết hàng" 
                                            : "Mua ngay"
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                    {/* DESCRIPTION */}
                    <div style={styles.descriptionBox}>
                        <h2 style={styles.descriptionTitle}>Mô tả sản phẩm</h2>
                        <div style={styles.descriptionContent}>
                            {showFullDescription ? product.description : shortDescription}
                        </div>
                        {product.description && product.description.split("\n").length > 5 && (
                            <button onClick={() => setShowFullDescription(!showFullDescription)} style={styles.showMoreBtn}>
                                {showFullDescription ? "Thu gọn" : "Xem thêm"}
                            </button>
                        )}
                    </div>
                    {/* RELATED PRODUCTS */}
                    <div style={styles.relatedBox}>
                        <h2 style={styles.relatedTitle}>Sản phẩm tương tự</h2>
                        <div style={styles.relatedGrid}>
                            {relatedProducts.map((item) => (
                                <Link key={item.id} to={`/product/${item.id}`} style={styles.relatedCard}>
                                    <img src={item.images?.[0]?.image_url} alt={item.name} style={styles.relatedImage} />
                                    <div style={styles.relatedContent}>
                                        <div style={styles.relatedName}>{item.name}</div>
                                        <div style={styles.relatedPrice}>
                                            {formatPrice(Number(item.variants?.[0]?.price || 0))}
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ========================= STYLES ========================= */}
            <style>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                .product-detail-page {
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 20px;
                }

                .product-detail-main {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 40px;
                    margin-bottom: 40px;
                }

                .product-detail-images {
                    position: sticky;
                    top: 20px;
                }

                .product-detail-main-image {
                    border-radius: 12px;
                    overflow: hidden;
                    margin-bottom: 16px;
                    background: #f5f5f5;
                }

                .product-detail-main-image img {
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    object-fit: cover;
                }

                .product-detail-thumbnails {
                    display: flex;
                    gap: 12px;
                    flex-wrap: wrap;
                }

                .product-detail-thumb {
                    width: 80px;
                    height: 80px;
                    border-radius: 8px;
                    overflow: hidden;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .product-detail-thumb img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                .product-detail-title {
                    font-size: 28px;
                    font-weight: 700;
                    margin-bottom: 16px;
                    color: #222;
                }

                .product-detail-info {
                    background: #f8f8f8;
                    padding: 16px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                }

                .product-detail-info-row {
                    display: flex;
                    gap: 16px;
                    margin-bottom: 8px;
                }

                .product-detail-info-label {
                    width: 100px;
                    color: #666;
                }

                .product-detail-price-box {
                    background: #fff1ee;
                    padding: 20px;
                    border-radius: 12px;
                    margin-bottom: 20px;
                }

                .product-detail-price {
                    font-size: 32px;
                    font-weight: 800;
                    color: #ee4d2d;
                }

                .product-detail-section {
                    margin-bottom: 24px;
                }

                .product-detail-section-title {
                    font-size: 18px;
                    font-weight: 600;
                    margin-bottom: 12px;
                    color: #333;
                }

                .product-detail-variants {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .product-detail-variant-btn {
                    padding: 10px 20px;
                    border-radius: 8px;
                    background: white;
                    border: 1px solid #ddd;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-size: 14px;
                }

                .product-detail-variant-btn:hover:not(:disabled) {
                    border-color: #ee4d2d;
                    color: #ee4d2d;
                }

                .product-detail-quantity {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .product-detail-qty-btn {
                    width: 40px;
                    height: 40px;
                    border: 1px solid #ddd;
                    background: white;
                    cursor: pointer;
                    font-size: 20px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                .product-detail-qty-btn:hover:not(:disabled) {
                    background: #f5f5f5;
                }

                .product-detail-qty-btn:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }

                .product-detail-qty-value {
                    width: 60px;
                    text-align: center;
                    font-size: 18px;
                    font-weight: 600;
                }

                .product-detail-qty-note {
                    margin-top: 8px;
                    font-size: 13px;
                    color: #888;
                }

                .product-detail-services {
                    display: flex;
                    gap: 24px;
                    padding: 16px 0;
                    border-top: 1px solid #eee;
                    border-bottom: 1px solid #eee;
                    margin-bottom: 24px;
                }

                .product-detail-service-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 14px;
                }

                .product-detail-actions {
                    display: flex;
                    gap: 16px;
                }

                .product-detail-add-cart,
                .product-detail-buy-now {
                    flex: 1;
                    height: 52px;
                    border: none;
                    border-radius: 12px;
                    font-size: 16px;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.2s;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 8px;
                }

                .product-detail-add-cart {
                    background: #fff1ee;
                    color: #ee4d2d;
                    border: 1px solid #ee4d2d;
                }

                .product-detail-add-cart:hover:not(:disabled) {
                    background: #ffe4dc;
                }

                .product-detail-buy-now {
                    background: #ee4d2d;
                    color: white;
                }

                .product-detail-buy-now:hover:not(:disabled) {
                    background: #d93f21;
                }

                button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }

                .product-detail-description {
                    background: #fafafa;
                    padding: 32px;
                    border-radius: 16px;
                    margin-top: 40px;
                }

                .product-detail-description-title {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 20px;
                    color: #222;
                }

                .product-detail-description-content {
                    white-space: pre-wrap;
                    line-height: 1.6;
                    color: #555;
                }

                .product-detail-show-more {
                    margin-top: 16px;
                    color: #ee4d2d;
                    background: none;
                    border: none;
                    cursor: pointer;
                    font-weight: 600;
                }

                .product-detail-related {
                    margin-top: 60px;
                }

                .product-detail-related-title {
                    font-size: 24px;
                    font-weight: 700;
                    margin-bottom: 24px;
                }

                .product-detail-related-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
                    gap: 20px;
                }

                .product-detail-related-card {
                    text-decoration: none;
                    color: inherit;
                    border: 1px solid #eee;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: all 0.2s;
                }

                .product-detail-related-card:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 20px rgba(0,0,0,0.1);
                }

                .product-detail-related-image {
                    width: 100%;
                    aspect-ratio: 1 / 1;
                    object-fit: cover;
                }

                .product-detail-related-content {
                    padding: 12px;
                }

                .product-detail-related-name {
                    font-size: 14px;
                    font-weight: 500;
                    margin-bottom: 8px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }

                .product-detail-related-price {
                    font-size: 16px;
                    font-weight: 700;
                    color: #ee4d2d;
                }

                @media (max-width: 768px) {
                    .product-detail-main {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    
                    .product-detail-title {
                        font-size: 22px;
                    }
                    
                    .product-detail-price {
                        font-size: 26px;
                    }
                    
                    .product-detail-actions {
                        flex-direction: column;
                    }
                    
                    .product-detail-related-grid {
                        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
                    }
                }

                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </CustomerLayout>
    );
}

// ========================= STYLES OBJECT =========================
const styles = {
    page: {
        maxWidth: 1200,
        margin: "0 auto",
        padding: "20px"
    },
    container: {
        animation: "fadeIn 0.3s ease"
    },
    main: {
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "40px",
        marginBottom: "40px"
    },
    mainImage: {
        borderRadius: "12px",
        overflow: "hidden",
        marginBottom: "16px",
        background: "#f5f5f5"
    },
    mainImageImg: {
        width: "100%",
        aspectRatio: "1 / 1",
        objectFit: "cover"
    },
    thumbnailList: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap"
    },
    thumbnail: {
        width: "80px",
        height: "80px",
        borderRadius: "8px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.2s",
        border: "none",
        padding: 0
    },
    thumbnailImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },
    title: {
        fontSize: "28px",
        fontWeight: "700",
        marginBottom: "16px",
        color: "#222"
    },
    infoBox: {
        background: "#f8f8f8",
        padding: "16px",
        borderRadius: "12px",
        marginBottom: "20px"
    },
    infoRow: {
        display: "flex",
        gap: "16px",
        marginBottom: "8px"
    },
    infoLabel: {
        width: "100px",
        color: "#666"
    },
    priceBox: {
        background: "#fff1ee",
        padding: "20px",
        borderRadius: "12px",
        marginBottom: "20px"
    },
    price: {
        fontSize: "32px",
        fontWeight: "800",
        color: "#ee4d2d"
    },
    section: {
        marginBottom: "24px"
    },
    sectionTitle: {
        fontSize: "18px",
        fontWeight: "600",
        marginBottom: "12px",
        color: "#333"
    },
    variantList: {
        display: "flex",
        flexWrap: "wrap",
        gap: "12px"
    },
    variantBtn: {
        padding: "10px 20px",
        borderRadius: "8px",
        background: "white",
        border: "1px solid #ddd",
        cursor: "pointer",
        transition: "all 0.2s",
        fontSize: "14px"
    },
    quantityWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "16px"
    },
    qtyBtn: {
        width: "40px",
        height: "40px",
        border: "1px solid #ddd",
        background: "white",
        cursor: "pointer",
        fontSize: "20px",
        borderRadius: "8px",
        transition: "all 0.2s"
    },
    qtyValue: {
        width: "60px",
        textAlign: "center",
        fontSize: "18px",
        fontWeight: "600"
    },
    qtyNote: {
        marginTop: "8px",
        fontSize: "13px",
        color: "#888"
    },
    services: {
        display: "flex",
        gap: "24px",
        padding: "16px 0",
        borderTop: "1px solid #eee",
        borderBottom: "1px solid #eee",
        marginBottom: "24px"
    },
    serviceItem: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        fontSize: "14px"
    },
    actions: {
        display: "flex",
        gap: "16px"
    },
    addCartBtn: {
        flex: 1,
        height: "52px",
        border: "none",
        borderRadius: "12px",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        background: "#fff1ee",
        color: "#ee4d2d",
        border: "1px solid #ee4d2d"
    },
    buyNowBtn: {
        flex: 1,
        height: "52px",
        border: "none",
        borderRadius: "12px",
        fontSize: "16px",
        fontWeight: "700",
        cursor: "pointer",
        transition: "all 0.2s",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        background: "#ee4d2d",
        color: "white"
    },
    descriptionBox: {
        background: "#fafafa",
        padding: "32px",
        borderRadius: "16px",
        marginTop: "40px"
    },
    descriptionTitle: {
        fontSize: "24px",
        fontWeight: "700",
        marginBottom: "20px",
        color: "#222"
    },
    descriptionContent: {
        whiteSpace: "pre-wrap",
        lineHeight: "1.6",
        color: "#555"
    },
    showMoreBtn: {
        marginTop: "16px",
        color: "#ee4d2d",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontWeight: "600"
    },
    relatedBox: {
        marginTop: "60px"
    },
    relatedTitle: {
        fontSize: "24px",
        fontWeight: "700",
        marginBottom: "24px"
    },
    relatedGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
        gap: "20px"
    },
    relatedCard: {
        textDecoration: "none",
        color: "inherit",
        border: "1px solid #eee",
        borderRadius: "12px",
        overflow: "hidden",
        transition: "all 0.2s"
    },
    relatedImage: {
        width: "100%",
        aspectRatio: "1 / 1",
        objectFit: "cover"
    },
    relatedContent: {
        padding: "12px"
    },
    relatedName: {
        fontSize: "14px",
        fontWeight: "500",
        marginBottom: "8px",
        display: "-webkit-box",
        WebkitLineClamp: 2,
        WebkitBoxOrient: "vertical",
        overflow: "hidden"
    },
    relatedPrice: {
        fontSize: "16px",
        fontWeight: "700",
        color: "#ee4d2d"
    },
    loading: {
        textAlign: "center",
        padding: "100px 20px",
        fontSize: "18px",
        color: "#666"
    },
    notFound: {
        textAlign: "center",
        padding: "100px 20px",
        fontSize: "18px",
        color: "#666"
    }
};

export default ProductDetail;