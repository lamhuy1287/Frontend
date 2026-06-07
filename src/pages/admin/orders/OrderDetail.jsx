
import {
    useEffect,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";

import {
    getAdminOrderDetail,
    adminCancelOrder
} from "../../../services/orderService";

import "./OrderDetail.css";

function OrderDetail() {

    // =========================
    // PARAMS
    // =========================

    const { id } = useParams();

    // =========================
    // STATES
    // =========================

    const [order,
        setOrder] =
        useState(null);

    const [loading,
        setLoading] =
        useState(true);

    const [cancelNote,
        setCancelNote] =
        useState("");

    const [cancelLoading,
        setCancelLoading] =
        useState(false);

    // =========================
    // EFFECT
    // =========================

    useEffect(() => {

        if (id) {

            fetchOrder();
        }

    }, [id]);

    // =========================
    // FETCH ORDER
    // =========================

    const fetchOrder =
        async () => {

            try {

                setLoading(true);

                const res =
                    await getAdminOrderDetail(id);

                console.log(
                    "ADMIN ORDER DETAIL:",
                    res
                );

                setOrder(
                    res?.data || null
                );

            } catch (error) {

                console.log(
                    "LOAD ORDER DETAIL ERROR:",
                    error
                );

            } finally {

                setLoading(false);
            }
        };

    const handleCancelOrder =
        async () => {

            if (!cancelNote.trim()) {

                alert(
                    "Vui lòng nhập lý do huỷ"
                );

                return;
            }

            try {

                setCancelLoading(true);

                await adminCancelOrder(
                    order.id,
                    cancelNote
                );

                alert(
                    "Huỷ đơn thành công"
                );

                setCancelNote("");

                fetchOrder();

            } catch (error) {

                console.log(error);

                alert(
                    error?.response?.data?.message
                    || "Huỷ đơn thất bại"
                );

            } finally {

                setCancelLoading(false);
            }
        };

    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div className="admin-order-detail-page">

                <h2>
                    Loading...
                </h2>

            </div>
        );
    }

    // =========================
    // NOT FOUND
    // =========================

    if (!order) {

        return (

            <div className="admin-order-detail-page">

                <h2>
                    Không tìm thấy đơn hàng
                </h2>

            </div>
        );
    }

    // =========================
    // RENDER
    // =========================

    return (

        <div className="admin-order-detail-page">

            {/* HEADER */}

            <div className="detail-header">

                <div>

                    <h1>
                        Đơn hàng
                        #{order.id}
                    </h1>

                    <p>
                        {
                            new Date(
                                order.created_at
                            ).toLocaleString()
                        }
                    </p>

                </div>

                <div
                    className={`status-badge ${order.status}`}
                >

                    {order.status}

                </div>

            </div>

            {/* CUSTOMER */}

            <div className="detail-card">

                <h3>
                    Thông tin khách hàng
                </h3>

                <div className="detail-grid">

                    <div>

                        <strong>
                            Họ tên:
                        </strong>

                        <p>
                            {order.customer_name}
                        </p>

                    </div>

                    <div>

                        <strong>
                            Số điện thoại:
                        </strong>

                        <p>
                            {order.phone}
                        </p>

                    </div>

                    <div>

                        <strong>
                            Địa chỉ:
                        </strong>

                        <p>
                            {order.address}
                        </p>

                    </div>

                </div>

            </div>

            {/* ORDER */}

            <div className="detail-card">

                <h3>
                    Thông tin thanh toán
                </h3>

<div className="detail-grid">

    <div>

        <strong>
            Phương thức:
        </strong>

        <p>
            {order.payment_method}
        </p>

    </div>

    <div>

        <strong>
            Thanh toán:
        </strong>

        <p>
            {order.payment_status}
        </p>

    </div>

    <div>

        <strong>
            Mã giảm giá:
        </strong>

        <p>
            {
                order.coupon_code
                    ? order.coupon_code
                    : "Không có"
            }
        </p>

    </div>

    {
        order.note && (

            <div>

                <strong>
                    Ghi chú:
                </strong>

                <p>
                    {order.note}
                </p>

            </div>

        )
    }

    {
        order.status === "cancelled"
        &&
        order.admin_note && (

            <div>

                <strong>
                    Lý do huỷ đơn:
                </strong>

                <p>
                    {order.admin_note}
                </p>

            </div>

        )
    }

</div>

            </div>

            <div className="detail-card">

                <h3>
                    Thông tin vận chuyển
                </h3>

                <div className="detail-grid">

                    <div>

                        <strong>
                            Đơn vị vận chuyển:
                        </strong>

                        <p>
                            {order.shipping_provider || "Chưa có"}
                        </p>

                    </div>

                    <div>

                        <strong>
                            Mã vận đơn:
                        </strong>

                        <p>
                            {order.tracking_code || "Chưa có"}
                        </p>

                    </div>

                </div>

            </div>

            {
                (
                    order.status === "pending"
                    ||
                    order.status === "confirmed"
                ) && (

                    <div className="detail-card cancel-block">

                        <h3>
                            Huỷ đơn hàng
                        </h3>

                        <textarea
                            value={cancelNote}
                            onChange={(e) =>
                                setCancelNote(
                                    e.target.value
                                )
                            }
                            placeholder="Nhập lý do huỷ đơn..."
                        />

                        <button
                            type="button"
                            onClick={handleCancelOrder}
                            disabled={cancelLoading}
                        >
                            {
                                cancelLoading
                                    ? "Đang huỷ..."
                                    : "Huỷ đơn"
                            }
                        </button>

                    </div>

                )
            }

            {/* TOTAL */}

<div className="total-wrapper">

    {/* SUBTOTAL */}

    <div className="total-row">

        <span>
            Tạm tính:
        </span>

        <span>

            {
                Number(
                    order.total_price
                ) +
                Number(
                    order.discount_amount || 0
                )
            }
            đ

        </span>

    </div>

    {/* DISCOUNT */}

    <div className="total-row discount-row">

        <span>
            Giảm giá:
        </span>

        <span>

            -
            {
                Number(
                    order.discount_amount || 0
                ).toLocaleString()
            }
            đ

        </span>

    </div>

    {/* FINAL */}

    <div className="total-box">

        Tổng cộng:

        <span>

            {
                Number(
                    order.total_price
                ).toLocaleString()
            }
            đ

        </span>

    </div>

</div>

        </div>

    );
}

export default OrderDetail;

