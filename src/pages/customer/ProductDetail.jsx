import {
    useEffect,
    useMemo,
    useState
} from "react";

import {
    useParams,
    Link
} from "react-router-dom";

import CustomerLayout from "../../layouts/CustomerLayout";

import {
    getProductDetail,
    getProducts
} from "../../services/productService";

import {
    FaShoppingCart,
    FaTruck,
    FaShieldAlt
} from "react-icons/fa";
import {
    addToCart
} from "../../services/cartService";

import socket from "../../socket";

function ProductDetail() {

    const { id } = useParams();

    const [product, setProduct] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [selectedImage,
        setSelectedImage] =
        useState("");

    const [selectedVariant,
        setSelectedVariant] =
        useState(null);

    const [showFullDescription,
        setShowFullDescription] =
        useState(false);

    const [quantity,
        setQuantity] =
        useState(1);

    const [relatedProducts,
        setRelatedProducts] =
        useState([]);

    const [addingCart,
        setAddingCart] =
        useState(false);

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

            // =====================
            // IMAGE
            // =====================

            setSelectedImage((prev) => {

                if (!prev) {
                    return productData.images?.[0]?.image_url || "";
                }

                const found =
                    productData.images.find(
                        (img) =>
                            img.image_url === prev
                    );

                return (
                    found?.image_url ||
                    productData.images?.[0]?.image_url ||
                    ""
                );

            });

            // =====================
            // VARIANT
            // =====================

            setSelectedVariant((prev) => {

                if (!prev) {
                    return productData.variants?.[0];
                }

                const found =
                    productData.variants.find(
                        (v) =>
                            v.id === prev.id
                    );

                return (
                    found ||
                    productData.variants?.[0] ||
                    null
                );

            });

            // =====================
            // RELATED PRODUCTS
            // =====================

            try {

                const relatedRes =
                    await getProducts();

                let allProducts =
                    relatedRes?.data?.data?.products || [];

                allProducts =
                    allProducts.filter(
                        (item) =>
                            item.id !== productData.id
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

            }

        } catch (error) {

            console.log(error);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchProduct();

        // =====================
        // REALTIME LISTENER
        // =====================

        socket.on(
            "product_updated",
            (data) => {

                console.log(
                    "SOCKET product_updated:",
                    data
                );

                if (
                    Number(data.product_id) ===
                    Number(id)
                ) {

                    console.log(
                        "Realtime refresh product"
                    );

                    fetchProduct();

                }

            }
        );

        // =====================
        // CLEANUP
        // =====================

        return () => {

            socket.off(
                "product_updated"
            );

        };

    }, [id]);

    // =========================
    // DESCRIPTION
    // =========================

    const shortDescription =
        useMemo(() => {

            if (
                !product?.description
            ) return "";

            return product.description
                .split("\n")
                .slice(0, 5)
                .join("\n");

        }, [product]);

    // =========================
    // ADD TO CART
    // =========================

    const handleAddToCart =
        async () => {

            // CHƯA CHỌN VARIANT
            if (!selectedVariant) {

                alert(
                    "Vui lòng chọn phân loại"
                );

                return;
            }

            // CHƯA LOGIN
            const token =
                localStorage.getItem(
                    "token"
                );

            if (!token) {

                alert(
                    "Vui lòng đăng nhập"
                );

                return;
            }

            try {

                setAddingCart(true);

                await addToCart({

                    product_variant_id:
                        selectedVariant.id,

                    quantity: quantity

                });

                alert(
                    "Đã thêm vào giỏ hàng"
                );

            } catch (error) {

                console.log(error);

                alert(
                    error.response?.data?.message ||
                    "Add to cart failed"
                );

            } finally {

                setAddingCart(false);

            }

        };

    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <CustomerLayout>

                <div style={styles.loading}>
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

                <div style={styles.notFound}>
                    Product not found
                </div>

            </CustomerLayout>

        );

    }

    // =========================
    // PRICE
    // =========================

    const price =
        Number(
            selectedVariant?.price
        ) || 0;

    const formatPrice = (
        value
    ) => {

        return (
            value.toLocaleString(
                "vi-VN"
            ) + "₫"
        );

    };

    return (

        <CustomerLayout>

            <div style={styles.page}>

                <div style={styles.container}>

                    {/* MAIN */}
                    <div style={styles.main}>

                        {/* LEFT */}
                        <div>

                            {/* MAIN IMAGE */}
                            <div
                                style={
                                    styles.mainImage
                                }
                            >

                                <img
                                    src={
                                        selectedImage
                                    }
                                    alt={
                                        product.name
                                    }
                                    style={
                                        styles.mainImageImg
                                    }
                                />

                            </div>

                            {/* THUMBNAILS */}
                            <div
                                style={
                                    styles.thumbnailList
                                }
                            >

                                {product.images?.map(
                                    (
                                        img
                                    ) => (

                                        <button
                                            key={
                                                img.id
                                            }
                                            onClick={() =>
                                                setSelectedImage(
                                                    img.image_url
                                                )
                                            }
                                            style={{
                                                ...styles.thumbnail,
                                                border:
                                                    selectedImage ===
                                                        img.image_url
                                                        ? "2px solid #ee4d2d"
                                                        : "2px solid #ddd"
                                            }}
                                        >

                                            <img
                                                src={
                                                    img.image_url
                                                }
                                                alt=""
                                                style={
                                                    styles.thumbnailImg
                                                }
                                            />

                                        </button>

                                    ))}

                            </div>

                        </div>

                        {/* RIGHT */}
                        <div>

                            {/* NAME */}
                            <h1
                                style={
                                    styles.title
                                }
                            >
                                {product.name}
                            </h1>

                            {/* INFO */}
                            <div
                                style={
                                    styles.infoBox
                                }
                            >

                                <div
                                    style={
                                        styles.infoRow
                                    }
                                >

                                    <span
                                        style={
                                            styles.infoLabel
                                        }
                                    >
                                        Mã sản phẩm:
                                    </span>

                                    <span>
                                        {product.product_code || "N/A"}
                                    </span>

                                </div>

                                <div
                                    style={
                                        styles.infoRow
                                    }
                                >

                                    <span
                                        style={
                                            styles.infoLabel
                                        }
                                    >
                                        Danh mục:
                                    </span>

                                    <span>
                                        {product
                                            ?.category
                                            ?.name ||
                                            "Chưa có"}
                                    </span>

                                </div>

                            </div>

                            {/* PRICE */}
                            <div
                                style={
                                    styles.priceBox
                                }
                            >

                                <div
                                    style={
                                        styles.price
                                    }
                                >
                                    {formatPrice(
                                        price
                                    )}
                                </div>

                            </div>

                            {/* VARIANT */}
                            <div
                                style={
                                    styles.section
                                }
                            >

                                <h3
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Lựa chọn
                                </h3>

                                <div
                                    style={
                                        styles.variantList
                                    }
                                >

                                    {product.variants?.map(
                                        (
                                            variant
                                        ) => (

                                            <button
                                                key={
                                                    variant.id
                                                }
                                                onClick={() =>
                                                    setSelectedVariant(
                                                        variant
                                                    )
                                                }
                                                style={{
                                                    ...styles.variantBtn,
                                                    border:
                                                        selectedVariant?.id ===
                                                            variant.id
                                                            ? "1px solid #ee4d2d"
                                                            : "1px solid #ccc",
                                                    background:
                                                        selectedVariant?.id ===
                                                            variant.id
                                                            ? "#fff1ee"
                                                            : "white",
                                                    color:
                                                        selectedVariant?.id ===
                                                            variant.id
                                                            ? "#ee4d2d"
                                                            : "#333"
                                                }}
                                            >

                                                {
                                                    variant.variant_name
                                                }

                                            </button>

                                        ))}

                                </div>

                            </div>

                            {/* QUANTITY */}
                            <div
                                style={
                                    styles.section
                                }
                            >

                                <h3
                                    style={
                                        styles.sectionTitle
                                    }
                                >
                                    Số lượng
                                </h3>

                                <div
                                    style={
                                        styles.quantityWrapper
                                    }
                                >

                                    <button
                                        style={
                                            styles.qtyBtn
                                        }
                                        onClick={() =>
                                            setQuantity(
                                                (
                                                    prev
                                                ) =>
                                                    prev >
                                                        1
                                                        ? prev -
                                                        1
                                                        : 1
                                            )
                                        }
                                    >
                                        -
                                    </button>

                                    <div
                                        style={
                                            styles.qtyValue
                                        }
                                    >
                                        {
                                            quantity
                                        }
                                    </div>

                                    <button
                                        style={
                                            styles.qtyBtn
                                        }
                                        onClick={() =>
                                            setQuantity(
                                                (
                                                    prev
                                                ) =>
                                                    prev <
                                                        5
                                                        ? prev +
                                                        1
                                                        : 5
                                            )
                                        }
                                    >
                                        +
                                    </button>

                                </div>

                                <div
                                    style={
                                        styles.qtyNote
                                    }
                                >
                                    Tối đa 5
                                    sản phẩm
                                </div>

                            </div>

                            {/* SERVICES */}
                            <div
                                style={
                                    styles.services
                                }
                            >

                                <div
                                    style={
                                        styles.serviceItem
                                    }
                                >

                                    <FaTruck color="#ee4d2d" />

                                    <span>
                                        Giao
                                        hàng
                                        toàn
                                        quốc
                                    </span>

                                </div>

                                <div
                                    style={
                                        styles.serviceItem
                                    }
                                >

                                    <FaShieldAlt color="#ee4d2d" />

                                    <span>
                                        Bảo
                                        hành
                                        chính
                                        hãng
                                    </span>

                                </div>

                            </div>

                            {/* BUTTON */}
                            <div
                                style={
                                    styles.actions
                                }
                            >

                                <button
                                    style={{
                                        ...styles.addCartBtn,
                                        opacity:
                                            addingCart ? 0.7 : 1,
                                        cursor:
                                            addingCart
                                                ? "not-allowed"
                                                : "pointer"
                                    }}
                                    onClick={
                                        handleAddToCart
                                    }
                                    disabled={addingCart}
                                >

                                    <FaShoppingCart />

                                    <span>

                                        {
                                            addingCart
                                                ? "Đang thêm..."
                                                : "Thêm vào giỏ hàng"
                                        }

                                    </span>

                                </button>

                                <button
                                    style={
                                        styles.buyNowBtn
                                    }
                                >
                                    Mua ngay
                                </button>

                            </div>

                        </div>

                    </div>

                    {/* DESCRIPTION */}
                    <div
                        style={
                            styles.descriptionBox
                        }
                    >

                        <h2
                            style={
                                styles.descriptionTitle
                            }
                        >
                            Mô tả sản phẩm
                        </h2>

                        <div
                            style={
                                styles.descriptionContent
                            }
                        >

                            {showFullDescription
                                ? product.description
                                : shortDescription}

                        </div>

                        {product.description &&
                            product.description.split(
                                "\n"
                            ).length >
                            5 && (

                                <button
                                    onClick={() =>
                                        setShowFullDescription(
                                            !showFullDescription
                                        )
                                    }
                                    style={
                                        styles.showMoreBtn
                                    }
                                >

                                    {showFullDescription
                                        ? "Thu gọn"
                                        : "Xem thêm"}

                                </button>

                            )}

                    </div>

                    {/* RELATED PRODUCTS */}
                    <div
                        style={
                            styles.relatedBox
                        }
                    >

                        <h2
                            style={
                                styles.relatedTitle
                            }
                        >
                            Sản phẩm tương tự
                        </h2>

                        <div
                            style={
                                styles.relatedGrid
                            }
                        >

                            {relatedProducts.map(
                                (
                                    item
                                ) => (

                                    <Link
                                        key={
                                            item.id
                                        }
                                        to={`/product/${item.id}`}
                                        style={
                                            styles.relatedCard
                                        }
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
                                            style={
                                                styles.relatedImage
                                            }
                                        />

                                        <div
                                            style={
                                                styles.relatedContent
                                            }
                                        >

                                            <div
                                                style={
                                                    styles.relatedName
                                                }
                                            >
                                                {
                                                    item.name
                                                }
                                            </div>

                                            <div
                                                style={
                                                    styles.relatedPrice
                                                }
                                            >

                                                {formatPrice(
                                                    Number(
                                                        item
                                                            .variants?.[0]
                                                            ?.price ||
                                                        0
                                                    )
                                                )}

                                            </div>

                                        </div>

                                    </Link>

                                ))}

                        </div>

                    </div>

                </div>

            </div>

        </CustomerLayout>

    );

}

