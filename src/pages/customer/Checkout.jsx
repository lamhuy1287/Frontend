import {
    useEffect,
    useState
} from "react";

import {
    useNavigate,
    useLocation
} from "react-router-dom";

import CustomerLayout from "../../layouts/CustomerLayout";

import {
    getCart
} from "../../services/cartService";

import {
    checkout
} from "../../services/orderService";

import {
    updateProfile
} from "../../services/userService";

import {
    FaUser,
    FaPhone,
    FaMapMarkerAlt,
    FaStickyNote
} from "react-icons/fa";

// ✅ IMPORT CART CONTEXT
import { useCart } from "../../context/CartContext";

// ✅ IMPORT TOAST
import toast from "react-hot-toast";

import "./Checkout.css";

function Checkout() {

    const navigate = useNavigate();
    const location = useLocation();

    // ✅ LẤY HÀM loadCart TỪ CONTEXT
    const { loadCart } = useCart();

    // =========================
    // STATE
    // =========================

    const [cart, setCart] = useState(null);
    const [buyNowItem, setBuyNowItem] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [customerName, setCustomerName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("cod");
    const [couponCode, setCouponCode] = useState("");
    const [discountAmount, setDiscountAmount] = useState(0);
    const [selectedIds, setSelectedIds] = useState([]);
    const [rememberInfo, setRememberInfo] = useState(false); // ✅ Mặc định false và ẩn checkbox
    const [note, setNote] = useState("");

    // =========================
    // PAYMENT METHODS CONFIG
    // =========================

    const paymentMethods = [
        {
            id: "cod",
            name: "Thanh toán khi nhận hàng",
            icon: "💰",
            description: "Trả tiền mặt khi nhận hàng"
        }
        // {
        //     id: "vnpay",
        //     name: "VNPAY",
        //     icon: "🏦",
        //     description: "Thanh toán qua cổng VNPAY"
        // },
        // {
        //     id: "bank_transfer",
        //     name: "Chuyển khoản ngân hàng",
        //     icon: "🏛️",
        //     description: "Chuyển khoản qua ngân hàng"
        // }
        // {
        //     id: "momo",
        //     name: "MOMO",
        //     icon: "📱",
        //     description: "Thanh toán qua ví MoMo"
        // }
    ];

    // =========================
    // HELPER: CHECK LOGIN STATUS
    // =========================

    const isLoggedIn = () => {
        const token = localStorage.getItem("token");
        return token && token !== "null" && token !== "undefined";
    };

    // =========================
    // LIMIT TEXT
    // =========================

    const limitText = (text, max = 55) => {
        if (!text) return "";
        return text.length > max
            ? text.slice(0, max) + "..."
            : text;
    };

    // =========================
    // FETCH CART
    // =========================

    const fetchCart = async () => {
        try {
            const res = await getCart();
            setCart(res.data.data);
        } catch (err) {
            toast.error(
                err.response?.data?.message ||
                "Không thể tải giỏ hàng"
            );
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // LOAD DATA
    // =========================

    useEffect(() => {
        fetchCart();

        // LẤY DỮ LIỆU TỪ NAVIGATION STATE
        const state = location.state;
        
        // KIỂM TRA MUA NGAY (BUY NOW)
        if (state?.buyNow) {
            setBuyNowItem({
                product: state.product,
                variant: state.variant,
                price: state.price,
                quantity: state.quantity,
                subtotal: state.subtotal
            });
        } else {
            // TRƯỜNG HỢP TỪ GIỎ HÀNG
            if (state) {
                setSelectedIds(state.selectedItems || []);
                setCouponCode(state.couponCode || "");
                setDiscountAmount(state.discountAmount || 0);
            }
        }

        // USER PROFILE
        const userData = localStorage.getItem("user");
        if (userData) {
            const user = JSON.parse(userData);
            setCustomerName(user.name || "");
            setPhone(user.phone || "");
            setAddress(user.address || "");
        }

    }, [location.state]);

    // =========================
    // PLACE ORDER - WITH PROFILE UPDATE
    // =========================

    const handlePlaceOrder = async () => {
        // Validate required fields
        if (!customerName || !phone || !address) {
            toast.error("Vui lòng điền đầy đủ thông tin giao hàng");
            return;
        }

        // Prevent multiple clicks
        if (isPlacingOrder) return;
        setIsPlacingOrder(true);

        // Hiển thị toast loading
        const loadingToast = toast.loading("Đang xử lý đơn hàng...");

        try {
            let payload = {};

            // TRƯỜNG HỢP MUA NGAY
            if (buyNowItem) {
                payload = {
                    customer_name: customerName,
                    phone: phone,
                    address: address,
                    payment_method: paymentMethod,
                    note: note,
                    remember_info: rememberInfo,
                    buy_now: true,
                    product_variant_id: buyNowItem.variant.id,
                    quantity: buyNowItem.quantity,
                    price: buyNowItem.price
                };
            } 
            // TRƯỜNG HỢP TỪ GIỎ HÀNG
            else {
                payload = {
                    customer_name: customerName,
                    phone: phone,
                    address: address,
                    payment_method: paymentMethod,
                    coupon_code: couponCode,
                    selected_cart_item_ids: selectedIds,
                    remember_info: rememberInfo,
                    note: note
                };
            }

            console.log("📦 Payload gửi đi:", payload);

            const res = await checkout(payload);

            // Dismiss loading toast
            toast.dismiss(loadingToast);

            // ✅ CẬP NHẬT THÔNG TIN NGƯỜI DÙNG NẾU CHECKBOX "LƯU THÔNG TIN" ĐƯỢC CHỌN
            if (rememberInfo && isLoggedIn()) {
                try {
                    console.log("🔄 Đang cập nhật thông tin tài khoản...");
                    
                    const profileData = {
                        name: customerName,
                        phone: phone,
                        address: address
                    };
                    
                    console.log("📤 Dữ liệu cập nhật:", profileData);
                    
                    // Gọi API cập nhật profile
                    const updateResult = await updateProfile(profileData);
                    
                    console.log("✅ Kết quả cập nhật:", updateResult);
                    
                    if (updateResult && updateResult.status === "success") {
                        // Cập nhật lại localStorage với thông tin mới
                        const userData = localStorage.getItem("user");
                        if (userData) {
                            const currentUser = JSON.parse(userData);
                            const updatedUser = {
                                ...currentUser,
                                name: customerName,
                                phone: phone,
                                address: address
                            };
                            localStorage.setItem("user", JSON.stringify(updatedUser));
                            console.log("✅ Đã cập nhật localStorage:", updatedUser);
                        }
                        
                        toast.success("Đã cập nhật thông tin tài khoản!", {
                            duration: 2000,
                            position: "top-right"
                        });
                    } else {
                        console.log("⚠️ Cập nhật profile không thành công:", updateResult);
                        toast.error("Không thể cập nhật thông tin tài khoản", {
                            duration: 3000,
                            position: "top-right"
                        });
                    }
                } catch (profileErr) {
                    console.error("❌ Lỗi cập nhật profile:", profileErr);
                    console.error("Chi tiết lỗi:", profileErr.response?.data);
                    toast.error(
                        profileErr.response?.data?.message || 
                        "Không thể lưu thông tin tài khoản", 
                        {
                            duration: 3000,
                            position: "top-right"
                        }
                    );
                }
            } else {
                console.log("⏭️ Bỏ qua cập nhật profile. rememberInfo:", rememberInfo, "isLoggedIn:", isLoggedIn());
            }

            // ✅ Load lại cart sau khi checkout thành công
            if (!buyNowItem) {
                await loadCart();
                console.log("✅ Cart loaded after checkout");
            }

            // PAYMENT REDIRECT
            if (
                paymentMethod === "bank_transfer" &&
                res.data?.checkout_url
            ) {
                window.location.href = res.data.checkout_url;
                return;
            }

            if (
                ["momo", "vnpay"].includes(paymentMethod) &&
                res.data?.pay_url
            ) {
                window.location.href = res.data.pay_url;
                return;
            }

// ✅ HIỂN THỊ THÔNG BÁO THÀNH CÔNG
toast.success("Đặt hàng thành công!", {
    duration: 2000,
    position: "top-right"
});

const orderId = res.data?.order_id;

// ✅ CHUYỂN HƯỚNG NGAY LẬP TỨC (bỏ setTimeout)
navigate(orderId ? `/my-orders/${orderId}` : "/user");

        } catch (err) {
            console.error("❌ ORDER ERROR:", err);
            toast.dismiss(loadingToast);
            toast.error(
                err.response?.data?.message ||
                "Đặt hàng thất bại"
            );
        } finally {
            setIsPlacingOrder(false);
        }
    };

    // =========================
    // TOTAL
    // =========================

    const selectedCartItems = cart?.items?.filter(
        (item) => selectedIds.includes(item.id)
    ) || [];

    const getTotal = () => {
        const base = buyNowItem
            ? Number(buyNowItem.price) * Number(buyNowItem.quantity)
            : selectedCartItems.reduce(
                (total, item) => total + Number(item.subtotal),
                0
            );
        return base - discountAmount;
    };

    // =========================
    // RENDER ITEM
    // =========================

    const renderItem = (image, name, variant, price, quantity) => (
        <div className="checkout-item">
            <div className="checkout-item-left">
                <img
                    src={image || "/placeholder.jpg"}
                    alt={name}
                    onError={(e) => { 
                        e.target.src = "/placeholder.jpg"; 
                    }}
                />
                <div className="checkout-item-info">
                    <div className="checkout-item-name">
                        {limitText(name)}
                    </div>
                    <div className="checkout-item-variant">
                        {variant || "Mặc định"}
                    </div>
                </div>
            </div>
            <div className="checkout-item-right">
                <div className="checkout-item-price">
                    {Number(price).toLocaleString("vi-VN")}đ
                </div>
                <div className="checkout-item-quantity">
                    x{quantity}
                </div>
            </div>
        </div>
    );

    // =========================
    // ITEMS
    // =========================

    const renderItems = () => {
        if (buyNowItem) {
            return (
                <div className="checkout-items">
                    {renderItem(
                        buyNowItem.product?.image,
                        buyNowItem.product?.name,
                        buyNowItem.variant?.variant_name,
                        buyNowItem.price,
                        buyNowItem.quantity
                    )}
                </div>
            );
        }

        if (cart?.items?.length > 0 && selectedCartItems.length > 0) {
            return (
                <div className="checkout-items">
                    {selectedCartItems.map((item) => (
                        <div key={item.id}>
                            {renderItem(
                                item.product?.thumbnail,
                                item.product?.name,
                                item.variant?.variant_name,
                                item.subtotal,
                                item.quantity
                            )}
                        </div>
                    ))}
                </div>
            );
        }

        return (
            <div className="empty-order">
                {buyNowItem ? "Đang tải..." : "Giỏ hàng trống"}
            </div>
        );
    };

    // =========================
    // RENDER PAYMENT METHOD
    // =========================

    const renderPaymentMethod = (method) => {
        const isSelected = paymentMethod === method.id;
        
        return (
            <div
                key={method.id}
                className={`payment-method-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setPaymentMethod(method.id)}
            >
                <div className="payment-method-icon">
                    {method.icon}
                </div>
                <div className="payment-method-content">
                    <div className="payment-method-name">
                        {method.name}
                    </div>
                    <div className="payment-method-description">
                        {method.description}
                    </div>
                </div>
                <div className="payment-method-check">
                    {isSelected && (
                        <span className="check-mark">✓</span>
                    )}
                </div>
            </div>
        );
    };

    // =========================
    // LOADING
    // =========================

    if (loading && !buyNowItem) {
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
            <div className="checkout-page">
                <div className="checkout-container">
                    {/* LEFT */}
                    <div className="checkout-left">
                        <div className="checkout-card">
                            <h2>Thông tin giao hàng</h2>

                            {/* NAME */}
                            <div className="checkout-input-group">
                                <FaUser />
                                <input
                                    type="text"
                                    placeholder="Họ và tên"
                                    value={customerName}
                                    onChange={(e) =>
                                        setCustomerName(e.target.value)
                                    }
                                />
                            </div>

                            {/* PHONE */}
                            <div className="checkout-input-group">
                                <FaPhone />
                                <input
                                    type="text"
                                    placeholder="Số điện thoại"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(e.target.value)
                                    }
                                />
                            </div>

                            {/* ADDRESS */}
                            <div className="checkout-input-group textarea-group">
                                <FaMapMarkerAlt />
                                <textarea
                                    placeholder="Địa chỉ giao hàng"
                                    value={address}
                                    onChange={(e) =>
                                        setAddress(e.target.value)
                                    }
                                />
                            </div>

                            {/* NOTE */}
                            <div className="checkout-input-group textarea-group">
                                <FaStickyNote />
                                <textarea
                                    placeholder="Ghi chú cho đơn hàng (không bắt buộc)"
                                    value={note}
                                    onChange={(e) =>
                                        setNote(e.target.value)
                                    }
                                />
                            </div>

                            {/* ✅ ĐÃ XÓA PHẦN CHECKBOX "LƯU THÔNG TIN" Ở ĐÂY */}
                        </div>

                        {/* PAYMENT - NEW DESIGN */}
                        <div className="checkout-card">
                            <h2>Phương thức thanh toán</h2>
                            <div className="checkout-payment-methods">
                                {paymentMethods.map(renderPaymentMethod)}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT */}
                    <div className="checkout-right">
                        <div className="checkout-card">
                            <h2>Đơn hàng của bạn</h2>
                            {renderItems()}

                            {discountAmount > 0 && !buyNowItem && (
                                <div className="checkout-total-row discount">
                                    <span>Giảm giá</span>
                                    <strong>
                                        -{discountAmount.toLocaleString("vi-VN")}đ
                                    </strong>
                                </div>
                            )}

                            <div className="checkout-total-row total">
                                <span>Tổng thanh toán</span>
                                <strong>
                                    {getTotal().toLocaleString("vi-VN")}đ
                                </strong>
                            </div>

                            <button
                                className="checkout-btn"
                                onClick={handlePlaceOrder}
                                disabled={!customerName || !phone || !address || isPlacingOrder}
                            >
                                {isPlacingOrder ? "Đang xử lý..." : "Đặt hàng"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </CustomerLayout>
    );
}

export default Checkout;