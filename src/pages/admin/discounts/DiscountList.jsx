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

    // Tự tính toán trạng thái dựa trên thời gian
    const isCurrentlyActive = (discount) => {
        if (!discount.is_active) return false;
        
        const now = new Date();
        const startAt = discount.start_at ? new Date(discount.start_at) : null;
        const endAt = discount.end_at ? new Date(discount.end_at) : null;
        
        // Nếu không có thời gian bắt đầu/kết thúc, coi như luôn hoạt động
        if (!startAt && !endAt) return true;
        
        // Kiểm tra thời gian bắt đầu
        if (startAt && now < startAt) return false;
        
        // Kiểm tra thời gian kết thúc
        if (endAt && now > endAt) return false;
        
        return true;
    };

    const getStatusDisplay = (discount) => {
        if (!discount.is_active) return "Vô hiệu hóa";
        
        const currentlyActive = isCurrentlyActive(discount);
        if (currentlyActive) return "Đang hoạt động";
        return "Đã hết hạn";
    };

    const getStatusClass = (discount) => {
        if (!discount.is_active) return "inactive";
        
        const currentlyActive = isCurrentlyActive(discount);
        if (currentlyActive) return "active";
        return "expired";
    };

    // Kiểm tra discount đã hết hạn chưa
    const isExpired = (discount) => {
        if (!discount.is_active) return true;
        
        const now = new Date();
        const endAt = discount.end_at ? new Date(discount.end_at) : null;
        
        // Nếu có thời gian kết thúc và đã qua thời gian kết thúc
        if (endAt && now > endAt) return true;
        
        return false;
    };

    // Tính STT
    const getRowNumber = (index) => {
        return (page - 1) * 10 + index + 1;
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
                                <th>STT</th>
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
                            {discounts.map((discount, index) => (
                                <tr key={discount.id}>
                                    <td>{getRowNumber(index)}</td>
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
                                            {discount.discount_type === "percent" ? "%" : "đ"}
                                        </span>
                                    </td>
                                    <td className="value">
                                        {Number(discount.discount_value).toLocaleString("vi-VN")}
                                    </td>
                                    <td className="date">
                                        {discount.start_at
                                            ? new Date(discount.start_at).toLocaleDateString("vi-VN")
                                            : "-"}
                                    </td>
                                    <td className="date">
                                        {discount.end_at
                                            ? new Date(discount.end_at).toLocaleDateString("vi-VN")
                                            : "-"}
                                    </td>
                                    <td className="priority">
                                        {discount.priority}
                                    </td>
                                    <td>
                                        <span className={`status ${getStatusClass(discount)}`}>
                                            {getStatusDisplay(discount)}
                                        </span>
                                    </td>
                                    <td className="actions">
                                        {/* Chỉ hiển thị nút Tắt/Bật khi discount chưa hết hạn */}
                                        {!isExpired(discount) && (
                                            <button
                                                onClick={() => handleToggle(discount.id)}
                                                className={`btn-toggle ${discount.is_active ? "btn-deactivate" : "btn-activate"}`}
                                            >
                                                {discount.is_active ? "Tắt" : "Bật"}
                                            </button>
                                        )}
                                        
                                        {/* Luôn hiển thị nút Xoá */}
                                        <button
                                            onClick={() => handleDelete(discount.id)}
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

                    {Array.from({ length: pagination.total_pages }, (_, i) => i + 1).map((p) => (
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