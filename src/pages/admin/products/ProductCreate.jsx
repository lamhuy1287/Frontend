import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getCategories } from "../../../services/categoryService";
import { getBrands } from "../../../services/brandService";
import { createProduct } from "../../../services/productService";

function ProductCreate() {

    const navigate = useNavigate();

    // =========================
    // STATES
    // =========================

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [name, setName] = useState("");
    const [productCode, setProductCode] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [brandId, setBrandId] = useState("");
    const [description, setDescription] = useState("");

    const [variants, setVariants] = useState([
        {
            variant_name: "",
            price: "",
            quantity: ""
        }
    ]);

    const [images, setImages] = useState([]);

    // =========================
    // LOAD DATA
    // =========================

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {

        try {

            const categoryRes = await getCategories();
            const brandRes = await getBrands();

            setCategories(
                flattenCategories(
                    categoryRes.data || categoryRes
                )
            );

            setBrands(
                brandRes.data || brandRes
            );

        } catch (err) {

            console.log(err);

        }
    };

    // =========================
    // FLATTEN CATEGORY
    // =========================

    const flattenCategories = (
        categories,
        level = 0
    ) => {

        let result = [];

        categories.forEach((category) => {

            result.push({
                ...category,
                level
            });

            if (category.children?.length > 0) {

                result = [
                    ...result,
                    ...flattenCategories(
                        category.children,
                        level + 1
                    )
                ];
            }
        });

        return result;
    };

    // =========================
    // VARIANTS
    // =========================

    const addVariant = () => {

        setVariants([
            ...variants,
            {
                variant_name: "",
                price: "",
                quantity: ""
            }
        ]);
    };

    const updateVariant = (
        index,
        field,
        value
    ) => {

        const updated = [...variants];

        updated[index][field] = value;

        setVariants(updated);
    };

    const removeVariant = (index) => {

        if (variants.length === 1) return;

        setVariants(
            variants.filter((_, i) => i !== index)
        );
    };

// =========================
// IMAGES
// =========================

const handleImageChange = (e) => {

    const files = Array.from(e.target.files);

    const mappedImages = files.map((file) => ({
        file,
        preview: URL.createObjectURL(file)
    }));

    setImages((prev) => [
        ...prev,
        ...mappedImages
    ]);
};

const removeImage = (index) => {

    if (images[index]?.preview) {

        URL.revokeObjectURL(
            images[index].preview
        );
    }

    setImages(
        images.filter((_, i) => i !== index)
    );
};

// Cleanup memory
useEffect(() => {

    return () => {

        images.forEach((image) => {

            if (image.preview) {

                URL.revokeObjectURL(
                    image.preview
                );
            }
        });
    };

}, [images]);

// =========================
// SUBMIT
// =========================

const handleSubmit = async (e) => {

    e.preventDefault();

    // =====================
    // VALIDATION
    // =====================

    if (!name.trim()) {

        alert("Vui lòng nhập tên sản phẩm");

        return;
    }

    if (!productCode.trim()) {

        alert("Vui lòng nhập mã sản phẩm");

        return;
    }

    if (variants.length === 0) {

        alert("Vui lòng thêm biến thể");

        return;
    }

    const invalidVariant = variants.some(
        (v) =>
            !v.variant_name.trim() ||
            !v.price ||
            !v.quantity
    );

    if (invalidVariant) {

        alert(
            "Vui lòng nhập đầy đủ thông tin biến thể"
        );

        return;
    }

    // =====================
    // PREPARE JSON DATA
    // =====================

    const productData = {

        name: name.trim(),

        product_code: productCode.trim(),

        category_id: categoryId
            ? Number(categoryId)
            : null,

        brand_id: brandId
            ? Number(brandId)
            : null,

        description: description.trim(),

        variants: variants.map((v) => ({
            variant_name: v.variant_name.trim(),
            price: Number(v.price),
            quantity: Number(v.quantity)
        })),

        // Không lưu blob URL nữa
        images: images.map((image) => image.file)
    };

    console.log(
        JSON.stringify(
            productData,
            null,
            2
        )
    );

    // =====================
    // CREATE PRODUCT
    // =====================

    try {

        await createProduct(productData);

        alert(
            "Tạo sản phẩm thành công"
        );

        navigate("/admin/products");

    } catch (err) {

        console.log(err);

        console.log(
            err.response?.data
        );

 alert(
    JSON.stringify(
        err.response?.data,
        null,
        2
    )
);
    }
};

    // =========================
    // UI
    // =========================

    return (

        <div style={{ padding: "20px" }}>

            <h1 style={{ marginBottom: "30px" }}>
                Thêm sản phẩm
            </h1>

            <form
                onSubmit={handleSubmit}
                style={formContainer}
            >

                {/* BASIC INFO */}

                <div style={cardStyle}>

                    <h2>Thông tin cơ bản</h2>

                    <input
                        type="text"
                        placeholder="Tên sản phẩm"
                        value={name}
                        onChange={(e) =>
                            setName(e.target.value)
                        }
                        style={inputStyle}
                    />

                    <input
                        type="text"
                        placeholder="Mã sản phẩm"
                        value={productCode}
                        onChange={(e) =>
                            setProductCode(
                                e.target.value
                            )
                        }
                        style={inputStyle}
                    />

                    <select
                        value={categoryId}
                        onChange={(e) =>
                            setCategoryId(
                                e.target.value
                            )
                        }
                        style={inputStyle}
                    >

                        <option value="">
                            Chọn danh mục
                        </option>

                        {categories.map((category) => (

                            <option
                                key={category.id}
                                value={category.id}
                            >
                                {"-- ".repeat(
                                    category.level
                                )}

                                {category.name}
                            </option>

                        ))}

                    </select>

                    <select
                        value={brandId}
                        onChange={(e) =>
                            setBrandId(
                                e.target.value
                            )
                        }
                        style={inputStyle}
                    >

                        <option value="">
                            Chọn hãng
                        </option>

                        {brands.map((brand) => (

                            <option
                                key={brand.id}
                                value={brand.id}
                            >
                                {brand.name}
                            </option>

                        ))}

                    </select>

                    <textarea
                        placeholder="Mô tả"
                        value={description}
                        onChange={(e) =>
                            setDescription(
                                e.target.value
                            )
                        }
                        style={textareaStyle}
                        rows="4"
                    />

                </div>

                {/* VARIANTS */}

                <div style={cardStyle}>

                    <div style={sectionHeader}>

                        <h2>Biến thể</h2>

                        <button
                            type="button"
                            onClick={addVariant}
                            style={addBtn}
                        >
                            + Thêm biến thể
                        </button>

                    </div>

                    {variants.map((variant, index) => (

                        <div
                            key={index}
                            style={variantRow}
                        >

                            <input
                                type="text"
                                placeholder="Tên biến thể"
                                value={
                                    variant.variant_name
                                }
                                onChange={(e) =>
                                    updateVariant(
                                        index,
                                        "variant_name",
                                        e.target.value
                                    )
                                }
                                style={inputStyle}
                            />

                            <input
                                type="number"
                                placeholder="Giá"
                                value={variant.price}
                                onChange={(e) =>
                                    updateVariant(
                                        index,
                                        "price",
                                        e.target.value
                                    )
                                }
                                style={inputStyle}
                            />

                            <input
                                type="number"
                                placeholder="Số lượng"
                                value={
                                    variant.quantity
                                }
                                onChange={(e) =>
                                    updateVariant(
                                        index,
                                        "quantity",
                                        e.target.value
                                    )
                                }
                                style={inputStyle}
                            />

                            <button
                                type="button"
                                onClick={() =>
                                    removeVariant(index)
                                }
                                style={removeBtn}
                            >
                                X
                            </button>

                        </div>

                    ))}

                </div>

                {/* IMAGES */}

                <div style={cardStyle}>

                    <div style={sectionHeader}>

                        <h2>Ảnh sản phẩm</h2>

                        <label style={addBtn}>

                            📸 Chọn ảnh

                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={
                                    handleImageChange
                                }
                                style={{
                                    display: "none"
                                }}
                            />

                        </label>

                    </div>

                    {images.length === 0 ? (

                        <div style={emptyImageBox}>

                            <p>
                                Chưa có ảnh nào
                            </p>

                        </div>

                    ) : (

                        <div style={imageGrid}>

                            {images.map(
                                (image, index) => (

                                <div
                                    key={index}
                                    style={imageCard}
                                >

                                    <img
                                        src={
                                            image.preview
                                        }
                                        alt="preview"
                                        style={
                                            imagePreview
                                        }
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            removeImage(
                                                index
                                            )
                                        }
                                        style={
                                            imageRemoveBtn
                                        }
                                    >
                                        ✕
                                    </button>

                                </div>

                            ))}

                        </div>

                    )}

                </div>

                {/* BUTTONS */}

                <div style={buttonGroup}>

                    <button
                        type="button"
                        onClick={() =>
                            navigate(
                                "/admin/products"
                            )
                        }
                        style={cancelBtn}
                    >
                        Hủy
                    </button>

                    <button
                        type="submit"
                        style={submitBtn}
                    >
                        Tạo sản phẩm
                    </button>

                </div>

            </form>

        </div>
    );
}



