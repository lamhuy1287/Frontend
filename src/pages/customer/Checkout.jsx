import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import CustomerLayout from "../../layouts/CustomerLayout";

import {
    getCart
} from "../../services/cartService";

import {
    checkout
} from "../../services/orderService";

function Checkout() {

    const navigate = useNavigate();

    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod");

    const fetchCart = async () => {
        try {
            const res = await getCart();
            setCart(res.data.data);
        } catch (err) {
            console.error(err);
            alert(err.response?.data?.message || "Không thể tải giỏ hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCart();
    }, []);

    const handlePlaceOrder = async () => {
        try {
            const payload = {
                customer_name: customerName,
                phone,
                address,
                payment_method: paymentMethod
            };

            const res = await checkout(payload);
            const orderId = res.data?.data?.order_id;

            alert("Đặt hàng thành công");

            if (orderId) {
                navigate(`/my-orders/${orderId}`);
            } else {
                navigate("/user");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Đặt hàng thất bại");
        }
    };

    if (loading) {
        return (
            <CustomerLayout>
                <div className="checkout-loading">
                    Loading...
                </div>
            </CustomerLayout>
        );
    }

    return (
        <CustomerLayout>
            <>
                <style>{checkoutStyles}</style>

                <div className="checkout-page">
                    <div className="checkout-wrapper">
                        <div className="checkout-header">
                            <h1>Thanh toán</h1>
                            <p>Kiểm tra giỏ hàng và hoàn tất thông tin giao hàng.</p>
                        </div>

                        <div className="checkout-grid">
                            <div className="checkout-form-card">
                                <h2>Thông tin giao hàng</h2>

                                <label>
                                    Họ tên
                                    <input
                                        type="text"
                                        value={customerName}
                                        onChange={(e) => setCustomerName(e.target.value)}
                                        placeholder="Nhập họ tên"
                                    />
                                </label>

                                <label>
                                    Số điện thoại
                                    <input
                                        type="text"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder="Nhập số điện thoại"
                                    />
                                </label>

                                <label>
                                    Địa chỉ
                                    <textarea
                                        value={address}
                                        onChange={(e) => setAddress(e.target.value)}
                                        placeholder="Nhập địa chỉ giao hàng"
                                    />
                                </label>

                                <label>
                                    Phương thức thanh toán
                                    <select
                                        value={paymentMethod}
                                        onChange={(e) => setPaymentMethod(e.target.value)}
                                    >
                                        <option value="cod">COD</option>
                                        <option value="vnpay">VNPAY</option>
                                        <option value="momo">MOMO</option>
                                        <option value="bank_transfer">Chuyển khoản</option>
                                    </select>
                                </label>

                                <button
                                    className="place-order-btn"
                                    onClick={handlePlaceOrder}
                                >
                                    Đặt hàng
                                </button>
                            </div>

                            <div className="checkout-summary-card">
                                <h2>Đơn hàng</h2>

                                {cart?.items?.length > 0 ? (
                                    <>
                                        <div className="order-items">
                                            {cart.items.map((item) => (
                                                <div key={item.id} className="order-item">
                                                    <div className="order-item-left">
                                                        <img src={item.product.thumbnail} alt={item.product.name} />
                                                        <div>
                                                            <div className="order-item-name">{item.product.name}</div>
                                                            <div className="order-item-variant">{item.variant.variant_name}</div>
                                                            <div className="order-item-quantity">Số lượng: {item.quantity}</div>
                                                        </div>
                                                    </div>
                                                    <div className="order-item-price">
                                                        {Number(item.subtotal).toLocaleString("vi-VN")}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="order-total-box">
                                            <div>
                                                <span>Tổng tiền</span>
                                                <strong>{Number(cart.total_price).toLocaleString("vi-VN")}</strong>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="empty-order">
                                        Giỏ hàng của bạn hiện đang trống.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </>
        </CustomerLayout>
    );
}

const checkoutStyles = `
.checkout-page {
    min-height: 100vh;
    background: #f5f5f5;
    padding: 24px 16px;
}

.checkout-wrapper {
    max-width: 1180px;
    margin: auto;
}

.checkout-header {
    margin-bottom: 24px;
}

.checkout-header h1 {
    font-size: 32px;
    margin-bottom: 8px;
}

.checkout-header p {
    color: #555;
}

.checkout-grid {
    display: grid;
    gap: 20px;
    grid-template-columns: 1.1fr 0.9fr;
}

.checkout-form-card,
.checkout-summary-card {
    background: #fff;
    border-radius: 16px;
    padding: 24px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.06);
}

.checkout-form-card h2,
.checkout-summary-card h2 {
    margin-bottom: 18px;
}

.checkout-form-card label {
    display: block;
    margin-bottom: 16px;
    color: #333;
}

.checkout-form-card input,
.checkout-form-card textarea,
.checkout-form-card select {
    width: 100%;
    margin-top: 8px;
    padding: 12px 14px;
    border: 1px solid #ddd;
    border-radius: 14px;
    font-size: 14px;
}

.checkout-form-card textarea {
    min-height: 120px;
    resize: vertical;
}

.place-order-btn {
    width: 100%;
    border: none;
    background: #2563eb;
    color: white;
    padding: 14px 0;
    font-size: 16px;
    border-radius: 14px;
    cursor: pointer;
    margin-top: 16px;
}

.order-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    padding: 16px 0;
    border-bottom: 1px solid #eef2ff;
}

.order-item:last-child {
    border-bottom: none;
}

.order-item-left {
    display: flex;
    align-items: center;
    gap: 14px;
}

.order-item-left img {
    width: 72px;
    height: 72px;
    object-fit: cover;
    border-radius: 14px;
}

.order-item-name {
    font-weight: 600;
}

.order-item-variant,
.order-item-quantity {
    color: #666;
    font-size: 14px;
    margin-top: 4px;
}

.order-item-price {
    font-weight: 700;
}

.order-total-box {
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eef2ff;
}

.order-total-box div {
    display: flex;
    justify-content: space-between;
    align-items: center;
    font-size: 18px;
}

.empty-order {
    color: #555;
    padding: 20px 0;
}

.checkout-loading {
    padding: 40px;
    font-size: 18px;
}
`;

export default Checkout;
