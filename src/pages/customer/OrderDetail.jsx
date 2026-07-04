// pages/customer/OrderDetail.jsx
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CustomerLayout from "../../layouts/CustomerLayout";
import socket from "../../socket";

import {
    getOrderDetail,
    cancelOrder,
    requestReturnOrder
} from "../../services/orderService";

import Swal from "sweetalert2";
import "./OrderDetail.css";

function OrderDetail() {

    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const [cancelling, setCancelling] = useState(false);
    const [returning, setReturning] = useState(false);

    const statusMap = {
        pending: "Chờ xác nhận",
        confirmed: "Đã xác nhận",
        shipping: "Đang giao",
        return_requested: "Yêu cầu hoàn",
        returned: "Đã hoàn hàng",
        completed: "Hoàn thành",
        cancelled: "Đã huỷ"
    };

    const paymentStatusMap = {
        pending: "Chờ thanh toán",
        paid: "Đã thanh toán",
        failed: "Thanh toán thất bại"
    };

    useEffect(() => {
        if (id) fetchOrderDetail();
    }, [id]);

    useEffect(() => {
        if (!id) return;

        const handleOrderUpdate = (data) => {
            if (Number(data.order_id) !== Number(id)) {
                return;
            }

            setOrder((prev) =>
                prev
                    ? {
                        ...prev,
                        ...data,
                        status: data.status || data.order_status || prev.status,
                        payment_status: data.payment_status || prev.payment_status
                    }
                    : prev
            );
        };

        socket.on("order_updated", handleOrderUpdate);

        return () => {
            socket.off("order_updated", handleOrderUpdate);
        };
    }, [id]);

    const fetchOrderDetail = async () => {
        try {
            setLoading(true);

            const res = await getOrderDetail(id);
            setOrder(res?.data || null);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // CANCEL ORDER
    // =========================
    const handleCancel = async () => {
        // Xác nhận hủy đơn
        const result = await Swal.fire({
            title: 'Xác nhận hủy đơn',
            text: 'Bạn có chắc chắn muốn hủy đơn hàng này không?',
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#3085d6',
            confirmButtonText: 'Hủy đơn',
            cancelButtonText: 'Quay lại'
        });

        if (!result.isConfirmed) return;

        try {
            setCancelling(true);

            await cancelOrder(order.id);

            await Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Đã hủy đơn hàng thành công!',
                timer: 2000,
                showConfirmButton: false
            });

            fetchOrderDetail();

        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Thất bại!',
                text: err.response?.data?.message || 'Hủy đơn hàng thất bại. Vui lòng thử lại sau.',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Đóng'
            });
        } finally {
            setCancelling(false);
        }
    };

    // =========================
    // SUBMIT RETURN
    // =========================
    const submitReturn = async () => {
        // Hiển thị form nhập lý do hoàn hàng
        const { value: returnNote } = await Swal.fire({
            title: 'Yêu cầu hoàn hàng',
            html: `
                <div class="swal-form">
                    <label for="return_note" style="display:block;text-align:left;margin-bottom:8px;font-weight:500;">Lý do hoàn hàng</label>
                    <textarea id="return_note" class="swal2-textarea" placeholder="Nhập lý do yêu cầu hoàn hàng..." rows="4"></textarea>
                </div>
            `,
            showCancelButton: true,
            confirmButtonText: 'Xác nhận hoàn hàng',
            cancelButtonText: 'Huỷ bỏ',
            focusConfirm: false,
            preConfirm: () => {
                const note = document.getElementById('return_note').value;
                if (!note.trim()) {
                    Swal.showValidationMessage('Vui lòng nhập lý do hoàn hàng');
                }
                return note;
            }
        });

        if (!returnNote) return;

        try {
            setReturning(true);

            await requestReturnOrder(order.id, returnNote);

            await Swal.fire({
                icon: 'success',
                title: 'Thành công!',
                text: 'Yêu cầu hoàn hàng đã được gửi thành công!',
                timer: 2000,
                showConfirmButton: false
            });

            fetchOrderDetail();

        } catch (err) {
            await Swal.fire({
                icon: 'error',
                title: 'Thất bại!',
                text: err.response?.data?.message || 'Gửi yêu cầu hoàn hàng thất bại. Vui lòng thử lại sau.',
                confirmButtonColor: '#3085d6',
                confirmButtonText: 'Đóng'
            });
        } finally {
            setReturning(false);
        }
    };

    // =========================
    // GET PAYMENT STATUS TEXT
    // =========================
    const getPaymentStatusText = () => {
        // Nếu đơn hàng ở trạng thái hoàn hàng, luôn hiển thị là "Thất bại"
        if (order.status === "return_requested" || order.status === "returned") {
            return "Thanh toán thất bại";
        }
        return paymentStatusMap[order.payment_status] || order.payment_status;
    };

    // =========================
    // GET PAYMENT STATUS CLASS
    // =========================
    const getPaymentStatusClass = () => {
        // Nếu đơn hàng ở trạng thái hoàn hàng, luôn là "failed"
        if (order.status === "return_requested" || order.status === "returned") {
            return "payment-status-failed";
        }
        
        switch (order.payment_status) {
            case "paid":
                return "payment-status-paid";
            case "pending":
            case "unpaid":
                return "payment-status-pending";
            case "failed":
                return "payment-status-failed";
            default:
                return "payment-status-pending";
        }
    };

    if (loading) {
        return (
            <CustomerLayout>
                <div className="order-loading">Đang tải...</div>
            </CustomerLayout>
        );
    }

    if (!order) {
        return (
            <CustomerLayout>
                <div className="order-loading">Không tìm thấy đơn hàng</div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>

            <div className="order-detail-wrapper">

                {/* HEADER */}
                <div className="order-header">
                    <div>
                        <h1>Đơn hàng của bạn</h1>
                        <p>Theo dõi trạng thái đơn hàng</p>
                    </div>

                    <div className={`order-status-badge ${order.status}`}>
                        {statusMap[order.status]}
                    </div>
                </div>

                {/* INFO */}
                <div className="order-info-grid">

                    <div className="order-card">
                        <h3>Thông tin nhận hàng</h3>
                        <div className="info-list">
                            <div>
                                <span>Người nhận</span>
                                <strong>{order.customer_name}</strong>
                            </div>
                            <div>
                                <span>SĐT</span>
                                <strong>{order.phone}</strong>
                            </div>
                            <div>
                                <span>Địa chỉ</span>
                                <strong>{order.address}</strong>
                            </div>
                        </div>
                    </div>

                    <div className="order-card">
                        <h3>Thanh toán</h3>
                        <div className="info-list">
                            <div>
                                <span>Phương thức</span>
                                <strong>{order.payment_method}</strong>
                            </div>
                            <div>
                                <span>Trạng thái</span>
                                <strong className={getPaymentStatusClass()}>
                                    {getPaymentStatusText()}
                                </strong>
                            </div>
                        </div>
                    </div>

                </div>

                {/* PRODUCTS */}
                <div className="order-card">
                    <h3>Sản phẩm</h3>

                    <div className="minimal-product-list">
                        {order.items?.map((item) => (
                            <div key={item.id} className="minimal-product-item">

                                {/* Ảnh sản phẩm */}
                                <div className="product-image-wrapper">
                                    <img
                                        src={item.image || "/placeholder-product.png"}
                                        alt={item.product_name}
                                        className="product-image"
                                    />
                                </div>

                                {/* Thông tin sản phẩm */}
                                <div className="product-info">
                                    <h4>{item.product_name}</h4>
                                    <p>{item.variant_name || "Không có phân loại"}</p>
                                </div>

                                {/* Số lượng */}
                                <div className="product-quantity">
                                    x{item.quantity}
                                </div>

                                {/* Giá */}
                                <div className="product-total">
                                    <strong>
                                        {(item.price * item.quantity).toLocaleString()}đ
                                    </strong>
                                </div>

                            </div>
                        ))}
                    </div>
                </div>

                {/* TOTAL */}
                <div className="order-total-card">
                    <span>Tổng tiền</span>
                    <h2>{Number(order.total_price).toLocaleString()}đ</h2>
                </div>

                {/* ACTIONS */}
                <div className="order-actions">

                    {order.status === "pending" && (
                        <button
                            onClick={handleCancel}
                            disabled={cancelling}
                            className="cancel-btn"
                        >
                            {cancelling ? "Đang hủy..." : "Hủy đơn"}
                        </button>
                    )}

                    {order.status === "shipping" && (
                        <button
                            onClick={submitReturn}
                            disabled={returning}
                            className="return-btn"
                        >
                            {returning ? "Đang gửi..." : "Yêu cầu hoàn hàng"}
                        </button>
                    )}

                </div>

            </div>

        </CustomerLayout>
    );
}

export default OrderDetail;