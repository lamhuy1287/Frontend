import { Link } from "react-router-dom";
import CustomerLayout from "../../layouts/CustomerLayout";

function PaymentSuccess() {

    return (
        <CustomerLayout>
            <div style={{ padding: 24, maxWidth: 720, margin: "auto" }}>
                <div style={{ background: "#fff", padding: 32, borderRadius: 16, boxShadow: "0 12px 30px rgba(0,0,0,0.08)" }}>
                    <h1>Thanh toán thành công</h1>
                    <p>Đơn hàng của bạn đã được ghi nhận.</p>
                    <Link
                        to="/my-orders"
                        style={{
                            display: "inline-block",
                            marginTop: 24,
                            padding: "12px 20px",
                            borderRadius: 10,
                            background: "#2563eb",
                            color: "#fff",
                            textDecoration: "none"
                        }}
                    >
                        Xem đơn hàng
                    </Link>
                </div>
            </div>
        </CustomerLayout>
    );
}

export default PaymentSuccess;
