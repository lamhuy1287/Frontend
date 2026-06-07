import "./MyOrders.css";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    FaBoxOpen
} from "react-icons/fa";

import CustomerLayout
    from "../../../layouts/CustomerLayout";

import {
    getMyOrders,
    cancelOrder  
} from "../../../services/orderService";
import socket from "../../../socket";

function MyOrders() {

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [cancellingId, setCancellingId] = 
        useState(null);

    const fetchOrders = async () => {

        try {

            const response =
                await getMyOrders();

            console.log(response);

            setOrders(response.data);

        } catch (error) {

            console.log(
                "LOAD MY ORDERS ERROR:",
                error
            );

        } finally {

            setLoading(false);
        }
    };



    const canCancelOrder = (orderStatus) => {
        return orderStatus === "pending";
    };

    const isCancelLocked = (orderStatus) => {
        return ["confirmed", "shipping"].includes(orderStatus);
    };

    const handleCancel = async (orderId, orderStatus) => {

        // Kiểm tra có thể hủy không
        if (!canCancelOrder(orderStatus)) {
            if (isCancelLocked(orderStatus)) {
                alert("Đơn hàng đã được shop xử lý, không thể hủy ở trạng thái này.");
            } else {
                alert("Đơn hàng không thể hủy ở trạng thái hiện tại.");
            }
            return;
        }

        // Xác nhận hủy đơn
        if (
            !window.confirm(
                "Bạn chắc chắn muốn hủy đơn hàng này?"
            )
        ) {
            return;
        }

        try {

            setCancellingId(orderId); // Đánh dấu đơn hàng đang được hủy

            await cancelOrder(orderId);

            alert("Đã hủy đơn thành công");

            // Refresh lại danh sách đơn hàng
            await fetchOrders();

        } catch (err) {

            alert(
                err.response?.data?.message
                || "Hủy đơn thất bại"
            );

        } finally {

            setCancellingId(null); // Xóa trạng thái đang hủy
        }
    };

    useEffect(() => {

        fetchOrders();

    }, []);
    useEffect(() => {

    const handleOrderUpdate = (data) => {

        console.log(
            "SOCKET order_updated:",
            data
        );

        setOrders((prevOrders) => {

            return prevOrders.map((order) => {

                if (
                    Number(order.id)
                    === Number(data.order_id)
                ) {

                    return {
                        ...order,
                        status: data.status
                    };
                }

                return order;
            });
        });
    };

    socket.on(
        "order_updated",
        handleOrderUpdate
    );

    return () => {

        socket.off(
            "order_updated",
            handleOrderUpdate
        );
    };

}, []);
    const formatPrice = (price) => {

        return Number(price)
            .toLocaleString("vi-VN") + "đ";
    };

    const getStatusClass = (status) => {

        switch (status) {

            case "pending":
                return "status pending";

            case "confirmed":
                return "status confirmed";

            case "shipping":
                return "status shipping";

            case "completed":
                return "status completed";

            case "cancelled":
                return "status cancelled";

            default:
                return "status";
        }
    };
    const getStatusText = (status) => {
        const statusMap = {
            "pending": "Chờ xác nhận",
            "confirmed": "Đã xác nhận",
            "shipping": "Đang giao hàng",
            "completed": "Hoàn thành",
            "cancelled": "Đã hủy",
            "return_requested": "Yêu cầu hoàn hàng"
        };
        return statusMap[status] || status;
    };
    if (loading) {

        return (

            <CustomerLayout>

                <div className="my-orders-loading">

                    Đang tải đơn hàng...

                </div>

            </CustomerLayout>
        );
    }

    return (

        <CustomerLayout>

            <div className="my-orders-page">

                {/* HEADER */}

                <div className="my-orders-header">

                    <h1>
                        Đơn hàng của tôi
                    </h1>

                    <p>
                        Theo dõi đơn hàng của bạn
                    </p>

                </div>

                {/* EMPTY */}

                {
                    orders.length === 0 && (

                        <div className="empty-orders">

                            <FaBoxOpen />

                            <h3>
                                Chưa có đơn hàng nào
                            </h3>

                            <p>
                                Hãy mua sắm ngay hôm nay
                            </p>

                            <Link
                                to="/products"
                                className="shop-btn"
                            >
                                Mua sắm ngay
                            </Link>

                        </div>
                    )
                }

                {/* ORDER LIST */}

                <div className="orders-list">

                    {
                        orders.map((order, index) => (

                            <div
                                className="order-card"
                                key={order.id}
                            >

                                {/* TOP */}

                                <div className="order-top">

                                    <div>

                                        <h3>
                                            Đơn hàng #{index + 1}
                                        </h3>

                                        <span>
                                            {
                                                new Date(
                                                    order.created_at
                                                ).toLocaleDateString(
                                                    "vi-VN"
                                                )
                                            }
                                        </span>

                                    </div>

                                    <div
                                        className={
                                            getStatusClass(
                                                order.status
                                            )
                                        }
                                    >
                                        {getStatusText(order.status)}
                                    </div>

                                </div>

                                {/* BODY */}

                                <div className="order-body">

                                    <div>

                                        <p>
                                            Phương thức thanh toán
                                        </p>

                                        <strong>
                                            {
                                                order.payment_method
                                            }
                                        </strong>

                                    </div>

                                    <div>

                                        <p>
                                            Tổng tiền
                                        </p>

                                        <strong className="price">

                                            {
                                                formatPrice(
                                                    order.total_price
                                                )
                                            }

                                        </strong>

                                    </div>

                                </div>

                                {/* FOOTER - Thêm nút hủy đơn hàng */}

                                <div className="order-footer">

                                    <Link
                                        to={`/my-orders/${order.id}`}
                                        className="view-detail-btn"
                                    >

                                        Xem chi tiết

                                    </Link>

                                    {/* Nút hủy đơn hàng - chỉ hiển thị khi trạng thái là pending */}
                                    {order.status === "pending" && (
                                        <button
                                            className="cancel-order-btn"
                                            onClick={() => handleCancel(order.id, order.status)}
                                            disabled={cancellingId === order.id}
                                        >
                                            {cancellingId === order.id ? "Đang hủy..." : "Hủy đơn"}
                                        </button>
                                    )}

                                </div>


                            </div>
                        ))
                    }

                </div>

            </div>

        </CustomerLayout>
    );
}

export default MyOrders;