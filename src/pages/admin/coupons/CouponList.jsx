import { useEffect, useState } from "react";

import "./CouponList.css";

import {
    getCoupons,
    deleteCoupon
} from "../../../services/couponService";

import { Link } from "react-router-dom";

function CouponList() {

    const [coupons, setCoupons] = useState([]);

    const [loading, setLoading] = useState(true);

    const [search, setSearch] = useState("");

    // ===================================
    // FETCH COUPONS
    // ===================================
    const fetchCoupons = async () => {

        try {

            setLoading(true);

            const res = await getCoupons();

            console.log("COUPONS:", res.data);

            setCoupons(res.data.coupons || []);

        } catch (err) {

            console.error("GET COUPONS ERROR:", err);

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    // ===================================
    // DELETE
    // ===================================
    const handleDelete = async (id) => {

        const confirmDelete = window.confirm(
            "Bạn có chắc muốn vô hiệu hóa mã này?"
        );

        if (!confirmDelete) return;

        try {

            await deleteCoupon(id);

            alert("Đã vô hiệu hóa mã");

            fetchCoupons();

        } catch (err) {

            console.error("DELETE COUPON ERROR:", err);

            alert("Xóa thất bại");
        }
    };

    // ===================================
    // COPY CODE
    // ===================================
    const handleCopy = async (code) => {

        try {

            await navigator.clipboard.writeText(code);

            alert(`Đã copy mã: ${code}`);

        } catch (err) {

            console.error(err);
        }
    };

    // ===================================
    // FILTER
    // ===================================
    const filteredCoupons = coupons.filter((coupon) =>
        coupon.code
            .toLowerCase()
            .includes(search.toLowerCase())
    );

    // ===================================
    // STATUS
    // ===================================
    const getStatus = (coupon) => {

        const now = new Date();

        if (!coupon.is_active) {
            return "Đã tắt";
        }

        if (
            coupon.end_at &&
            new Date(coupon.end_at) < now
        ) {
            return "Hết hạn";
        }

        if (
            coupon.usage_limit &&
            coupon.used_count >= coupon.usage_limit
        ) {
            return "Hết lượt";
        }

        return "Đang hoạt động";
    };

    return (
        <div className="coupon-list-page">

            {/* HEADER */}
            <div className="coupon-header">

                <div>

                    <h1>Quản lý mã giảm giá</h1>

                    <p>
                        Quản lý toàn bộ coupon của shop
                    </p>

                </div>

                <Link
                    to="/admin/create-coupon"
                    className="create-coupon-btn"
                >
                    + Tạo mã
                </Link>

            </div>

            {/* SEARCH */}
            <div className="coupon-toolbar">

                <input
                    type="text"
                    placeholder="Tìm mã giảm giá..."
                    value={search}
                    onChange={(e) =>
                        setSearch(e.target.value)
                    }
                />

            </div>

            {/* TABLE */}
            <div className="coupon-table-wrapper">

                <table className="coupon-table">

                    <thead>

                        <tr>

                            <th>ID</th>

                            <th>Mã</th>

                            <th>Loại</th>

                            <th>Giảm</th>

                            <th>Đơn tối thiểu</th>

                            <th>Đã dùng</th>

                            <th>Trạng thái</th>

                            <th>Hành động</th>

                        </tr>

                    </thead>

                    <tbody>

                        {
                            loading
                                ? (
                                    <tr>
                                        <td colSpan="8">
                                            Đang tải...
                                        </td>
                                    </tr>
                                )
                                : filteredCoupons.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan="8">
                                                Không có coupon
                                            </td>
                                        </tr>
                                    )
                                    : (
                                        filteredCoupons.map((coupon) => (

                                            <tr key={coupon.id}>

                                                <td>
                                                    {coupon.id}
                                                </td>

                                                <td>

                                                    <div className="coupon-code-box">

                                                        <span>
                                                            {coupon.code}
                                                        </span>

                                                        <button
                                                            onClick={() =>
                                                                handleCopy(coupon.code)
                                                            }
                                                        >
                                                            Copy
                                                        </button>

                                                    </div>

                                                </td>

                                                <td>
                                                    {
                                                        coupon.discount_type === "percent"
                                                            ? "Phần trăm"
                                                            : "Tiền cố định"
                                                    }
                                                </td>

                                                <td>

                                                    {
                                                        coupon.discount_type === "percent"
                                                            ? `${coupon.discount_value}%`
                                                            : `${Number(coupon.discount_value).toLocaleString()}đ`
                                                    }

                                                </td>

                                                <td>
                                                    {
                                                        coupon.min_order_value
                                                            ? `${Number(coupon.min_order_value).toLocaleString()}đ`
                                                            : "-"
                                                    }
                                                </td>

                                                <td>

                                                    {
                                                        coupon.used_count || 0
                                                    }

                                                    /

                                                    {
                                                        coupon.usage_limit || "∞"
                                                    }

                                                </td>

                                                <td>

                                                    <span
                                                        className={`status-badge ${getStatus(coupon)}`}
                                                    >
                                                        {getStatus(coupon)}
                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            className="delete-btn"
                                                            onClick={() =>
                                                                handleDelete(coupon.id)
                                                            }
                                                        >
                                                            Tắt
                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>
                                        ))
                                    )
                        }

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default CouponList;