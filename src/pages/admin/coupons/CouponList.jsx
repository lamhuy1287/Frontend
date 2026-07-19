import { useEffect, useState } from "react";
import "./CouponList.css";

import {
    getCoupons,
    toggleCoupon
} from "../../../services/couponService";

import { Link } from "react-router-dom";

function CouponList() {

    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    // =========================
    // FETCH COUPONS
    // =========================
    const fetchCoupons = async () => {

        try {

            setLoading(true);

            const res = await getCoupons();

            setCoupons(res.data.coupons || []);

        } catch (err) {

            console.error(
                "GET COUPONS ERROR:",
                err
            );

        } finally {

            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCoupons();
    }, []);

    // =========================
    // TOGGLE COUPON
    // =========================
    const handleToggle = async (coupon) => {

        const action = coupon.is_active
            ? "tắt"
            : "bật lại";

        const confirmAction = window.confirm(
            `Bạn có chắc muốn ${action} mã này?`
        );

        if (!confirmAction) return;

        try {

            const res = await toggleCoupon(
                coupon.id
            );

            alert(
                res.data.message ||
                "Cập nhật thành công"
            );

            fetchCoupons();

        } catch (err) {

            console.error(err);

            alert(
                err?.response?.data?.message ||
                "Không thể thay đổi trạng thái"
            );
        }
    };

    // =========================
    // COPY CODE
    // =========================
    const handleCopy = async (code) => {

        try {

            await navigator.clipboard.writeText(
                code
            );

            alert(`Đã copy mã: ${code}`);

        } catch (err) {

            console.error(err);
        }
    };

    // =========================
    // FILTER
    // =========================
    const filteredCoupons = coupons.filter(
        (coupon) =>
            coupon.code
                ?.toLowerCase()
                .includes(
                    search.toLowerCase()
                )
    );

    // =========================
    // CHECK EXPIRED
    // =========================
    const isExpired = (coupon) => {

        if (!coupon.end_at)
            return false;

        return (
            new Date(coupon.end_at) <
            new Date()
        );
    };

    // =========================
    // STATUS
    // =========================
    const getStatus = (coupon) => {

        const now = new Date();

        if (
            coupon.end_at &&
            new Date(coupon.end_at) < now
        ) {
            return {
                label: "Hết hạn",
                className: "expired"
            };
        }

        if (
            coupon.usage_limit &&
            coupon.used_count >=
            coupon.usage_limit
        ) {
            return {
                label: "Hết lượt",
                className: "used-up"
            };
        }

        if (!coupon.is_active) {

            return {
                label: "Đã tắt",
                className: "inactive"
            };
        }

        return {
            label: "Đang hoạt động",
            className: "active"
        };
    };

    return (
        <div className="coupon-list-page">

            <div className="coupon-header">

                <div>

                    <h1>
                        Quản lý mã giảm giá
                    </h1>

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

            <div className="coupon-toolbar">

                <input
                    type="text"
                    placeholder="Tìm mã giảm giá..."
                    value={search}
                    onChange={(e) =>
                        setSearch(
                            e.target.value
                        )
                    }
                />

            </div>

            <div className="coupon-table-wrapper">

                <table className="coupon-table">

                    <thead>

                        <tr>

                            <th>STT</th>

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

                        {loading ? (

                            <tr>

                                <td colSpan="8">
                                    Đang tải...
                                </td>

                            </tr>

                        ) : filteredCoupons.length === 0 ? (

                            <tr>

                                <td colSpan="8">
                                    Không có coupon
                                </td>

                            </tr>

                        ) : (

                            filteredCoupons.map(
                                (coupon, index) => {

                                    const status =
                                        getStatus(
                                            coupon
                                        );

                                    return (

                                        <tr
                                            key={
                                                coupon.id
                                            }
                                        >

                                            <td>
                                                {index + 1}
                                            </td>

                                            <td>

                                                <div className="coupon-code-box">

                                                    <span>
                                                        {
                                                            coupon.code
                                                        }
                                                    </span>

                                                    <button
                                                        onClick={() =>
                                                            handleCopy(
                                                                coupon.code
                                                            )
                                                        }
                                                    >
                                                        Copy
                                                    </button>

                                                </div>

                                            </td>

                                            <td>

                                                {coupon.discount_type ===
                                                    "percent"
                                                    ? "Phần trăm"
                                                    : "Tiền cố định"}

                                            </td>

                                            <td>

                                                {coupon.discount_type ===
                                                    "percent"
                                                    ? `${coupon.discount_value}%`
                                                    : `${Number(
                                                        coupon.discount_value
                                                    ).toLocaleString()}đ`}

                                            </td>

                                            <td>

                                                {coupon.min_order_value
                                                    ? `${Number(
                                                        coupon.min_order_value
                                                    ).toLocaleString()}đ`
                                                    : "-"}

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
                                                    className={`status-badge ${status.className}`}
                                                >
                                                    {
                                                        status.label
                                                    }
                                                </span>

                                            </td>

                                            <td>

                                                <div className="action-buttons">

                                                    {isExpired(
                                                        coupon
                                                    ) ? (

                                                        <span className="expired-action">
                                                            Đã hết hạn
                                                        </span>

                                                    ) : coupon.is_active ? (

                                                        <button
                                                            className="delete-btn"
                                                            onClick={() =>
                                                                handleToggle(
                                                                    coupon
                                                                )
                                                            }
                                                        >
                                                            Tắt
                                                        </button>

                                                    ) : (

                                                        <button
                                                            className="enable-btn"
                                                            onClick={() =>
                                                                handleToggle(
                                                                    coupon
                                                                )
                                                            }
                                                        >
                                                            Bật lại
                                                        </button>

                                                    )}

                                                </div>

                                            </td>

                                        </tr>
                                    );
                                }
                            )
                        )}

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default CouponList;