// =========================
// STYLES
// =========================

const formContainer = {
    display: "flex",
    flexDirection: "column",
    gap: "25px"
};

const cardStyle = {
    background: "white",
    padding: "25px",
    borderRadius: "20px",
    boxShadow: "0 5px 15px rgba(0,0,0,0.05)",
    display: "flex",
    flexDirection: "column",
    gap: "15px"
};

const inputStyle = {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    fontSize: "14px",
    transition: "all 0.3s",
    outline: "none"
};

const textareaStyle = {
    minHeight: "120px",
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    fontSize: "14px",
    fontFamily: "inherit",
    resize: "vertical"
};

const sectionHeader = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "10px"
};

const addBtn = {
    background: "#2563EB",
    color: "white",
    border: "none",
    padding: "10px 20px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background 0.3s"
};

const removeBtn = {
    background: "#DC2626",
    color: "white",
    border: "none",
    width: "45px",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "16px",
    fontWeight: "bold",
    transition: "background 0.3s"
};

const variantRow = {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 60px",
    gap: "10px",
    alignItems: "start"
};

const emptyImageBox = {
    textAlign: "center",
    padding: "40px",
    background: "#F9FAFB",
    borderRadius: "12px",
    border: "2px dashed #D1D5DB",
    color: "#6B7280"
};

const imageGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
    gap: "20px",
    marginTop: "10px"
};

const imageCard = {
    position: "relative",
    borderRadius: "12px",
    overflow: "hidden",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    transition: "transform 0.2s",
    background: "#F9FAFB"
};

const imagePreview = {
    width: "100%",
    height: "150px",
    objectFit: "cover",
    display: "block"
};

const imageRemoveBtn = {
    position: "absolute",
    top: "8px",
    right: "8px",
    background: "#DC2626",
    color: "white",
    border: "none",
    width: "28px",
    height: "28px",
    borderRadius: "50%",
    cursor: "pointer",
    fontSize: "14px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s"
};

const imageIndex = {
    position: "absolute",
    bottom: "8px",
    left: "8px",
    background: "rgba(0,0,0,0.6)",
    color: "white",
    padding: "2px 8px",
    borderRadius: "12px",
    fontSize: "12px"
};

const buttonGroup = {
    display: "flex",
    gap: "15px",
    justifyContent: "flex-end",
    marginTop: "10px"
};

const cancelBtn = {
    background: "#9CA3AF",
    color: "white",
    border: "none",
    padding: "14px 24px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "500",
    transition: "background 0.3s"
};

const submitBtn = {
    background: "#16A34A",
    color: "white",
    border: "none",
    padding: "14px 32px",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "14px",
    fontWeight: "600",
    transition: "background 0.3s"
};

export default ProductCreate;