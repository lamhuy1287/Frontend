
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

import {
    FaBox,
    FaUser,
    FaMoneyBillWave,
    FaTruck,
    FaTimesCircle
} from "react-icons/fa";

import "./OrderDetail.css";

function OrderDetail() {

    // =========================
    // PARAMS
    // =========================

    const { id } = useParams();

    // =========================
    // STATES
    // =========================

    const [order, setOrder] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    const [cancelNote, setCancelNote] =
        useState("");

    const [cancelLoading, setCancelLoading] =
        useState(false);

    // =========================
    // STATUS MAP
    // =========================

    const statusMap = {

        pending: {
            text: "Chờ xác nhận",
            className: "pending"
        },

        confirmed: {
            text: "Đã xác nhận",
            className: "confirmed"
        },

        shipping: {
            text: "Đang giao hàng",
            className: "shipping"
        },

        completed: {
            text: "Hoàn thành",
            className: "completed"
        },

        cancelled: {
            text: "Đã huỷ",
            className: "cancelled"
        },
        return_requested: {
    text: "Hoàn hàng",
    className: "return-requested"
},
        

    };

    const paymentStatusMap = {

        unpaid: "Chưa thanh toán",

        paid: "Đã thanh toán"

    };

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

    // =========================
    // CANCEL ORDER
    // =========================

    const handleCancelOrder =
        async () => {

            if (!cancelNote.trim()) {

                alert(
                    "Vui lòng nhập lý do huỷ đơn"
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

                <div className="loading-box">
                    Đang tải đơn hàng...
                </div>

            </div>
        );
    }

    // =========================
    // NOT FOUND
    // =========================

    if (!order) {

        return (

            <div className="admin-order-detail-page">

                <div className="loading-box">
                    Không tìm thấy đơn hàng
                </div>

            </div>
        );
    }

    // =========================
    // STATUS
    // =========================

    const currentStatus =
        statusMap[order.status]
        || {
            text: order.status,
            className: "pending"
        };

    // =========================
    // RENDER
    // =========================

    return (

        <div className="admin-order-detail-page">

            {/* HEADER */}

            <div className="detail-header">

                <div>

                    <div className="order-id">

                        <FaBox />

                        <h1>
                            Đơn hàng #{order.id}
                        </h1>

                    </div>

                    <p className="order-date">

                        {
                            new Date(
                                order.created_at
                            ).toLocaleString()
                        }

                    </p>

                </div>

                <div
                    className={`status-badge ${currentStatus.className}`}
                >

                    {currentStatus.text}

                </div>

            </div>

            {/* CUSTOMER */}

            <div className="detail-card">

                <div className="card-title">

                    <FaUser />

                    <h3>
                        Thông tin khách hàng
                    </h3>

                </div>

                <div className="detail-grid">

                    <div>

                        <span>
                            Họ tên
                        </span>

                        <p>
                            {order.customer_name}
                        </p>

                    </div>

                    <div>

                        <span>
                            Số điện thoại
                        </span>

                        <p>
                            {order.phone}
                        </p>

                    </div>

                    <div className="full-width">

                        <span>
                            Địa chỉ nhận hàng
                        </span>

                        <p>
                            {order.address}
                        </p>

                    </div>

                </div>

            </div>

            {/* PAYMENT */}

            <div className="detail-card">

                <div className="card-title">

                    <FaMoneyBillWave />

                    <h3>
                        Thanh toán
                    </h3>

                </div>

                <div className="detail-grid">

                    <div>

                        <span>
                            Phương thức
                        </span>

                        <p>
                            {order.payment_method}
                        </p>

                    </div>

                    <div>

                        <span>
                            Trạng thái
                        </span>

                        <p>
                            {
                                paymentStatusMap[
                                    order.payment_status
                                ]
                                || order.payment_status
                            }
                        </p>

                    </div>

                    <div>

                        <span>
                            Mã giảm giá
                        </span>

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

                            <div className="full-width">

                                <span>
                                    Ghi chú
                                </span>

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

                            <div className="full-width cancel-reason">

                                <span>
                                    Lý do huỷ đơn
                                </span>

                                <p>
                                    {order.admin_note}
                                </p>

                            </div>

                        )
                    }

                </div>

            </div>

            {/* SHIPPING */}

            <div className="detail-card">

                <div className="card-title">

                    <FaTruck />

                    <h3>
                        Vận chuyển
                    </h3>

                </div>

                <div className="detail-grid">

                    <div>

                        <span>
                            Đơn vị vận chuyển
                        </span>

                        <p>
                            {
                                order.shipping_provider
                                || "Chưa cập nhật"
                            }
                        </p>

                    </div>

                    <div>

                        <span>
                            Mã vận đơn
                        </span>

                        <p>
                            {
                                order.tracking_code
                                || "Chưa cập nhật"
                            }
                        </p>

                    </div>

                </div>

            </div>

            {/* PRODUCTS */}


<div className="detail-card">

    <div className="card-title">

        <FaBox />

        <h3>
            Sản phẩm đã đặt
        </h3>

    </div>

    <div className="minimal-product-list">

        {
            order.items?.map((item) => (

                <div
                    className="minimal-product-item"
                    key={item.id}
                >

                    {/* LEFT */}

                    <div className="minimal-product-left">

                        <h4>
                            {item.product_name}
                        </h4>

                        <p>
                            {
                                item.variant_name
                                || "Không có phân loại"
                            }
                        </p>

                    </div>

                    {/* CENTER */}

                    <div className="minimal-product-qty">

                        x{item.quantity}

                    </div>

                    {/* RIGHT */}

                    <div className="minimal-product-right">

                        <span className="minimal-price">

                            {
                                Number(item.price)
                                    .toLocaleString()
                            }đ

                        </span>

                        <strong>

                            {
                                (
                                    Number(item.price)
                                    * item.quantity
                                ).toLocaleString()
                            }đ

                        </strong>

                    </div>

                </div>

            ))
        }

    </div>

</div>



            {/* CANCEL */}

            {
                (
                    order.status === "pending"
                    ||
                    order.status === "confirmed"
                ) && (

                    <div className="cancel-card">

                        <div className="cancel-top">

                            <div>

                                <h3>
                                    Huỷ đơn hàng
                                </h3>

                                <p>
                                    Hành động này không thể hoàn tác
                                </p>

                            </div>

                            <FaTimesCircle />

                        </div>

                        <textarea
                            value={cancelNote}
                            onChange={(e) =>
                                setCancelNote(
                                    e.target.value
                                )
                            }
                            placeholder="Nhập lý do huỷ đơn hàng..."
                        />

                        <button
                            type="button"
                            onClick={handleCancelOrder}
                            disabled={cancelLoading}
                        >

                            {
                                cancelLoading
                                    ? "Đang xử lý..."
                                    : "Xác nhận huỷ đơn"
                            }

                        </button>

                    </div>

                )
            }

            {/* TOTAL */}

            <div className="total-wrapper">

                <div className="total-row">

                    <span>
                        Tạm tính
                    </span>

                    <span>

                        {
                            (
                                Number(order.total_price)
                                +
                                Number(order.discount_amount || 0)
                            ).toLocaleString()
                        }
                        đ

                    </span>

                </div>

                <div className="total-row discount-row">

                    <span>
                        Giảm giá
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

                <div className="total-box">

                    <span>
                        Tổng cộng
                    </span>

                    <strong>

                        {
                            Number(
                                order.total_price
                            ).toLocaleString()
                        }
                        đ

                    </strong>

                </div>

            </div>

        </div>

    );
}

export default OrderDetail;

