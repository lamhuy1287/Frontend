import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    createDiscount,
    getVariantOptions,
} from "../../../services/discountService";
import "./CreateDiscount.css";

export default function CreateDiscount() {
    const navigate = useNavigate();
    const [variants, setVariants] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        product_variant_id: "",
        discount_type: "percent",
        discount_value: "",
        start_at: "",
        end_at: "",
        priority: 0,
        is_active: true,
    });

    useEffect(() => {
        fetchVariants();
    }, []);

    const fetchVariants = async () => {
        try {
            setLoading(true);
            const res = await getVariantOptions();
            setVariants(res.data.data || []);
        } catch (err) {
            setError("Lỗi tải danh sách variant");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            setError("");

            const payload = {
                ...formData,
                product_variant_id: Number(formData.product_variant_id),
                discount_value: Number(formData.discount_value),
                priority: Number(formData.priority),
                start_at: formData.start_at || null,
                end_at: formData.end_at || null,
            };

            await createDiscount(payload);
            navigate("/admin/discounts");
        } catch (err) {
            setError(err.response?.data?.message || "Lỗi tạo discount");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-discount">
            <h1>Tạo Discount</h1>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="discount-form">
                <div className="form-group">
                    <label htmlFor="product_variant_id">
                        Chọn Variant <span className="required">*</span>
                    </label>
                    <select
                        id="product_variant_id"
                        name="product_variant_id"
                        value={formData.product_variant_id}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    >
                        <option value="">-- Chọn variant --</option>
                        {variants.map((item) => (
                            <option key={item.id} value={item.id}>
                                {item.product_name} - {item.variant_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="discount_type">
                            Loại Discount <span className="required">*</span>
                        </label>
                        <select
                            id="discount_type"
                            name="discount_type"
                            value={formData.discount_type}
                            onChange={handleChange}
                            disabled={loading}
                        >
                            <option value="percent">Phần trăm (%)</option>
                            <option value="fixed">Cố định (đ)</option>
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="discount_value">
                            Giá trị Discount{" "}
                            <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="discount_value"
                            name="discount_value"
                            value={formData.discount_value}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            required
                            disabled={loading}
                            placeholder={
                                formData.discount_type === "percent"
                                    ? "Ví dụ: 10"
                                    : "Ví dụ: 50000"
                            }
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="start_at">Bắt đầu từ</label>
                        <input
                            type="datetime-local"
                            id="start_at"
                            name="start_at"
                            value={formData.start_at}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="end_at">Kết thúc lúc</label>
                        <input
                            type="datetime-local"
                            id="end_at"
                            name="end_at"
                            value={formData.end_at}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label htmlFor="priority">
                            Độ ưu tiên <span className="required">*</span>
                        </label>
                        <input
                            type="number"
                            id="priority"
                            name="priority"
                            value={formData.priority}
                            onChange={handleChange}
                            min="0"
                            disabled={loading}
                            placeholder="0"
                        />
                    </div>

                    <div className="form-group checkbox-group">
                        <label htmlFor="is_active">
                            <input
                                type="checkbox"
                                id="is_active"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                                disabled={loading}
                            />
                            Kích hoạt
                        </label>
                    </div>
                </div>

                <div className="form-actions">
                    <button
                        type="button"
                        onClick={() => navigate("/admin/discounts")}
                        disabled={loading}
                    >
                        Hủy
                    </button>
                    <button type="submit" disabled={loading}>
                        {loading ? "Đang tạo..." : "Tạo Discount"}
                    </button>
                </div>
            </form>
        </div>
    );
}
