import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
    getProductDetail,
    updateProduct
} from "../../../services/productService";

import { getCategories } from "../../../services/categoryService";
import { getBrands } from "../../../services/brandService";

function ProductEdit() {

    const { id } = useParams();
    const navigate = useNavigate();

    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);

    const [form, setForm] = useState({
        name: "",
        product_code: "",
        category_id: "",
        brand_id: "",
        description: "",
        variants: [],
        images: []
    });

    // =========================
    // FETCH PRODUCT
    // =========================
    const fetchProduct = async () => {
        try {
            const res = await getProductDetail(id);
            setForm(res.data.data);
        } catch (err) {
            console.log(err);
        }
    };

    // =========================
    // FETCH FILTERS
    // =========================
    const fetchFilters = async () => {
        try {
            const categoryRes = await getCategories();
            const brandRes = await getBrands();

            setCategories(categoryRes.data);
            setBrands(brandRes.data);
        } catch (err) {
            console.log(err);
        }
    };

    // =========================
    // CHANGE HANDLER
    // =========================
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // =========================
    // VARIANT CHANGE
    // =========================
    const handleVariantChange = (index, field, value) => {
        const updated = [...form.variants];
        updated[index][field] = value;

        setForm({
            ...form,
            variants: updated
        });
    };

    // =========================
    // ADD IMAGES FROM FILE
    // =========================
    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);

        const newImages = files.map(file => ({
            image_url: URL.createObjectURL(file),
            file
        }));

        setForm({
            ...form,
            images: [...form.images, ...newImages]
        });
    };

    // =========================
    // UPDATE IMAGE URL
    // =========================
    const handleImageUrlChange = (index, value) => {
        const updated = [...form.images];
        updated[index].image_url = value;

        setForm({
            ...form,
            images: updated
        });
    };

    // =========================
    // DELETE IMAGE
    // =========================
    const handleDeleteImage = (index) => {
        const updated = [...form.images];
        updated.splice(index, 1);

        setForm({
            ...form,
            images: updated
        });
    };

    // =========================
    // SUBMIT
    // =========================
    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            await updateProduct(id, form);
            alert("Cập nhật thành công");
            navigate("/admin/products");
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchProduct();
        fetchFilters();
    }, []);

    return (
        <div>

            {/* HEADER */}
            <div style={headerStyle}>
                <h1>Chỉnh sửa sản phẩm</h1>

                <button
                    onClick={() => navigate(-1)}
                    style={backBtn}
                >
                    ← Quay lại
                </button>
            </div>

            <form onSubmit={handleSubmit} style={formStyle}>

                {/* NAME */}
                <input
                    name="name"
                    placeholder="Tên sản phẩm"
                    value={form.name}
                    onChange={handleChange}
                    style={inputStyle}
                />

                {/* CODE */}
                <input
                    name="product_code"
                    placeholder="Mã sản phẩm"
                    value={form.product_code}
                    onChange={handleChange}
                    style={inputStyle}
                />

                {/* CATEGORY */}
                <select
                    name="category_id"
                    value={form.category_id}
                    onChange={handleChange}
                    style={inputStyle}
                >
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.name}
                        </option>
                    ))}
                </select>

                {/* BRAND */}
                <select
                    name="brand_id"
                    value={form.brand_id}
                    onChange={handleChange}
                    style={inputStyle}
                >
                    <option value="">Chọn thương hiệu</option>
                    {brands.map(b => (
                        <option key={b.id} value={b.id}>
                            {b.name}
                        </option>
                    ))}
                </select>

                {/* DESCRIPTION */}
                <textarea
                    name="description"
                    placeholder="Mô tả"
                    value={form.description}
                    onChange={handleChange}
                    style={textareaStyle}
                />

                {/* VARIANTS */}
                <div>
                    <h2>Variants</h2>

                    {form.variants.map((v, index) => (
                        <div key={index} style={variantBox}>

                            <input
                                placeholder="Tên biến thể"
                                value={v.variant_name}
                                onChange={(e) =>
                                    handleVariantChange(index, "variant_name", e.target.value)
                                }
                                style={inputStyle}
                            />

                            <input
                                type="number"
                                placeholder="Giá"
                                value={v.price}
                                onChange={(e) =>
                                    handleVariantChange(index, "price", e.target.value)
                                }
                                style={inputStyle}
                            />

                            <input
                                type="number"
                                placeholder="Số lượng"
                                value={v.quantity}
                                onChange={(e) =>
                                    handleVariantChange(index, "quantity", e.target.value)
                                }
                                style={inputStyle}
                            />

                        </div>
                    ))}
                </div>

                {/* IMAGES */}
                <div>
                    <h2>Images</h2>

                    {/* UPLOAD */}
                    <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFileUpload}
                        style={inputStyle}
                    />

                    {/* IMAGE LIST */}
                    <div style={imageGrid}>
                        {form.images.map((img, index) => (
                            <div key={index} style={imageCard}>

                                <img
                                    src={img.image_url}
                                    alt=""
                                    style={imagePreview}
                                />

                                <input
                                    type="text"
                                    value={img.image_url}
                                    onChange={(e) =>
                                        handleImageUrlChange(index, e.target.value)
                                    }
                                    style={inputStyle}
                                />

                                <button
                                    type="button"
                                    onClick={() => handleDeleteImage(index)}
                                    style={deleteBtn}
                                >
                                    🗑 Xoá ảnh
                                </button>

                            </div>
                        ))}
                    </div>
                </div>

                {/* SUBMIT */}
                <button type="submit" style={submitBtn}>
                    Cập nhật sản phẩm
                </button>

            </form>
        </div>
    );
}

/* =========================
   STYLES
========================= */

const headerStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "20px"
};

const backBtn = {
    padding: "10px 14px",
    borderRadius: "10px",
    border: "1px solid #ddd",
    background: "#fff",
    cursor: "pointer"
};

const formStyle = {
    background: "white",
    padding: "25px",
    borderRadius: "20px",
    display: "flex",
    flexDirection: "column",
    gap: "20px"
};

const inputStyle = {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    width: "100%"
};

const textareaStyle = {
    padding: "14px",
    borderRadius: "12px",
    border: "1px solid #ddd",
    minHeight: "150px"
};

const variantBox = {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: "10px"
};

const imageGrid = {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
    gap: "15px"
};

const imageCard = {
    border: "1px solid #eee",
    borderRadius: "12px",
    padding: "10px",
    background: "#fafafa"
};

const imagePreview = {
    width: "100%",
    height: "140px",
    objectFit: "cover",
    borderRadius: "10px",
    marginBottom: "10px"
};

const deleteBtn = {
    marginTop: "8px",
    width: "100%",
    padding: "8px",
    borderRadius: "10px",
    border: "none",
    background: "#ef4444",
    color: "white",
    cursor: "pointer"
};

const submitBtn = {
    background: "#2563EB",
    color: "white",
    border: "none",
    padding: "14px",
    borderRadius: "12px",
    cursor: "pointer"
};

export default ProductEdit;