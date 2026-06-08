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

            // RELATED

            const relatedRes =
                await getProducts();

            let allProducts =
                relatedRes?.data?.data
                    ?.products || [];

            allProducts =
                allProducts.filter(
                    (item) =>
                        item.id !==
                        productData.id
                );

            const related =
                allProducts.filter(
                    (item) =>
                        item.category_id ===
                        productData.category_id
                );

            setRelatedProducts(
                related.slice(0, 5)
            );

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

            } finally {

                setAddingCart(false);

            }

        };

    // =========================
    // BUY NOW
    // =========================

    const handleBuyNow =
        async () => {

            if (!selectedVariant)
                return;

            navigate("/checkout", {

                state: {

                    buyNow: true,

                    product,

                    variant:
                        selectedVariant,

                    quantity

                }

            });

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

    const price =
        Number(selectedVariant?.price) ||
        0;

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
                                    {
                                        product.product_code
                                    }
                                </div>

                                <div>
                                    Danh mục:
                                    {" "}
                                    {
                                        product
                                            ?.category
                                            ?.name
                                    }
                                </div>

                            </div>

                            <div className="pd-price-box">

                                <div className="pd-price">

                                    {formatPrice(
                                        price
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

                    {/* RELATED */}

                    <div className="pd-related">

                        <h2 className="pd-related-title">

                            Sản phẩm tương tự

                        </h2>

                        <div className="pd-related-grid">

                            {relatedProducts.map(
                                (item) => (

                                    <Link
                                        key={
                                            item.id
                                        }
                                        to={`/product/${item.id}`}
                                        className="pd-related-card"
                                    >

                                        <img
                                            src={
                                                item
                                                    .images?.[0]
                                                    ?.image_url
                                            }
                                            alt={
                                                item.name
                                            }
                                            className="pd-related-image"
                                        />

                                        <div className="pd-related-content">

                                            <div className="pd-related-name">

                                                {
                                                    item.name.length > 10
                                                        ? item.name.slice(0, 10) + "..."
                                                        : item.name
                                                }

                                            </div>

                                            <div className="pd-related-price">

                                                {formatPrice(
                                                    item
                                                        ?.variants?.[0]
                                                        ?.price
                                                )}

                                            </div>

                                        </div>

                                    </Link>

                                )
                            )}

                        </div>

                    </div>

                </div>

            </div>

        </CustomerLayout>

    );

}

export default ProductDetail;