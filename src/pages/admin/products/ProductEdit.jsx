import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProductDetail, updateProduct } from "../../../services/productService";
import { getCategories } from "../../../services/categoryService";
import { getBrands } from "../../../services/brandService";

function ProductEdit() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [form, setForm] = useState({ name: "", product_code: "", category_id: "", brand_id: "", description: "", variants: [], images: [] });

    const fetchProduct = async () => {
        try {
            const res = await getProductDetail(id);
            setForm(res.data.data);
        } catch (err) {
            console.log(err);
        }
    };

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

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleVariantChange = (index, field, value) => {
        const updated = [...form.variants];
        updated[index][field] = value;
        setForm({ ...form, variants: updated });
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const newImages = files.map((file) => ({ preview: URL.createObjectURL(file), file, isNew: true }));
        setForm({ ...form, images: [...form.images, ...newImages] });
    };

    const handleDeleteImage = (index) => {
        const updated = [...form.images];
        updated.splice(index, 1);
        setForm({ ...form, images: updated });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append("name", form.name);
            formData.append("product_code", form.product_code);
            formData.append("category_id", form.category_id);
            formData.append("brand_id", form.brand_id);
            formData.append("description", form.description);
            formData.append("variants", JSON.stringify(form.variants));
            const oldImages = form.images.filter(img => img.image_url).map(img => ({ image_url: img.image_url }));
            formData.append("old_images", JSON.stringify(oldImages));
            form.images.forEach((img) => { if (img.file) formData.append("images", img.file); });
            await updateProduct(id, formData);
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

    const styles = {
        container: { maxWidth: 1200, margin: "0 auto", padding: 20 },
        header: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
        backBtn: { padding: "10px 14px", borderRadius: 10, border: "1px solid #ddd", background: "#fff", cursor: "pointer" },
        form: { background: "white", padding: 25, borderRadius: 20, display: "flex", flexDirection: "column", gap: 20 },
        input: { padding: 14, borderRadius: 12, border: "1px solid #ddd", width: "100%" },
        textarea: { padding: 14, borderRadius: 12, border: "1px solid #ddd", minHeight: 150 },
        variantBox: { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 },
        imageGrid: { display: "flex", gap: 20, flexWrap: "wrap" },
        imageCard: { position: "relative" },
        imagePreview: { width: 120, height: 120, objectFit: "cover", borderRadius: 10 },
        deleteBtn: { marginTop: 8, width: "100%", padding: 8, borderRadius: 10, border: "none", background: "#ef4444", color: "white", cursor: "pointer" },
        submitBtn: { background: "#2563EB", color: "white", border: "none", padding: 14, borderRadius: 12, cursor: "pointer" }
    };

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1>Chỉnh sửa sản phẩm</h1>
            </div>
            <form onSubmit={handleSubmit} style={styles.form}>
                <input name="name" placeholder="Tên sản phẩm" value={form.name} onChange={handleChange} style={styles.input} />
                <input name="product_code" placeholder="Mã sản phẩm" value={form.product_code} onChange={handleChange} style={styles.input} />
                <select name="category_id" value={form.category_id} onChange={handleChange} style={styles.input}>
                    <option value="">Chọn danh mục</option>
                    {categories.map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
                <select name="brand_id" value={form.brand_id} onChange={handleChange} style={styles.input}>
                    <option value="">Chọn thương hiệu</option>
                    {brands.map(b => (<option key={b.id} value={b.id}>{b.name}</option>))}
                </select>
                <textarea name="description" placeholder="Mô tả" value={form.description} onChange={handleChange} style={styles.textarea} />

                <div>
                    <h2>Variants</h2>
                    <div style={styles.variantBox}>
                        {form.variants.map((v, index) => (
                            <div
                                key={v.id || index}
                                style={{
                                    display: "contents"
                                }}
                            >
                                <input
                                    placeholder="Tên biến thể"
                                    value={v.variant_name || ""}
                                    onChange={(e) =>
                                        handleVariantChange(
                                            index,
                                            "variant_name",
                                            e.target.value
                                        )
                                    }
                                    style={styles.input}
                                />

                                <input
                                    type="number"
                                    placeholder="Giá"
                                    value={v.price || ""}
                                    onChange={(e) =>
                                        handleVariantChange(
                                            index,
                                            "price",
                                            e.target.value
                                        )
                                    }
                                    style={styles.input}
                                />

                                <input
                                    type="number"
                                    placeholder="Số lượng"
                                    value={v.quantity || ""}
                                    onChange={(e) =>
                                        handleVariantChange(
                                            index,
                                            "quantity",
                                            e.target.value
                                        )
                                    }
                                    style={styles.input}
                                />
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h2>Images</h2>
                    <input type="file" multiple accept="image/*" onChange={handleFileUpload} style={styles.input} />
                    <div style={styles.imageGrid}>
                        {form.images.map((img, index) => (
                            <div key={index} style={styles.imageCard}>
                                <img src={img.preview || img.image_url} alt="" style={styles.imagePreview} />
                                <button type="button" onClick={() => handleDeleteImage(index)} style={styles.deleteBtn}>Xoá</button>
                            </div>
                        ))}
                    </div>
                </div>
                <button type="submit" style={styles.submitBtn}>Cập nhật sản phẩm</button>
            </form>
        </div>
    );
}

export default ProductEdit;