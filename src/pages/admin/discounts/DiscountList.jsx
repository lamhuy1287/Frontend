import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
    getDiscounts,
    deleteDiscount,
    toggleDiscount,
} from "../../../services/discountService";
import "./DiscountList.css";

export default function DiscountList() {
    const navigate = useNavigate();
    const [discounts, setDiscounts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [page, setPage] = useState(1);
    const [pagination, setPagination] = useState(null);

    useEffect(() => {
        fetchDiscounts();
    }, [page]);

    const fetchDiscounts = async () => {
        try {
            setLoading(true);
            setError("");
            const res = await getDiscounts(page, 10);
            setDiscounts(res.data.data?.items || []);
            setPagination({
                total: res.data.data?.total || 0,
                current_page: res.data.data?.page || 1,
                total_pages: res.data.data?.pages || 1,
            });
        } catch (err) {
            setError("Lỗi tải danh sách discount");
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleToggle = async (id) => {
        try {
            await toggleDiscount(id);
            fetchDiscounts();
        } catch (err) {
            setError("Lỗi cập nhật trạng thái");
            console.error(err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Xoá discount này?")) {
            return;
        }

        try {
            await deleteDiscount(id);
            fetchDiscounts();
        } catch (err) {
            setError("Lỗi xoá discount");
            console.error(err);
        }
    };

    return (
        <div className="discount-list">
            <div className="list-header">
                <h1>Danh sách Discount</h1>
                <button
                    onClick={() => navigate("/admin/discounts/create")}
                    className="btn-create"
                >
                    + Tạo Discount
                </button>
            </div>

            {error && <div className="error-message">{error}</div>}

            {loading ? (
                <div className="loading">Đang tải...</div>
            ) : discounts.length === 0 ? (
                <div className="no-data">Chưa có discount nào</div>
            ) : (
                <div className="table-wrapper">
                    <table className="discount-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Variant</th>
                                <th>Loại</th>
                                <th>Giá trị</th>
                                <th>Bắt đầu</th>
                                <th>Kết thúc</th>
                                <th>Độ ưu tiên</th>
                                <th>Trạng thái</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            {discounts.map((discount) => (
                                <tr key={discount.id}>
                                    <td>{discount.id}</td>
                                    <td>
                                        <div className="variant-info">
                                            <div className="product-name">
                                                {discount.product_name}
                                            </div>
                                            <div className="variant-name">
                                                {discount.variant_name}
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <span
                                            className={`badge ${discount.discount_type}`}
                                        >
                                            {discount.discount_type ===
                                            "percent"
                                                ? "%"
                                                : "đ"}
                                        </span>
                                    </td>
                                    <td className="value">
                                        {Number(discount.discount_value).toLocaleString(
                                            "vi-VN"
                                        )}
                                    </td>
                                    <td className="date">
                                        {discount.start_at
                                            ? new Date(
                                                  discount.start_at
                                              ).toLocaleDateString(
                                                  "vi-VN"
                                              )
                                            : "-"}
                                    </td>
                                    <td className="date">
                                        {discount.end_at
                                            ? new Date(
                                                  discount.end_at
                                              ).toLocaleDateString(
                                                  "vi-VN"
                                              )
                                            : "-"}
                                    </td>
                                    <td className="priority">
                                        {discount.priority}
                                    </td>
                                    <td>
                                        <span
                                            className={`status ${discount.is_active ? "active" : "inactive"}`}
                                        >
                                            {discount.is_active
                                                ? "Hoạt động"
                                                : "Tắt"}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        <button
                                            onClick={() =>
                                                handleToggle(discount.id)
                                            }
                                            className={`btn-toggle ${discount.is_active ? "btn-deactivate" : "btn-activate"}`}
                                        >
                                            {discount.is_active
                                                ? "Tắt"
                                                : "Bật"}
                                        </button>
                                        <button
                                            onClick={() =>
                                                handleDelete(discount.id)
                                            }
                                            className="btn-delete"
                                        >
                                            Xoá
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {pagination && pagination.total_pages > 1 && (
                <div className="pagination">
                    <button
                        onClick={() => setPage(page - 1)}
                        disabled={page === 1}
                        className="btn-page"
                    >
                        Trước
                    </button>

                    {Array.from(
                        { length: pagination.total_pages },
                        (_, i) => i + 1
                    ).map((p) => (
                        <button
                            key={p}
                            onClick={() => setPage(p)}
                            className={`btn-page ${p === page ? "active" : ""}`}
                        >
                            {p}
                        </button>
                    ))}

                    <button
                        onClick={() => setPage(page + 1)}
                        disabled={page === pagination.total_pages}
                        className="btn-page"
                    >
                        Tiếp
                    </button>
                </div>
            )}
        </div>
    );
}
