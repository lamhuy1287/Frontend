import {
    useEffect,
    useState
} from "react";

import {
    useParams,
    useNavigate
} from "react-router-dom";

import {
    getProductDetail
} from "../../../services/productService";

function ProductDetail() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // =========================
    // DESCRIPTION TOGGLE STATE
    // =========================
    const [expandedDesc, setExpandedDesc] = useState(false);

    // =========================
    // FETCH PRODUCT
    // =========================
    const fetchProduct = async () => {

        try {
            setLoading(true);
            setError(null);

            const res = await getProductDetail(id);

            let productData = null;

            if (res.data?.data) {
                productData = res.data.data;
            } else if (res.data?.product) {
                productData = res.data.product;
            } else if (res.data && typeof res.data === "object") {
                productData = res.data;
            }

            if (!productData) {
                throw new Error("Không có dữ liệu sản phẩm");
            }

            setProduct(productData);

        } catch (err) {

            console.error(err);

            if (err.response) {
                setError(`Lỗi ${err.response.status}`);
            } else {
                setError("Không thể kết nối server");
            }

        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (id) {
            fetchProduct();
        } else {
            setError("Không tìm thấy ID sản phẩm");
            setLoading(false);
        }
    }, [id]);

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div style={loadingStyle}>
                <h2>Đang tải...</h2>
            </div>
        );
    }

    // =========================
    // ERROR
    // =========================
    if (error) {
        return (
            <div style={errorStyle}>
                <h2 style={{ color: "red" }}>{error}</h2>

                <button
                    style={backBtn}
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </button>
            </div>
        );
    }

    // =========================
    // NOT FOUND
    // =========================
    if (!product) {
        return (
            <div style={errorStyle}>
                <h2>Không tìm thấy sản phẩm</h2>

                <button
                    style={backBtn}
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </button>
            </div>
        );
    }

    // =========================
    // MAIN IMAGE
    // =========================
    const mainImage =
        product.images?.length > 0
            ? product.images[0].image_url
            : null;

    // =========================
    // FORMAT DATE
    // =========================
    const formatDate = (dateString) => {
        if (!dateString) return "Không có";

        try {
            return new Date(dateString).toLocaleDateString("vi-VN");
        } catch {
            return dateString;
        }
    };

    // =========================
    // DESCRIPTION LOGIC
    // =========================
    const isLongDesc = product.description?.length > 250;

    const shortDesc = isLongDesc
        ? product.description.slice(0, 250) + "..."
        : product.description;

    return (
        <div style={pageStyle}>

            {/* HEADER */}
            <div style={headerStyle}>
                <h1 style={pageTitle}>Chi tiết sản phẩm</h1>

                <button
                    style={backBtn}
                    onClick={() => navigate(-1)}
                >
                    Quay lại
                </button>
            </div>

            {/* MAIN CARD */}
            <div style={cardStyle}>

                {/* LEFT */}
                <div>
                    <img
                        src={
                            mainImage
                                ? mainImage
                                : "https://placehold.co/600x400?text=No+Image"
                        }
                        alt={product.name}
                        style={imageStyle}
                    />

                    {product.images?.length > 0 && (
                        <div style={imageList}>
                            {product.images.map((img, idx) => (
                                <img
                                    key={idx}
                                    src={img.image_url}
                                    alt=""
                                    style={subImageStyle}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* RIGHT */}
                <div style={infoStyle}>

                    <InfoRow label="Tên sản phẩm" value={product.name} />
                    <InfoRow label="Mã sản phẩm" value={product.product_code} />
                    <InfoRow label="Danh mục" value={product.category?.name || product.category} />
                    <InfoRow label="Thương hiệu" value={product.brand?.name || product.brand} />
                    <InfoRow label="Ngày tạo" value={formatDate(product.created_at)} />

                </div>

            </div>

            {/* VARIANTS */}
            <div style={variantCard}>

                <div style={variantHeader}>
                    <div>
                        <h2 style={variantTitle}>Danh sách biến thể</h2>
                        <p style={variantSubTitle}>
                            Tổng số: {product.variants?.length || 0} biến thể
                        </p>
                    </div>
                </div>

                {product.variants?.length > 0 ? (
                    <div style={tableWrapper}>
                        <table style={tableStyle}>
                            <thead>
                                <tr>
                                    <th style={thStyle}>STT</th>
                                    <th style={thStyle}>Tên biến thể</th>
                                    <th style={thStyle}>Giá</th>
                                    <th style={thStyle}>Số lượng</th>
                                </tr>
                            </thead>

                            <tbody>
                                {product.variants.map((variant, index) => (
                                    <tr key={variant.id} style={trStyle}>
                                        <td style={tdStyle}>{index + 1}</td>

                                        <td style={tdStyle}>
                                            <div style={variantNameBox}>
                                                {variant.variant_name || variant.name}
                                            </div>
                                        </td>

                                        <td style={tdStyle}>
                                            <span style={priceTag}>
                                                {variant.price
                                                    ? Number(variant.price).toLocaleString("vi-VN")
                                                    : 0} VNĐ
                                            </span>
                                        </td>

                                        <td style={tdStyle}>
                                            <span
                                                style={{
                                                    ...stockBadge,
                                                    background:
                                                        variant.quantity > 0
                                                            ? "#DCFCE7"
                                                            : "#FEE2E2",
                                                    color:
                                                        variant.quantity > 0
                                                            ? "#166534"
                                                            : "#991B1B"
                                                }}
                                            >
                                                {variant.quantity || 0}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div style={emptyVariant}>Không có biến thể nào</div>
                )}

            </div>

            {/* DESCRIPTION */}
            {product.description && (
                <div style={descriptionCard}>
                    <h2>Mô tả sản phẩm</h2>

                    <div style={{ marginTop: "12px" }}>
                        <p
                            style={{
                                ...descriptionText,
                                whiteSpace: "pre-line"
                            }}
                        >
                            {expandedDesc || !isLongDesc
                                ? product.description
                                : shortDesc}
                        </p>

                        {isLongDesc && (
                            <button
                                onClick={() => setExpandedDesc(!expandedDesc)}
                                style={{
                                    marginTop: "10px",
                                    background: "none",
                                    border: "none",
                                    color: "#2563EB",
                                    cursor: "pointer",
                                    fontWeight: "600",
                                    padding: 0
                                }}
                            >
                                {expandedDesc ? "Thu gọn" : "Xem thêm"}
                            </button>
                        )}
                    </div>
                </div>
            )}

            {/* ACTION */}
            <div style={actionWrapper}>
                <button
                    style={editBtn}
                    onClick={() =>
                        navigate(`/admin/products/edit/${product.id}`)
                    }
                >
                    Chỉnh sửa sản phẩm
                </button>
            </div>

        </div>
    );
}

// =========================
// INFO ROW
// =========================
function InfoRow({ label, value }) {
    return (
        <div style={rowStyle}>
            <span style={labelStyle}>{label}</span>
            <span style={valueStyle}>{value || "---"}</span>
        </div>
    );
}

// =========================
// (GIỮ NGUYÊN STYLE CỦA BẠN)
// =========================

const pageStyle = {
    padding: "30px",
    maxWidth: "1200px",
    margin: "0 auto",
    background: "#F5F7FB",
    minHeight: "100vh"
};

const pageTitle = {
    fontSize: "32px",
    fontWeight: "700",
    color: "#111827"
};

const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "25px",
    flexWrap: "wrap",
    gap: "15px"
};

const backBtn = {
    border: "none",
    background: "#2563EB",
    color: "white",
    padding: "12px 22px",
    borderRadius: "10px",
    cursor: "pointer",
    fontWeight: "600"
};

const cardStyle = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "30px",
    background: "white",
    padding: "25px",
    borderRadius: "16px",
    marginBottom: "25px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
};

const imageStyle = {
    width: "100%",
    height: "420px",
    objectFit: "contain",
    background: "#F9FAFB",
    borderRadius: "12px"
};

const imageList = {
    display: "flex",
    gap: "10px",
    marginTop: "15px",
    flexWrap: "wrap"
};

const subImageStyle = {
    width: "80px",
    height: "80px",
    objectFit: "cover",
    borderRadius: "10px",
    border: "1px solid #E5E7EB"
};

const infoStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "8px"
};

const rowStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "14px 0",
    borderBottom: "1px solid #F3F4F6"
};

const labelStyle = {
    fontWeight: "600",
    color: "#111827"
};

const valueStyle = {
    color: "#6B7280"
};

const variantCard = {
    background: "white",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
    marginBottom: "25px"
};

const variantHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
};

const variantTitle = {
    margin: 0,
    fontSize: "24px",
    fontWeight: "700",
    color: "#111827"
};

const variantSubTitle = {
    marginTop: "5px",
    color: "#6B7280",
    fontSize: "14px"
};

const tableWrapper = {
    overflowX: "auto",
    borderRadius: "12px",
    border: "1px solid #E5E7EB"
};

const tableStyle = {
    width: "100%",
    borderCollapse: "collapse"
};

const thStyle = {
    background: "#F9FAFB",
    padding: "16px",
    textAlign: "left",
    fontSize: "14px",
    fontWeight: "600",
    color: "#374151",
    borderBottom: "1px solid #E5E7EB"
};

const tdStyle = {
    padding: "16px",
    borderBottom: "1px solid #F3F4F6",
    fontSize: "14px",
    color: "#374151"
};

const trStyle = {
    transition: "0.2s"
};

const variantNameBox = {
    fontWeight: "600",
    color: "#111827"
};

const priceTag = {
    background: "#DBEAFE",
    color: "#1D4ED8",
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "600",
    fontSize: "13px"
};

const stockBadge = {
    padding: "6px 12px",
    borderRadius: "999px",
    fontWeight: "600",
    fontSize: "13px",
    display: "inline-block",
    minWidth: "40px",
    textAlign: "center"
};

const emptyVariant = {
    padding: "40px",
    textAlign: "center",
    color: "#6B7280"
};

const descriptionCard = {
    background: "white",
    padding: "25px",
    borderRadius: "16px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.05)"
};

const descriptionText = {
    lineHeight: "1.8",
    color: "#4B5563",
    marginTop: "12px"
};

const actionWrapper = {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: "30px"
};

const editBtn = {
    border: "none",
    background: "#F59E0B",
    color: "white",
    padding: "14px 28px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600"
};

const loadingStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh"
};

const errorStyle = {
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    gap: "20px"
};

export default ProductDetail;