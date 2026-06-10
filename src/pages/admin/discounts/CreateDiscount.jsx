import { useEffect, useState } from "react";

import { useNavigate } from "react-router-dom";

import {

    createDiscount,

    getParentCategories,

    getChildCategories,

    getProductsByCategory,

    getVariantsByProduct,

} from "../../../services/discountService";

import "./CreateDiscount.css";

export default function CreateDiscount() {

    const navigate = useNavigate();

    // =========================
    // STATES
    // =========================

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");

    const [parentCategories, setParentCategories] =
        useState([]);

    const [childCategories, setChildCategories] =
        useState([]);

    const [products, setProducts] =
        useState([]);

    const [variants, setVariants] =
        useState([]);

    // =========================
    // FORM DATA (THÊM discount_level)
    // =========================

    const [formData, setFormData] = useState({

        discount_level: "variant", // THÊM: variant, product, category

        parent_category_id: "",

        child_category_id: "",

        product_id: "",

        product_variant_id: "",

        discount_type: "percent",

        discount_value: "",

        start_at: "",

        end_at: "",

        priority: 0,

        is_active: true,
    });

    // =========================
    // FETCH PARENT CATEGORY
    // =========================

    useEffect(() => {

        fetchParentCategories();

    }, []);

    const fetchParentCategories = async () => {

        try {

            setLoading(true);

            const res =
                await getParentCategories();

            setParentCategories(
                res.data.data || []
            );

        } catch (err) {

            console.error(err);

            setError(
                "Không thể tải danh mục cha"
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // HANDLE CHANGE
    // =========================

    const handleChange = async (e) => {

        const {

            name,

            value,

            type,

            checked

        } = e.target;

        const newValue =
            type === "checkbox"
                ? checked
                : value;

        setFormData((prev) => ({

            ...prev,

            [name]: newValue,
        }));

        // =========================
        // DISCOUNT LEVEL - RESET ALL
        // =========================

        if (name === "discount_level") {

            setFormData((prev) => ({

                ...prev,

                discount_level: value,

                parent_category_id: "",

                child_category_id: "",

                product_id: "",

                product_variant_id: "",
            }));

            setChildCategories([]);

            setProducts([]);

            setVariants([]);

            return;
        }

        // =========================
        // PARENT CATEGORY
        // =========================

        if (name === "parent_category_id") {

            setFormData((prev) => ({

                ...prev,

                parent_category_id: value,

                child_category_id: "",

                product_id: "",

                product_variant_id: "",
            }));

            setChildCategories([]);

            setProducts([]);

            setVariants([]);

            if (value) {

                try {

                    const res =
                        await getChildCategories(value);

                    setChildCategories(
                        res.data.data || []
                    );

                } catch (err) {

                    console.error(err);
                }
            }
        }

        // =========================
        // CHILD CATEGORY
        // =========================

        if (name === "child_category_id") {

            setFormData((prev) => ({

                ...prev,

                child_category_id: value,

                product_id: "",

                product_variant_id: "",
            }));

            setProducts([]);

            setVariants([]);

            if (value) {

                try {

                    const res =
                        await getProductsByCategory(value);

                    setProducts(
                        res.data.data || []
                    );

                } catch (err) {

                    console.error(err);
                }
            }
        }

        // =========================
        // PRODUCT
        // =========================

        if (name === "product_id") {

            setFormData((prev) => ({

                ...prev,

                product_id: value,

                product_variant_id: "",
            }));

            setVariants([]);

            if (value) {

                try {

                    const res =
                        await getVariantsByProduct(value);

                    setVariants(
                        res.data.data || []
                    );

                } catch (err) {

                    console.error(err);
                }
            }
        }
    };

    // =========================
    // SUBMIT - TẠO PAYLOAD THEO LEVEL
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            setError("");

            let payload = {};

            const discountLevel = formData.discount_level;

            // =========================
            // CASE 1: VARIANT LEVEL
            // =========================

            if (discountLevel === "variant") {

                if (!formData.product_variant_id) {

                    setError("Vui lòng chọn biến thể sản phẩm");

                    setLoading(false);

                    return;
                }

                payload = {

                    discount_level: "variant",

                    product_variant_id:
                        Number(formData.product_variant_id),

                    discount_type: formData.discount_type,

                    discount_value:
                        Number(formData.discount_value),

                    priority: Number(formData.priority),

                    start_at: formData.start_at || null,

                    end_at: formData.end_at || null,

                    is_active: formData.is_active,
                };
            }

            // =========================
            // CASE 2: PRODUCT LEVEL (ALL VARIANTS)
            // =========================

            else if (discountLevel === "product") {

                if (!formData.product_id) {

                    setError("Vui lòng chọn sản phẩm");

                    setLoading(false);

                    return;
                }

                payload = {

                    discount_level: "product",

                    product_id: Number(formData.product_id),

                    discount_type: formData.discount_type,

                    discount_value:
                        Number(formData.discount_value),

                    priority: Number(formData.priority),

                    start_at: formData.start_at || null,

                    end_at: formData.end_at || null,

                    is_active: formData.is_active,

                    apply_to_all_variants: true,
                };
            }

            // =========================
            // CASE 3: CATEGORY LEVEL (ALL PRODUCTS IN CATEGORY)
            // =========================

            else if (discountLevel === "category") {

                const categoryId =
                    formData.child_category_id ||
                    formData.parent_category_id;

                if (!categoryId) {

                    setError("Vui lòng chọn danh mục");

                    setLoading(false);

                    return;
                }

                payload = {

                    discount_level: "category",

                    category_id: Number(categoryId),

                    discount_type: formData.discount_type,

                    discount_value:
                        Number(formData.discount_value),

                    priority: Number(formData.priority),

                    start_at: formData.start_at || null,

                    end_at: formData.end_at || null,

                    is_active: formData.is_active,

                    apply_to_all_products: true,
                };
            }

            await createDiscount(payload);

            navigate("/admin/discounts");

        } catch (err) {

            console.error(err);

            setError(

                err.response?.data?.message ||

                "Lỗi tạo discount"
            );

        } finally {

            setLoading(false);
        }
    };

    // =========================
    // RENDER FORM THEO LEVEL
    // =========================

    const renderLevelSpecificFields = () => {

        const { discount_level } = formData;

        // =========================
        // VARIANT LEVEL - HIỂN THỊ TẤT CẢ SELECT
        // =========================

        if (discount_level === "variant") {

            return (

                <>

                    {/* CATEGORY PARENT */}

                    <div className="form-group">

                        <label>
                            Danh mục cha
                        </label>

                        <select

                            name="parent_category_id"

                            value={
                                formData.parent_category_id
                            }

                            onChange={handleChange}
                        >

                            <option value="">
                                -- Chọn danh mục cha --
                            </option>

                            {
                                parentCategories.map((item) => (

                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </option>
                                ))
                            }

                        </select>

                    </div>

                    {/* CATEGORY CHILD */}

                    <div className="form-group">

                        <label>
                            Danh mục con
                        </label>

                        <select

                            name="child_category_id"

                            value={
                                formData.child_category_id
                            }

                            onChange={handleChange}

                            disabled={
                                !formData.parent_category_id
                            }
                        >

                            <option value="">
                                -- Chọn danh mục con --
                            </option>

                            {
                                childCategories.map((item) => (

                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </option>
                                ))
                            }

                        </select>

                    </div>

                    {/* PRODUCT */}

                    <div className="form-group">

                        <label>
                            Sản phẩm
                        </label>

                        <select

                            name="product_id"

                            value={formData.product_id}

                            onChange={handleChange}

                            disabled={
                                !formData.child_category_id
                            }
                        >

                            <option value="">
                                -- Chọn sản phẩm --
                            </option>

                            {
                                products.map((item) => (

                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </option>
                                ))
                            }

                        </select>

                    </div>

                    {/* VARIANT */}

                    <div className="form-group">

                        <label>
                            Biến thể sản phẩm
                        </label>

                        <select

                            name="product_variant_id"

                            value={
                                formData.product_variant_id
                            }

                            onChange={handleChange}

                            required

                            disabled={
                                !formData.product_id
                            }
                        >

                            <option value="">
                                -- Chọn biến thể --
                            </option>

                            {
                                variants.map((item) => (

                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.variant_name}
                                    </option>
                                ))
                            }

                        </select>

                    </div>
                </>
            );
        }

        // =========================
        // PRODUCT LEVEL - CHỈ CẦN CHỌN SẢN PHẨM
        // =========================

        if (discount_level === "product") {

            return (

                <>

                    {/* CATEGORY PARENT */}

                    <div className="form-group">

                        <label>
                            Danh mục cha
                        </label>

                        <select

                            name="parent_category_id"

                            value={
                                formData.parent_category_id
                            }

                            onChange={handleChange}
                        >

                            <option value="">
                                -- Chọn danh mục cha --
                            </option>

                            {
                                parentCategories.map((item) => (

                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </option>
                                ))
                            }

                        </select>

                    </div>

                    {/* CATEGORY CHILD */}

                    <div className="form-group">

                        <label>
                            Danh mục con
                        </label>

                        <select

                            name="child_category_id"

                            value={
                                formData.child_category_id
                            }

                            onChange={handleChange}

                            disabled={
                                !formData.parent_category_id
                            }
                        >

                            <option value="">
                                -- Chọn danh mục con --
                            </option>

                            {
                                childCategories.map((item) => (

                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </option>
                                ))
                            }

                        </select>

                    </div>

                    {/* PRODUCT */}

                    <div className="form-group">

                        <label>
                            Sản phẩm (giảm giá cho TẤT CẢ biến thể)
                        </label>

                        <select

                            name="product_id"

                            value={formData.product_id}

                            onChange={handleChange}

                            required

                            disabled={
                                !formData.child_category_id
                            }
                        >

                            <option value="">
                                -- Chọn sản phẩm --
                            </option>

                            {
                                products.map((item) => (

                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </option>
                                ))
                            }

                        </select>

                    </div>

                    {/* INFO MESSAGE */}

                    <div className="info-message">

                        <small>
                            ✅ Giảm giá sẽ áp dụng cho TẤT CẢ biến thể của sản phẩm này
                        </small>

                    </div>
                </>
            );
        }

        // =========================
        // CATEGORY LEVEL - CHỈ CẦN CHỌN DANH MỤC
        // =========================

        if (discount_level === "category") {

            return (

                <>

                    {/* CATEGORY PARENT */}

                    <div className="form-group">

                        <label>
                            Danh mục cha
                        </label>

                        <select

                            name="parent_category_id"

                            value={
                                formData.parent_category_id
                            }

                            onChange={handleChange}
                        >

                            <option value="">
                                -- Chọn danh mục cha --
                            </option>

                            {
                                parentCategories.map((item) => (

                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </option>
                                ))
                            }

                        </select>

                    </div>

                    {/* CATEGORY CHILD */}

                    <div className="form-group">

                        <label>
                            Danh mục con (giảm giá cho toàn bộ)
                        </label>

                        <select

                            name="child_category_id"

                            value={
                                formData.child_category_id
                            }

                            onChange={handleChange}

                            required

                            disabled={
                                !formData.parent_category_id
                            }
                        >

                            <option value="">
                                -- Chọn danh mục con --
                            </option>

                            {
                                childCategories.map((item) => (

                                    <option
                                        key={item.id}
                                        value={item.id}
                                    >
                                        {item.name}
                                    </option>
                                ))
                            }

                        </select>

                    </div>

                    {/* INFO MESSAGE */}

                    <div className="info-message">

                        <small>
                            ✅ Giảm giá sẽ áp dụng cho TẤT CẢ sản phẩm trong danh mục này
                        </small>

                    </div>
                </>
            );
        }

        return null;
    };

    return (

        <div className="create-discount">

            {/* HEADER */}

            <div className="discount-header">

                <div>

                    <h1>
                        Tạo Discount
                    </h1>

                    <p>
                        Tạo chương trình giảm giá
                        cho sản phẩm
                    </p>

                </div>

            </div>

            {/* ERROR */}

            {
                error && (

                    <div className="error-message">

                        {error}

                    </div>
                )
            }

            {/* FORM */}

            <form
                onSubmit={handleSubmit}
                className="discount-form"
            >

                {/* ========================= ✅ THÊM MỚI: CẤP ĐỘ GIẢM GIÁ ========================= */}

                <div className="form-group">

                    <label>
                        Cấp độ giảm giá
                    </label>

                    <select

                        name="discount_level"

                        value={formData.discount_level}

                        onChange={handleChange}
                    >

                        <option value="variant">
                             Một biến thể cụ thể
                        </option>

                        <option value="product">
                             Tất cả biến thể của một sản phẩm
                        </option>

                        <option value="category">
                             Toàn bộ sản phẩm trong danh mục
                        </option>

                    </select>

                </div>

                {/* RENDER FIELD THEO CẤP ĐỘ */}

                {renderLevelSpecificFields()}

                {/* DISCOUNT */}

                <div className="form-row">

                    <div className="form-group">

                        <label>
                            Loại discount
                        </label>

                        <select

                            name="discount_type"

                            value={
                                formData.discount_type
                            }

                            onChange={handleChange}
                        >

                            <option value="percent">
                                Phần trăm (%)
                            </option>

                            <option value="fixed">
                                Cố định (VNĐ)
                            </option>

                        </select>

                    </div>

                    <div className="form-group">

                        <label>
                            Giá trị giảm
                        </label>

                        <input

                            type="number"

                            name="discount_value"

                            value={
                                formData.discount_value
                            }

                            onChange={handleChange}

                            min="0"

                            required

                            placeholder={
                                formData.discount_type ===
                                "percent"

                                    ? "Ví dụ: 10"

                                    : "Ví dụ: 50000"
                            }
                        />

                    </div>

                </div>

                {/* DATE */}

                <div className="form-row">

                    <div className="form-group">

                        <label>
                            Bắt đầu
                        </label>

                        <input

                            type="datetime-local"

                            name="start_at"

                            value={formData.start_at}

                            onChange={handleChange}
                        />

                    </div>

                    <div className="form-group">

                        <label>
                            Kết thúc
                        </label>

                        <input

                            type="datetime-local"

                            name="end_at"

                            value={formData.end_at}

                            onChange={handleChange}
                        />

                    </div>

                </div>

                {/* PRIORITY */}

                <div className="form-row">

                    <div className="form-group">

                        <label>
                            Độ ưu tiên
                        </label>

                        <input

                            type="number"

                            name="priority"

                            value={formData.priority}

                            onChange={handleChange}

                            min="0"
                        />

                    </div>

                    <div className="form-group checkbox-group">

                        <label className="checkbox-label">

                            <input

                                type="checkbox"

                                name="is_active"

                                checked={
                                    formData.is_active
                                }

                                onChange={handleChange}
                            />

                            Kích hoạt

                        </label>

                    </div>

                </div>

                {/* ACTIONS */}

                <div className="form-actions">

                    <button

                        type="button"

                        className="btn-cancel"

                        onClick={() =>
                            navigate(
                                "/admin/discounts"
                            )
                        }
                    >
                        Hủy
                    </button>

                    <button

                        type="submit"

                        className="btn-submit"

                        disabled={loading}
                    >

                        {
                            loading
                                ? "Đang tạo..."
                                : "Tạo Discount"
                        }

                    </button>

                </div>

            </form>

        </div>
    );
}