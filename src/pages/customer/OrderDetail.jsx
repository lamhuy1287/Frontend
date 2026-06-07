import {
    useEffect,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";

import CustomerLayout
    from "../../layouts/CustomerLayout";

import {
    getOrderDetail,
    cancelOrder,
    requestReturnOrder
} from "../../services/orderService";

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

    const [cancelling,
        setCancelling] =
        useState(false);

    const [returning,
        setReturning] =
        useState(false);

    // =========================
    // EFFECT
    // =========================

    useEffect(() => {

        if (id) {

            fetchOrderDetail();
        }

    }, [id]);

    // =========================
    // FETCH DETAIL
    // =========================

    const fetchOrderDetail =
        async () => {

            try {

                setLoading(true);

                const res =
                    await getOrderDetail(id);

                console.log(
                    "ORDER DETAIL:",
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

    // =========================
    // CANCEL ORDER
    // =========================

    const canCancelOrder =
        order?.status === "pending";

    const isCancelLocked =
        ["confirmed", "shipping"].includes(
            order?.status
        );

    const handleCancel = async () => {

        if (
            !window.confirm(
                "Bạn chắc chắn muốn hủy đơn?"
            )
        ) {
            return;
        }

        try {

            setCancelling(true);

            await cancelOrder(order.id);

            alert("Đã hủy đơn");

            fetchOrderDetail();

        } catch (err) {

            alert(
                err.response?.data?.message
                || "Hủy đơn thất bại"
            );

        } finally {

            setCancelling(false);
        }
    };

    const handleReturn = async () => {

        const note = window.prompt(
            "Nhập lý do hoàn hàng"
        );

        if (!note) {
            return;
        }

        try {

            setReturning(true);

            await requestReturnOrder(
                order.id,
                note
            );

            alert(
                "Đã gửi yêu cầu hoàn hàng"
            );

            fetchOrderDetail();

        } catch (err) {

            alert(
                err.response?.data?.message
                || "Gửi yêu cầu hoàn thất bại"
            );

        } finally {

            setReturning(false);
        }
    };

    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <CustomerLayout>

                <div
                    style={{
                        padding: "40px"
                    }}
                >

                    <h2>
                        Loading...
                    </h2>

                </div>

            </CustomerLayout>
        );
    }

    // =========================
    // NOT FOUND
    // =========================

    if (!order) {

        return (

            <CustomerLayout>

                <div
                    style={{
                        padding: "40px"
                    }}
                >

                    <h2>
                        Không tìm thấy đơn hàng
                    </h2>

                </div>

            </CustomerLayout>
        );
    }

    // =========================
    // RENDER
    // =========================

    const statusMap = {
        pending: "Chờ xác nhận",
        confirmed: "Đã xác nhận",
        shipping: "Đang giao",
        return_requested: "Đang yêu cầu hoàn",
        completed: "Hoàn thành",
        cancelled: "Đã hủy"
    };

    return (

        <CustomerLayout>

            <div className="order-detail-page">

                <h1>
                    Chi tiết đơn hàng
                    #{order.id}
                </h1>

                {/* CUSTOMER */}

                <div className="detail-card">

                    <h3>
                        Thông tin nhận hàng
                    </h3>

                    <p>
                        <strong>
                            Người nhận:
                        </strong>

                        {" "}
                        {order.customer_name}
                    </p>

                    <p>
                        <strong>
                            Số điện thoại:
                        </strong>

                        {" "}
                        {order.phone}
                    </p>

                    <p>
                        <strong>
                            Địa chỉ:
                        </strong>

                        {" "}
                        {order.address}
                    </p>

                </div>

                {/* ORDER INFO */}

                <div className="detail-card">

                    <h3>
                        Thông tin đơn hàng
                    </h3>

                    <p>
                        <strong>
                            Trạng thái:
                        </strong>

                        {" "}
                        {statusMap[order.status] || order.status}
                    </p>

                    {
                        order.note && (

                            <div className="cancel-note-box">

                                <p>
                                    <strong>
                                        Ghi chú khách:
                                    </strong>
                                </p>

                                <p>
                                    {order.note}
                                </p>

                            </div>

                        )
                    }

                    {
                        order.status === "return_requested"
                        &&
                        order.admin_note && (

                            <div className="cancel-note-box">

                                <p>
                                    <strong>
                                        Lý do hoàn hàng:
                                    </strong>
                                </p>

                                <p>
                                    {order.admin_note}
                                </p>

                            </div>

                        )
                    }

                    {
                        order.status === "shipping" && (

                            <button
                                type="button"
                                className="cancel-order-button"
                                onClick={handleReturn}
                                disabled={returning}
                            >
                                {
                                    returning
                                        ? "Đang gửi..."
                                        : "Yêu cầu hoàn hàng"
                                }
                            </button>

                        )
                    }

                    {
                        order.status === "cancelled"
                        &&
                        order.admin_note && (

                            <div className="cancel-note-box">

                                <p>
                                    <strong>
                                        Lý do huỷ đơn:
                                    </strong>
                                </p>

                                <p>
                                    {order.admin_note}
                                </p>

                            </div>

                        )
                    }

                    <p>
                        <strong>
                            Thanh toán:
                        </strong>

                        {" "}
                        {order.payment_method}
                    </p>



                    <p>
                        <strong>
                            Trạng thái thanh toán:
                        </strong>

                        {" "}
                        {order.payment_status}
                    </p>

                    <p>
                        <strong>
                            Đơn vị vận chuyển:
                        </strong>

                        {" "}
                        {order.shipping_provider || "Chưa có"}
                    </p>

                    <p>
                        <strong>
                            Mã vận đơn:
                        </strong>

                        {" "}
                        {order.tracking_code || "Chưa có"}
                    </p>

                </div>

                {/* ITEMS */}

                <div className="detail-card">

                    <h3>
                        Sản phẩm
                    </h3>

                    <div className="order-items">

                        {
                            order.items?.map((item) => (

                                <div
                                    className="order-item"
                                    key={item.id}
                                >

                                    <div>

                                        <h4>
                                            {item.product_name}
                                        </h4>

                                        <p>
                                            {item.variant_name}
                                        </p>

                                    </div>

                                    <div>

                                        x{item.quantity}

                                    </div>

                                    <div>

                                        {
                                            Number(item.price)
                                                .toLocaleString()
                                        }đ

                                    </div>

                                </div>

                            ))
                        }

                    </div>

                </div>

                {/* TOTAL */}

                <div className="order-total-box">

                    Tổng tiền:

                    <span>

                        {
                            Number(order.total_price)
                                .toLocaleString()
                        }đ

                    </span>

                </div>

            </div>

        </CustomerLayout>

    );
}

export default OrderDetail;

