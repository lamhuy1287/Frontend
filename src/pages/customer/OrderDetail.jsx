import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CustomerLayout from "../../layouts/CustomerLayout";

import {
    getOrderDetail,
    cancelOrder,
    requestReturnOrder
} from "../../services/orderService";

import "./OrderDetail.css";

function OrderDetail() {

    const { id } = useParams();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const [cancelling, setCancelling] = useState(false);
    const [returning, setReturning] = useState(false);

    // RETURN MODAL
    const [returnModalOpen, setReturnModalOpen] = useState(false);
    const [returnNote, setReturnNote] = useState("");

    // TOAST
    const [toast, setToast] = useState({
        open: false,
        message: "",
        type: "success"
    });

    const showToast = (message, type = "success") => {
        setToast({ open: true, message, type });

        setTimeout(() => {
            setToast({ open: false, message: "", type: "success" });
        }, 2500);
    };

    const statusMap = {
        pending: "Chờ xác nhận",
        confirmed: "Đã xác nhận",
        shipping: "Đang giao",
        return_requested: "Yêu cầu hoàn",
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
        if (!window.confirm("Bạn chắc chắn muốn huỷ đơn?")) return;

        try {
            setCancelling(true);

            await cancelOrder(order.id);

            showToast("Huỷ đơn thành công", "success");

            fetchOrderDetail();

        } catch (err) {
            showToast(
                err.response?.data?.message || "Huỷ đơn thất bại",
                "error"
            );
        } finally {
            setCancelling(false);
        }
    };

    // =========================
    // OPEN RETURN MODAL
    // =========================
    const handleReturn = () => {
        setReturnNote("");
        setReturnModalOpen(true);
    };

    // =========================
    // SUBMIT RETURN
    // =========================
    const submitReturn = async () => {
        if (!returnNote.trim()) return;

        try {
            setReturning(true);

            await requestReturnOrder(order.id, returnNote);

            setReturnModalOpen(false);
            setReturnNote("");

            showToast("Gửi yêu cầu hoàn hàng thành công", "success");

            fetchOrderDetail();

        } catch (err) {
            showToast(
                err.response?.data?.message || "Gửi yêu cầu thất bại",
                "error"
            );
        } finally {
            setReturning(false);
        }
    };

    if (loading) {
        return (
            <CustomerLayout>
                <div className="order-loading">Loading...</div>
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
                        <h1>Đơn hàng </h1>
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
                                <strong>
                                    {paymentStatusMap[order.payment_status]}
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

                                <div>
                                    <h4>{item.product_name}</h4>
                                    <p>{item.variant_name}</p>
                                </div>

                                <div>x{item.quantity}</div>

                                <div>
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
                            {cancelling ? "Đang huỷ..." : "Huỷ đơn"}
                        </button>
                    )}

                    {order.status === "shipping" && (
                        <button
                            onClick={handleReturn}
                            className="return-btn"
                        >
                            Hoàn hàng
                        </button>
                    )}

                </div>

            </div>

            {/* ================= MODAL ================= */}
            {returnModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-box">

                        <h3>Lý do hoàn hàng</h3>

                        <textarea
                            value={returnNote}
                            onChange={(e) => setReturnNote(e.target.value)}
                            placeholder="Nhập lý do..."
                            rows={5}
                        />

                        <div className="modal-actions">

                            <button
                                className="btn-cancel"
                                onClick={() => setReturnModalOpen(false)}
                            >
                                Huỷ
                            </button>

                            <button
                                className="btn-submit"
                                onClick={submitReturn}
                                disabled={returning}
                            >
                                {returning ? "Đang gửi..." : "Gửi"}
                            </button>

                        </div>

                    </div>
                </div>
            )}

            {/* ================= TOAST ================= */}
            {toast.open && (
                <div className={`toast ${toast.type}`}>
                    {toast.message}
                </div>
            )}

        </CustomerLayout>
    );
}

export default OrderDetail;