import { useState } from "react";

import "./CreateCoupon.css";

import { createCoupon } from "../../../services/couponService";

function CreateCoupon() {

    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        code: "",
        discount_type: "percent",
        discount_value: "",
        min_order_value: "",
        max_discount: "",
        usage_limit: "",
        is_one_time_per_user: false,
        start_at: "",
        end_at: "",
        is_active: true
    });

    // =========================
    // HANDLE CHANGE
    // =========================
    const handleChange = (e) => {

        const { name, value, type, checked } = e.target;

        setFormData((prev) => ({
            ...prev,
            [name]: type === "checkbox"
                ? checked
                : value
        }));
    };

    // =========================
    // SUBMIT
    // =========================
    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            setLoading(true);

            const payload = {
                ...formData,
                discount_value: Number(formData.discount_value),
                min_order_value: formData.min_order_value
                    ? Number(formData.min_order_value)
                    : null,
                max_discount: formData.max_discount
                    ? Number(formData.max_discount)
                    : null,
                usage_limit: formData.usage_limit
                    ? Number(formData.usage_limit)
                    : null,
                start_at: formData.start_at || null,
                end_at: formData.end_at || null
            };

            console.log("PAYLOAD:", payload);

            const res = await createCoupon(payload);

            console.log("CREATE COUPON RESPONSE:", res.data);

            alert("Tạo mã giảm giá thành công!");

            setFormData({
                code: "",
                discount_type: "percent",
                discount_value: "",
                min_order_value: "",
                max_discount: "",
                usage_limit: "",
                is_one_time_per_user: false,
                start_at: "",
                end_at: "",
                is_active: true
            });

        } catch (err) {

            console.error("CREATE COUPON ERROR:", err);

            alert(
                err?.response?.data?.message ||
                "Có lỗi xảy ra"
            );

        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="create-coupon">

            <div className="coupon-card">

                <h2>Tạo mã giảm giá</h2>

                <form onSubmit={handleSubmit}>

                    {/* CODE */}
                    <div className="form-group">
                        <label>Mã giảm giá</label>

                        <input
                            type="text"
                            name="code"
                            value={formData.code}
                            onChange={handleChange}
                            placeholder="VD: SUMMER2026"
                            required
                        />
                    </div>

                    {/* TYPE */}
                    <div className="form-group">
                        <label>Loại giảm giá</label>

                        <select
                            name="discount_type"
                            value={formData.discount_type}
                            onChange={handleChange}
                        >
                            <option value="percent">
                                Giảm theo %
                            </option>

                            <option value="fixed">
                                Giảm tiền cố định
                            </option>
                        </select>
                    </div>

                    {/* VALUE */}
                    <div className="form-group">
                        <label>Giá trị giảm</label>

                        <input
                            type="number"
                            name="discount_value"
                            value={formData.discount_value}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* MIN ORDER */}
                    <div className="form-group">
                        <label>Đơn tối thiểu</label>

                        <input
                            type="number"
                            name="min_order_value"
                            value={formData.min_order_value}
                            onChange={handleChange}
                        />
                    </div>

                    {/* MAX DISCOUNT */}
                    <div className="form-group">
                        <label>Giảm tối đa</label>

                        <input
                            type="number"
                            name="max_discount"
                            value={formData.max_discount}
                            onChange={handleChange}
                        />
                    </div>

                    {/* USAGE LIMIT */}
                    <div className="form-group">
                        <label>Số lượt sử dụng</label>

                        <input
                            type="number"
                            name="usage_limit"
                            value={formData.usage_limit}
                            onChange={handleChange}
                        />
                    </div>

                    {/* START */}
                    <div className="form-group">
                        <label>Ngày bắt đầu</label>

                        <input
                            type="datetime-local"
                            name="start_at"
                            value={formData.start_at}
                            onChange={handleChange}
                        />
                    </div>

                    {/* END */}
                    <div className="form-group">
                        <label>Ngày kết thúc</label>

                        <input
                            type="datetime-local"
                            name="end_at"
                            value={formData.end_at}
                            onChange={handleChange}
                        />
                    </div>

                    {/* CHECKBOX */}
                    <div className="checkbox-group">

                        <label>

                            <input
                                type="checkbox"
                                name="is_one_time_per_user"
                                checked={formData.is_one_time_per_user}
                                onChange={handleChange}
                            />

                            Mỗi user chỉ dùng 1 lần
                        </label>

                    </div>

                    <div className="checkbox-group">

                        <label>

                            <input
                                type="checkbox"
                                name="is_active"
                                checked={formData.is_active}
                                onChange={handleChange}
                            />

                            Kích hoạt
                        </label>

                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="create-btn"
                    >
                        {
                            loading
                                ? "Đang tạo..."
                                : "Tạo mã giảm giá"
                        }
                    </button>

                </form>

            </div>

        </div>
    );
}

export default CreateCoupon;