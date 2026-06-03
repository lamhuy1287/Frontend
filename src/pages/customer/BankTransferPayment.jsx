import {
    useEffect,
    useState
} from "react";

import {
    useLocation,
    useParams
} from "react-router-dom";

import io from "socket.io-client";

import CustomerLayout from "../../layouts/CustomerLayout";
import { getOrderDetail } from "../../services/orderService";

const socket = io("http://localhost:5000");

function BankTransferPayment() {
    const location = useLocation();
    const { orderId } = useParams();

    const [payment, setPayment] = useState(
        location.state || null
    );
    const [loading, setLoading] = useState(
        !location.state
    );
    const [error, setError] = useState(null);
    const [submitted, setSubmitted] = useState(false);

    useEffect(() => {
        if (!payment && orderId) {
            fetchPayment();
        }
    }, [orderId, payment]);

    useEffect(() => {
        socket.on("order_updated", (data) => {
            if (data.order_id === Number(orderId)) {
                if (data.payment_status === "paid") {
                    alert("Thanh toán đã được xác nhận");
                }
            }
        });

        return () => {
            socket.off("order_updated");
        };
    }, [orderId]);

    const fetchPayment = async () => {
        try {
            setLoading(true);
            const res = await getOrderDetail(orderId);
            setPayment(res?.data || null);
        } catch (err) {
            console.error("LOAD BANK TRANSFER DATA ERROR", err);
            setError("Không thể tải dữ liệu thanh toán");
        } finally {
            setLoading(false);
        }
    };

    const handleTransferred = () => {
        setSubmitted(true);
        alert("Yêu cầu xác nhận thanh toán đã được gửi");
    };

    const handleCancelOrder = () => {
        if (!window.confirm("Bạn muốn hủy đơn hàng này?")) {
            return;
        }

        alert("Yêu cầu hủy đơn đã được gửi");
    };

    if (loading) {
        return (
            <CustomerLayout>
                <div style={{ padding: "40px" }}>
                    <h2>Loading...</h2>
                </div>
            </CustomerLayout>
        );
    }

    if (error) {
        return (
            <CustomerLayout>
                <div style={{ padding: "40px" }}>
                    <h2>{error}</h2>
                </div>
            </CustomerLayout>
        );
    }

    if (!payment) {
        return (
            <CustomerLayout>
                <div style={{ padding: "40px" }}>
                    <h2>Không có dữ liệu thanh toán</h2>
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <div style={{ padding: "24px" }}>
                <div style={{ maxWidth: 720, margin: "auto", background: "#fff", borderRadius: 16, padding: 24, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}>
                    <h1>Chuyển khoản ngân hàng</h1>
                    <p>Vui lòng chuyển khoản theo thông tin bên dưới và chờ xác nhận.</p>

                    <div style={{ marginTop: 24, gap: 12, display: "grid" }}>
                        <div>
                            <strong>Ngân hàng:</strong>
                            <div>{payment.bank_name || payment.bank || "-"}</div>
                        </div>
                        <div>
                            <strong>Số tài khoản:</strong>
                            <div>{payment.account_number || payment.stk || "-"}</div>
                        </div>
                        <div>
                            <strong>Chủ tài khoản:</strong>
                            <div>{payment.account_name || payment.account_holder || "-"}</div>
                        </div>
                        <div>
                            <strong>Số tiền:</strong>
                            <div>{Number(payment.amount || payment.total_amount || 0).toLocaleString("vi-VN")} đ</div>
                        </div>
                        <div>
                            <strong>Nội dung chuyển khoản:</strong>
                            <div>{payment.transfer_content || payment.payment_content || "-"}</div>
                        </div>
                        {payment.qr_url && (
                            <div style={{ marginTop: 16 }}>
                                <strong>QR chuyển khoản:</strong>
                                <div style={{ marginTop: 8 }}>
                                    <img src={payment.qr_url} alt="QR chuyển khoản" style={{ width: "100%", maxWidth: 360, borderRadius: 16, boxShadow: "0 10px 24px rgba(0,0,0,0.1)" }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div style={{ marginTop: 24, padding: 18, borderRadius: 14, background: "#f9fafb", border: "1px solid #e5e7eb" }}>
                        { !submitted ? (
                            <>
                                <button
                                    onClick={handleTransferred}
                                    style={{
                                        width: "100%",
                                        padding: "14px 18px",
                                        borderRadius: 12,
                                        border: "none",
                                        background: "#2563eb",
                                        color: "#fff",
                                        fontSize: 16,
                                        cursor: "pointer"
                                    }}
                                >
                                    Tôi đã chuyển khoản
                                </button>

                                <button
                                    onClick={handleCancelOrder}
                                    style={{
                                        width: "100%",
                                        padding: "14px 18px",
                                        borderRadius: 12,
                                        border: "1px solid #d1d5db",
                                        background: "#fff",
                                        color: "#111827",
                                        fontSize: 16,
                                        cursor: "pointer",
                                        marginTop: 12
                                    }}
                                >
                                    Hủy đơn hàng
                                </button>
                            </>
                        ) : (
                            <div>
                                <strong>Chúng tôi đã nhận được yêu cầu.</strong>
                                <div>Vui lòng chờ admin xác nhận.</div>
                            </div>
                        ) }
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}

export default BankTransferPayment;
