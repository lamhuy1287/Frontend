
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
    FaUser,
    FaPhone,
    FaMapMarkerAlt,
    FaCreditCard,
    FaStickyNote
} from "react-icons/fa";

import "./Checkout.css";

function Checkout() {

    const navigate =
        useNavigate();

    const location =
        useLocation();

    // =========================
    // STATE
    // =========================

    const [cart,
        setCart] =
        useState(null);

    const [buyNowItem,
        setBuyNowItem] =
        useState(null);

    const [loading,
        setLoading] =
        useState(true);

    const [customerName,
        setCustomerName] =
        useState("");

    const [phone,
        setPhone] =
        useState("");

    const [address,
        setAddress] =
        useState("");

    const [paymentMethod,
        setPaymentMethod] =
        useState("cod");

    const [couponCode,
        setCouponCode] =
        useState("");

    const [discountAmount,
        setDiscountAmount] =
        useState(0);

    const [selectedIds,
        setSelectedIds] =
        useState([]);

    const [rememberInfo,
        setRememberInfo] =
        useState(true);
    
    const [note,
        setNote] =
        useState("");



    // =========================
    // LIMIT TEXT
    // =========================

    const limitText = (
        text,
        max = 55
    ) => {

        if (!text) return "";

        return text.length > max
            ? text.slice(0, max) + "..."
            : text;

    };

    // =========================
    // FETCH CART
    // =========================

    const fetchCart =
        async () => {

            try {

                const res =
                    await getCart();

                setCart(
                    res.data.data
                );

            } catch (err) {

                alert(
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

        // BUY NOW

        if (location.state?.buyNow) {

            setBuyNowItem(
                location.state
            );

        }

        // COUPON

        if (location.state) {

            setSelectedIds(
                location.state.selectedItems || []
            );

            setCouponCode(
                location.state.couponCode || ""
            );

            setDiscountAmount(
                location.state.discountAmount || 0
            );

        }

        // USER PROFILE

        const userData =
            localStorage.getItem("user");

        if (userData) {

            const user =
                JSON.parse(userData);

            setCustomerName(
                user.name || ""
            );

            setPhone(
                user.phone || ""
            );

            setAddress(
                user.address || ""
            );

        }

    }, []);

    // =========================
    // PLACE ORDER
    // =========================

    const handlePlaceOrder =
        async () => {

            try {

                const payload = {

                    customer_name:
                        customerName,

                    phone,

                    address,

                    payment_method:
                        paymentMethod,

                    coupon_code:
                        couponCode,

                    selected_cart_item_ids:
                        selectedIds,


                    remember_info:
                        rememberInfo,

                    note


                };

                const res =
                    await checkout(payload);

                // =====================
                // PAYMENT REDIRECT
                // =====================

                if (
                    paymentMethod ===
                    "bank_transfer" &&
                    res.data?.checkout_url
                ) {

                    window.location.href =
                        res.data.checkout_url;

                    return;

                }

                if (
                    ["momo", "vnpay"]
                        .includes(paymentMethod)
                    &&
                    res.data?.pay_url
                ) {

                    window.location.href =
                        res.data.pay_url;

                    return;

                }

                alert(
                    "Đặt hàng thành công"
                );

                const orderId =
                    res.data?.order_id;

                navigate(
                    orderId
                        ? `/my-orders/${orderId}`
                        : "/user"
                );

            } catch (err) {

                alert(
                    err.response?.data?.message ||
                    "Đặt hàng thất bại"
                );

            }

        };

    // =========================
    // TOTAL
    // =========================

    const selectedCartItems =
        cart?.items?.filter(
            (item) =>
                selectedIds.includes(
                    item.id
                )
        ) || [];

    const getTotal = () => {

        const base =
            buyNowItem
                ? buyNowItem.price *
                buyNowItem.quantity
                : selectedCartItems.reduce(
                    (total, item) =>
                        total +
                        Number(item.subtotal),
                    0
                );

        return base - discountAmount;

    };

    // =========================
    // RENDER ITEM
    // =========================

    const renderItem = (
        image,
        name,
        variant,
        price,
        quantity
    ) => (

        <div className="checkout-item">

            <div className="checkout-item-left">

                <img
                    src={image}
                    alt={name}
                />

                <div className="checkout-item-info">

                    <div className="checkout-item-name">

                        {limitText(name)}

                    </div>

                    <div className="checkout-item-variant">

                        {variant}

                    </div>

                </div>

            </div>

            <div className="checkout-item-right">

                <div className="checkout-item-price">

                    {Number(price)
                        .toLocaleString("vi-VN")}đ

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

                    {
                        renderItem(
                            buyNowItem.product.image,
                            buyNowItem.product.name,
                            buyNowItem.variant?.variant_name,
                            buyNowItem.price,
                            buyNowItem.quantity
                        )
                    }

                </div>

            );

        }

        if (cart?.items?.length > 0) {

            return (

                <div className="checkout-items">

                    {
                        selectedCartItems.map((item) => (

                            <div key={item.id}>

                                {
                                    renderItem(
                                        item.product.thumbnail,
                                        item.product.name,
                                        item.variant?.variant_name,
                                        item.subtotal,
                                        item.quantity
                                    )
                                }

                            </div>

                        ))
                    }

                </div>

            );

        }

        return (

            <div className="empty-order">

                Giỏ hàng trống

            </div>

        );

    };

    // =========================
    // LOADING
    // =========================

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

            <div className="checkout-page">

                <div className="checkout-container">

                    {/* LEFT */}

                    <div className="checkout-left">

                        <div className="checkout-card">

                            <h2>
                                Thông tin giao hàng
                            </h2>

                            {/* NAME */}

                            <div className="checkout-input-group">

                                <FaUser />

                                <input
                                    type="text"
                                    placeholder="Họ và tên"
                                    value={customerName}
                                    onChange={(e) =>
                                        setCustomerName(
                                            e.target.value
                                        )
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
                                        setPhone(
                                            e.target.value
                                        )
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
                                        setAddress(
                                            e.target.value
                                        )
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
                                        setNote(
                                            e.target.value
                                        )
                                    }
                                />

                            </div>



                            {/* REMEMBER */}

                            <label className="remember-info">

                                <input
                                    type="checkbox"
                                    checked={rememberInfo}
                                    onChange={() =>
                                        setRememberInfo(
                                            !rememberInfo
                                        )
                                    }
                                />

                                <span>
                                    Lưu thông tin cho lần mua sau
                                </span>

                            </label>

                        </div>

                        {/* PAYMENT */}

                        <div className="checkout-card">

                            <h2>
                                Phương thức thanh toán
                            </h2>

                            <div className="checkout-payment">

                                <FaCreditCard />

                                <select
                                    value={paymentMethod}
                                    onChange={(e) =>
                                        setPaymentMethod(
                                            e.target.value
                                        )
                                    }
                                >

                                    <option value="cod">
                                        Thanh toán khi nhận hàng
                                    </option>

                                    <option value="vnpay">
                                        VNPAY
                                    </option>

                                    <option value="momo">
                                        MOMO
                                    </option>

                                    <option value="bank_transfer">
                                        Chuyển khoản ngân hàng
                                    </option>

                                </select>

                            </div>

                        </div>

                    </div>

                    {/* RIGHT */}

                    <div className="checkout-right">

                        <div className="checkout-card">

                            <h2>
                                Đơn hàng của bạn
                            </h2>

                            {renderItems()}

                            {
                                discountAmount > 0 && (

                                    <div className="checkout-total-row discount">

                                        <span>
                                            Giảm giá
                                        </span>

                                        <strong>

                                            -{discountAmount
                                                .toLocaleString("vi-VN")}đ

                                        </strong>

                                    </div>

                                )
                            }

                            <div className="checkout-total-row total">

                                <span>
                                    Tổng thanh toán
                                </span>

                                <strong>

                                    {getTotal()
                                        .toLocaleString("vi-VN")}đ

                                </strong>

                            </div>

                            <button
                                className="checkout-btn"
                                onClick={handlePlaceOrder}
                            >

                                Đặt hàng

                            </button>

                        </div>

                    </div>

                </div>

            </div>

        </CustomerLayout>

    );

}

export default Checkout;