// =========================
// STYLES
// =========================

const styles = {

    page: {
        background: "#f5f5f5",
        minHeight: "100vh",
        // padding: "24px 0"
    },

    container: {
        maxWidth: "1200px",
        margin: "auto",
        // padding: "0 16px"
    },

    main: {
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        display: "grid",
        gridTemplateColumns:
            "450px 1fr",
        gap: "40px"
    },

    mainImage: {
        width: "100%",
        height: "450px",
        background: "#f3f3f3",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #eee"
    },

    mainImageImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },

    thumbnailList: {
        display: "flex",
        gap: "12px",
        marginTop: "16px",
        overflowX: "auto"
    },

    thumbnail: {
        width: "80px",
        height: "80px",
        borderRadius: "12px",
        overflow: "hidden",
        background: "white",
        cursor: "pointer",
        flexShrink: 0
    },

    thumbnailImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },

    title: {
        fontSize: "22px",
        fontWeight: "500",
        lineHeight: "1.6",
        color: "#222"
    },

    infoBox: {
        marginTop: "20px",
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },

    infoRow: {
        display: "flex",
        gap: "10px",
        color: "#555"
    },

    infoLabel: {
        fontWeight: "600",
        color: "#222"
    },

    priceBox: {
        background: "#fafafa",
        padding: "24px",
        borderRadius: "16px",
        marginTop: "24px"
    },

    price: {
        fontSize: "38px",
        fontWeight: "bold",
        color: "#ee4d2d"
    },

    section: {
        marginTop: "32px"
    },

    sectionTitle: {
        marginBottom: "16px",
        color: "#666",
        fontSize: "16px"
    },

    variantList: {
        display: "flex",
        flexWrap: "wrap",
        gap: "12px"
    },

    variantBtn: {
        padding: "12px 20px",
        borderRadius: "10px",
        background: "white",
        cursor: "pointer"
    },

    quantityWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },

    qtyBtn: {
        width: "42px",
        height: "42px",
        border: "1px solid #ddd",
        background: "white",
        cursor: "pointer",
        fontSize: "20px"
    },

    qtyValue: {
        width: "60px",
        height: "42px",
        border: "1px solid #ddd",
        display: "flex",
        alignItems: "center",
        justifyContent:
            "center"
    },

    qtyNote: {
        marginTop: "10px",
        color: "#999",
        fontSize: "14px"
    },

    services: {
        marginTop: "32px",
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    },

    serviceItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        color: "#555"
    },

    actions: {
        display: "flex",
        gap: "16px",
        marginTop: "40px"
    },

    addCartBtn: {
        flex: 1,
        height: "56px",
        borderRadius: "14px",
        border:
            "1px solid #ee4d2d",
        background: "#fff1ee",
        color: "#ee4d2d",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px"
    },

    buyNowBtn: {
        flex: 1,
        height: "56px",
        borderRadius: "14px",
        border: "none",
        background: "#ee4d2d",
        color: "white",
        fontSize: "16px",
        fontWeight: "600",
        cursor: "pointer"
    },

    descriptionBox: {
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        marginTop: "24px"
    },

    descriptionTitle: {
        fontSize: "24px",
        marginBottom: "24px"
    },

    descriptionContent: {
        whiteSpace: "pre-line",
        lineHeight: "2",
        color: "#555",
        fontSize: "15px"
    },

    showMoreBtn: {
        marginTop: "20px",
        background: "none",
        border: "none",
        color: "#ee4d2d",
        fontWeight: "600",
        cursor: "pointer"
    },

    relatedBox: {
        background: "white",
        borderRadius: "16px",
        padding: "24px",
        marginTop: "24px"
    },

    relatedTitle: {
        fontSize: "24px",
        marginBottom: "24px"
    },

    relatedGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fill, minmax(220px, 1fr))",
        gap: "20px"
    },

    relatedCard: {
        border: "1px solid #eee",
        borderRadius: "14px",
        overflow: "hidden",
        textDecoration: "none",
        color: "#222",
        background: "white"
    },

    relatedImage: {
        width: "100%",
        height: "220px",
        objectFit: "cover"
    },

    relatedContent: {
        padding: "14px"
    },

    relatedName: {
        fontSize: "15px",
        lineHeight: "1.5",
        height: "45px",
        overflow: "hidden"
    },

    relatedPrice: {
        marginTop: "12px",
        color: "#ee4d2d",
        fontWeight: "bold",
        fontSize: "18px"
    },

    loading: {
        textAlign: "center",
        padding: "100px 0",
        fontSize: "22px"
    },

    notFound: {
        textAlign: "center",
        padding: "100px 0",
        fontSize: "22px"
    }

};

export default ProductDetail;