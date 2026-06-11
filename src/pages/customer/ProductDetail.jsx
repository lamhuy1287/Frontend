import { useEffect, useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";

import CustomerLayout from "../../layouts/CustomerLayout";

import {
    getProductDetail,
    getProducts
} from "../../services/productService";

import {
    addToCart
} from "../../services/cartService";

import {
    FaShoppingCart,
    FaTruck,
    FaShieldAlt
} from "react-icons/fa";

import socket from "../../socket";

import "./ProductDetail.css";
import toast from "react-hot-toast";

function ProductDetail() {

    const { id } = useParams();

    const navigate = useNavigate();

    const [product, setProduct] = useState(null);

    const [loading, setLoading] = useState(true);

    const [selectedImage, setSelectedImage] = useState("");

    const [selectedVariant, setSelectedVariant] = useState(null);

    const [quantity, setQuantity] = useState(1);

    const [addingCart, setAddingCart] = useState(false);

    const [relatedProducts, setRelatedProducts] = useState([]);
    const [showFullDescription, setShowFullDescription] = useState(false);

    // =========================
    // CHECK STOCK
    // =========================

    const isVariantOutOfStock = (variant) => {
        return (
            variant?.quantity === 0 ||
            variant?.stock === 0
        );
    };

    const getAvailableStock = (variant) => {
        return (
            variant?.quantity ||
            variant?.stock ||
            0
        );
    };

    // =========================
    // FETCH RELATED PRODUCTS
    // =========================

    const fetchRelatedProducts = async (categoryId, currentProductId) => {
        try {
            // ✅ Gọi API với filter category và giới hạn số lượng
            const relatedRes = await getProducts({
                category_id: categoryId,
                limit: 6,
                page: 1
            });
            
            let products = relatedRes?.data?.data?.products || [];
            
            // ✅ Loại bỏ sản phẩm hiện tại
            products = products.filter(item => item.id !== currentProductId);
            
            // ✅ Giới hạn chỉ lấy 5 sản phẩm
            setRelatedProducts(products.slice(0, 5));
            
        } catch (error) {
            console.log("Error fetching related products:", error);
            setRelatedProducts([]);
        }
    };

    // =========================
    // FETCH PRODUCT
    // =========================

    const fetchProduct = async () => {

        try {

            const res =
                await getProductDetail(id);

            const productData =
                res.data.data;

            setProduct(productData);

            setSelectedImage(
                productData.images?.[0]
                    ?.image_url || ""
            );

            const firstAvailableVariant =
                productData.variants?.find(
                    (v) =>
                        !isVariantOutOfStock(v)
                );

            setSelectedVariant(
                firstAvailableVariant ||
                productData.variants?.[0]
            );

            // ✅ Gọi hàm lấy sản phẩm tương tự
            await fetchRelatedProducts(productData.category_id, productData.id);

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchProduct();

        socket.on(
            "product_updated",
            (data) => {

                if (
                    Number(
                        data.product_id
                    ) === Number(id)
                ) {

                    fetchProduct();

                }

            }
        );

        return () => {

            socket.off(
                "product_updated"
            );

        };

    }, [id]);

    // =========================
    // RESET QUANTITY
    // =========================

    useEffect(() => {

        setQuantity(1);

    }, [selectedVariant]);

    // =========================
    // DESCRIPTION
    // =========================

    const shortDescription =
        useMemo(() => {

            if (!product?.description)
                return "";

            return product.description
                .split("\n")
                .slice(0, 5)
                .join("\n");

        }, [product]);

    // =========================
    // FORMAT PRICE
    // =========================

    const formatPrice = (value) => {

        return (
            Number(value).toLocaleString(
                "vi-VN"
            ) + "₫"
        );

    };

    // =========================
    // ADD CART
    // =========================

    const handleAddToCart =
        async () => {

            if (!selectedVariant) {

                toast.error("Vui lòng chọn phân loại");

                return;

            }

            if (
                isVariantOutOfStock(
                    selectedVariant
                )
            ) {

                toast.error("Sản phẩm đã hết hàng");

                return;

            }

            try {

                setAddingCart(true);

                await addToCart({

                    product_variant_id:
                        selectedVariant.id,

                    quantity

                });

                toast.success("Đã thêm vào giỏ hàng");

            } catch (error) {

                console.log(error);
                toast.error(error.response?.data?.message || "Thêm giỏ hàng thất bại");

            } finally {

                setAddingCart(false);

            }

        };

    // =========================
    // BUY NOW
    // =========================

    const handleBuyNow = async () => {
        
        if (!selectedVariant) {
            toast.error("Vui lòng chọn phân loại");
            return;
        }

        if (isVariantOutOfStock(selectedVariant)) {
            toast.error("Sản phẩm đã hết hàng");
            return;
        }

        if (quantity > getAvailableStock(selectedVariant)) {
            toast.error(`Số lượng không đủ. Chỉ còn ${getAvailableStock(selectedVariant)} sản phẩm`);
            return;
        }

        // TÍNH GIÁ BÁN CUỐI CÙNG
        const originalPriceNum = Number(selectedVariant?.price) || 0;
        const salePriceNum = Number(selectedVariant?.sale_price ?? selectedVariant?.price) || 0;
        const finalPrice = selectedVariant?.discount ? salePriceNum : originalPriceNum;
        const subtotal = finalPrice * quantity;

        // LẤY ẢNH SẢN PHẨM
        const productImage = selectedImage || product.images?.[0]?.image_url || "";

        // TẠO DỮ LIỆU CHO CHECKOUT
        const buyNowData = {
            buyNow: true,
            product: {
                id: product.id,
                name: product.name,
                image: productImage,
            },
            variant: {
                id: selectedVariant.id,
                variant_name: selectedVariant.variant_name,
            },
            price: finalPrice,
            quantity: quantity,
            subtotal: subtotal
        };

        navigate("/checkout", { state: buyNowData });
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <CustomerLayout>

                <div className="pd-loading">

                    Loading...

                </div>

            </CustomerLayout>

        );

    }

    // =========================
    // NOT FOUND
    // =========================

    if (!product) {

        return (

            <CustomerLayout>

                <div className="pd-loading">

                    Product not found

                </div>

            </CustomerLayout>

        );

    }

    const originalPrice =
        Number(selectedVariant?.price) ||
        0;

    const salePrice =
        Number(
            selectedVariant?.sale_price ??
            selectedVariant?.price
        );

    const discount =
        selectedVariant?.discount;

    const availableStock =
        getAvailableStock(
            selectedVariant
        );

    const isOutOfStock =
        isVariantOutOfStock(
            selectedVariant
        );

    return (

        <CustomerLayout>

            <div className="pd-page">

                <div className="pd-container">

                    {/* MAIN */}

                    <div className="pd-main">

                        {/* LEFT */}

                        <div className="pd-gallery">

                            <div className="pd-main-image">

                                <img
                                    src={
                                        selectedImage
                                    }
                                    alt={
                                        product.name
                                    }
                                    className="pd-main-image-img"
                                />

                            </div>

                            <div className="pd-thumbnails">

                                {product.images?.map(
                                    (img) => (

                                        <button
                                            key={img.id}
                                            onClick={() =>
                                                setSelectedImage(
                                                    img.image_url
                                                )
                                            }
                                            className={`pd-thumb ${selectedImage ===
                                                img.image_url
                                                ? "active"
                                                : ""
                                                }`}
                                        >

                                            <img
                                                src={
                                                    img.image_url
                                                }
                                                alt=""
                                                className="pd-thumb-img"
                                            />

                                        </button>

                                    )
                                )}

                            </div>

                        </div>

                        {/* RIGHT */}

                        <div className="pd-info">

                            <h1 className="pd-title">

                                {product.name}

                            </h1>

                            <div className="pd-meta">

                                <div>
                                    Mã SP:
                                    {" "}
                                    {product.product_code}
                                </div>

                                <div>
                                    Danh mục:
                                    {" "}
                                    {product?.category?.name}
                                </div>

                                <div>
                                    Thương hiệu:
                                    {" "}
                                    {product?.brand?.name || "Đang cập nhật"}
                                </div>

                            </div>

                            <div className="pd-price-box">

                                <div className="pd-price">

                                    {discount ? (
                                        <>
                                            <div className="pd-old-price">
                                                {formatPrice(
                                                    originalPrice
                                                )}
                                            </div>

                                            <div className="pd-sale-price">
                                                {formatPrice(
                                                    salePrice
                                                )}
                                            </div>

                                            <div className="pd-discount-badge">
                                                {discount.type === "percent"
                                                    ? `-${discount.value}%`
                                                    : `-${formatPrice(discount.value)}`}
                                            </div>
                                        </>
                                    ) : (
                                        formatPrice(
                                            originalPrice
                                        )
                                    )}

                                </div>

                            </div>

                            {/* VARIANTS */}

                            <div className="pd-section">

                                <h3 className="pd-section-title">

                                    Lựa chọn

                                </h3>

                                <div className="pd-variants">

                                    {product.variants?.map(
                                        (
                                            variant
                                        ) => {

                                            const disabled =
                                                isVariantOutOfStock(
                                                    variant
                                                );

                                            return (

                                                <button
                                                    key={
                                                        variant.id
                                                    }
                                                    onClick={() =>
                                                        setSelectedVariant(
                                                            variant
                                                        )
                                                    }
                                                    disabled={
                                                        disabled
                                                    }
                                                    className={`pd-variant-btn
                                                    ${selectedVariant?.id ===
                                                            variant.id
                                                            ? "active"
                                                            : ""
                                                        }
                                                    ${disabled
                                                            ? "disabled"
                                                            : ""
                                                        }`}
                                                >

                                                    {
                                                        variant.variant_name
                                                    }

                                                </button>

                                            );

                                        }
                                    )}

                                </div>

                            </div>

                            {/* QUANTITY */}

                            <div className="pd-section">

                                <h3 className="pd-section-title">

                                    Số lượng

                                </h3>

                                <div className="pd-qty">

                                    <button
                                        className="pd-qty-btn"
                                        onClick={() =>
                                            setQuantity(
                                                Math.max(
                                                    1,
                                                    quantity -
                                                    1
                                                )
                                            )
                                        }
                                    >
                                        -
                                    </button>

                                    <div className="pd-qty-value">

                                        {quantity}

                                    </div>

                                    <button
                                        className="pd-qty-btn"
                                        onClick={() =>
                                            setQuantity(
                                                Math.min(
                                                    availableStock,
                                                    quantity +
                                                    1
                                                )
                                            )
                                        }
                                    >
                                        +
                                    </button>

                                </div>

                            </div>

                            {/* SERVICES */}

                            <div className="pd-services">

                                <div className="pd-service-item">

                                    <FaTruck />

                                    <span>
                                        Giao hàng toàn quốc
                                    </span>

                                </div>

                                <div className="pd-service-item">

                                    <FaShieldAlt />

                                    <span>
                                        Chính hãng 100%
                                    </span>

                                </div>

                            </div>

                            {/* ACTIONS */}

                            <div className="pd-actions">

                                <button
                                    className="pd-add-cart"
                                    onClick={
                                        handleAddToCart
                                    }
                                    disabled={
                                        addingCart ||
                                        isOutOfStock
                                    }
                                >

                                    <FaShoppingCart />

                                    <span>
                                        Thêm vào giỏ
                                    </span>

                                </button>

                                <button
                                    className="pd-buy-now"
                                    onClick={
                                        handleBuyNow
                                    }
                                    disabled={
                                        isOutOfStock
                                    }
                                >

                                    Mua ngay

                                </button>

                            </div>

                        </div>

                    </div>

                    {/* DESCRIPTION */}

                    <div className="pd-description">

                        <h2 className="pd-description-title">
                            Mô tả sản phẩm
                        </h2>

                        <div className="pd-description-content">

                            {
                                showFullDescription
                                    ? product.description
                                    : shortDescription
                            }

                        </div>

                        {
                            product.description &&
                            product.description.split("\n").length > 5 && (

                                <button
                                    className="pd-description-toggle"
                                    onClick={() =>
                                        setShowFullDescription(
                                            !showFullDescription
                                        )
                                    }
                                >

                                    {
                                        showFullDescription
                                            ? "Thu gọn"
                                            : "Xem thêm"
                                    }

                                </button>

                            )
                        }

                    </div>

                    {/* RELATED PRODUCTS - CẢI TIẾN */}

                    <div className="pd-related">

                        <h2 className="pd-related-title">
                            Sản phẩm tương tự
                        </h2>

                        {relatedProducts.length === 0 ? (
                            <div className="pd-related-empty">
                                Không có sản phẩm tương tự
                            </div>
                        ) : (
                            <div className="pd-related-grid">
                                {relatedProducts.map((item) => {
                                    // Lấy variant đầu tiên
                                    const firstVariant = item?.variants?.[0];
                                    
                                    // Lấy giá bán cuối cùng
                                    const hasDiscount = firstVariant?.discount;
                                    const finalPrice = hasDiscount 
                                        ? Number(firstVariant?.sale_price || firstVariant?.price)
                                        : Number(firstVariant?.price);
                                    
                                    // Lấy ảnh đại diện
                                    const productImage = item?.images?.[0]?.image_url || 
                                                        "https://picsum.photos/200/200";
                                    
                                    // Kiểm tra còn hàng
                                    const isOutOfStock = (firstVariant?.quantity || 0) === 0;
                                    
                                    return (
                                        <Link
                                            key={item.id}
                                            to={`/product/${item.id}`}
                                            className="pd-related-card"
                                        >
                                            <div className="pd-related-image-wrapper">
                                                <img
                                                    src={productImage}
                                                    alt={item.name}
                                                    className="pd-related-image"
                                                />
                                                {isOutOfStock && (
                                                    <div className="pd-related-soldout">
                                                        Hết hàng
                                                    </div>
                                                )}
                                            </div>

                                            <div className="pd-related-content">
                                                <div className="pd-related-name" title={item.name}>
                                                    {item.name.length > 40 
                                                        ? item.name.slice(0, 40) + "..." 
                                                        : item.name}
                                                </div>

                                                <div className="pd-related-price">
                                                    {hasDiscount ? (
                                                        <>
                                                            <div className="pd-related-old-price">
                                                                {formatPrice(firstVariant?.price)}
                                                            </div>
                                                            <div className="pd-related-sale-price">
                                                                {formatPrice(finalPrice)}
                                                            </div>
                                                        </>
                                                    ) : (
                                                        <div className="pd-related-current-price">
                                                            {formatPrice(finalPrice)}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}

                    </div>

                </div>

            </div>

        </CustomerLayout>

    );

}

export default ProductDetail;