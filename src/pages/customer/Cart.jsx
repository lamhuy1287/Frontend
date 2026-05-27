import {
    useEffect,
    useMemo,
    useState
} from "react";

import CustomerLayout from "../../layouts/CustomerLayout";

import {
    getCart,
    updateCartItem,
    removeCartItem,
    clearCart
} from "../../services/cartService";

import {
    useCart
} from "../../context/CartContext";

function Cart() {

    // =========================
    // CONTEXT
    // =========================

    const {
        setCartCount,
        removeCartItem: removeCartItemContext
    } = useCart();

    // =========================
    // STATE
    // =========================

    const [cart, setCart] =
        useState(null);

    const [loading, setLoading] =
        useState(true);

    // SELECTED ITEMS
    const [selectedItems,
        setSelectedItems] =
        useState([]);

    // COUPON
    const [coupon, setCoupon] =
        useState("");

    // =========================
    // FETCH CART
    // =========================

    const fetchCart =
        async () => {

            try {

                const res =
                    await getCart();

                console.log(
                    "CART:",
                    res.data
                );

                const cartData =
                    res.data.data;

                setCart(cartData);

                // UPDATE HEADER COUNT
                setCartCount(
                    cartData?.total_quantity || 0
                );

            } catch (err) {

                console.log(err);

            } finally {

                setLoading(false);
            }
        };

    // =========================
    // EFFECT
    // =========================

    useEffect(() => {

        fetchCart();

    }, []);

    // =========================
    // AUTO SELECT ALL
    // =========================

    useEffect(() => {

        if (cart?.items) {

            setSelectedItems(
                cart.items.map(
                    (item) => item.id
                )
            );
        }

    }, [cart]);

    // =========================
    // UPDATE QUANTITY
    // =========================

    const handleUpdateQuantity = async (
        itemId,
        currentQuantity,
        type
    ) => {

        let newQuantity =
            type === "increase"
                ? currentQuantity + 1
                : currentQuantity - 1;

        try {

            // =========================
            // AUTO REMOVE WHEN = 0
            // =========================

            if (newQuantity <= 0) {

                // UPDATE UI NGAY
                setCart((prev) => {

                    if (!prev) {
                        return prev;
                    }

                    const updatedItems =
                        prev.items.filter(
                            (item) =>
                                item.id !== itemId
                        );

                    const totalQuantity =
                        updatedItems.reduce(
                            (
                                total,
                                item
                            ) =>
                                total +
                                item.quantity,
                            0
                        );

                    // UPDATE HEADER
                    setCartCount(
                        totalQuantity
                    );

                    return {

                        ...prev,

                        items:
                            updatedItems,

                        total_quantity:
                            totalQuantity
                    };
                });

                // REMOVE CHECKBOX
                setSelectedItems(
                    (prev) =>
                        prev.filter(
                            (id) =>
                                id !== itemId
                        )
                );

                // API REMOVE
                await removeCartItem(
                    itemId
                );

                return;
            }

            // =========================
            // UPDATE QUANTITY
            // =========================

            await updateCartItem(
                itemId,
                newQuantity
            );

            // UPDATE UI NGAY
            setCart((prev) => {

                if (!prev) {
                    return prev;
                }

                const updatedItems =
                    prev.items.map(
                        (item) => {

                            if (
                                item.id === itemId
                            ) {

                                return {

                                    ...item,

                                    quantity:
                                        newQuantity,

                                    subtotal:
                                        Number(
                                            item.variant.price
                                        ) *
                                        newQuantity
                                };
                            }

                            return item;
                        }
                    );

                const totalQuantity =
                    updatedItems.reduce(
                        (
                            total,
                            item
                        ) =>
                            total +
                            item.quantity,
                        0
                    );

                // UPDATE HEADER
                setCartCount(
                    totalQuantity
                );

                return {

                    ...prev,

                    items:
                        updatedItems,

                    total_quantity:
                        totalQuantity
                };
            });

        } catch (err) {

            console.log(err);

            alert(
                err.response?.data?.message ||
                "Không thể cập nhật số lượng"
            );

            fetchCart();
        }
    };

    // =========================
    // REMOVE ITEM
    // =========================
    const handleRemoveItem =
        async (itemId) => {

            try {

                // UPDATE UI NGAY
                setCart((prev) => {

                    if (!prev) {
                        return prev;
                    }

                    const updatedItems =
                        prev.items.filter(
                            (item) =>
                                item.id !== itemId
                        );

                    const totalQuantity =
                        updatedItems.reduce(
                            (
                                total,
                                item
                            ) =>
                                total +
                                item.quantity,
                            0
                        );

                    // UPDATE HEADER COUNT
                    setCartCount(
                        totalQuantity
                    );

                    return {

                        ...prev,

                        items:
                            updatedItems,

                        total_quantity:
                            totalQuantity
                    };
                });

                // REMOVE CHECKBOX SELECTED
                setSelectedItems(
                    (prev) =>
                        prev.filter(
                            (id) =>
                                id !== itemId
                        )
                );

                // API
                await removeCartItem(
                    itemId
                );

            } catch (err) {

                console.log(err);

                // RELOAD NẾU LỖI
                fetchCart();
            }
        };

    // =========================
    // CLEAR CART
    // =========================

    const handleClearCart =
        async () => {

            try {

                // UPDATE UI NGAY
                setCart({

                    items: [],

                    total_quantity: 0
                });

                setSelectedItems([]);

                setCartCount(0);

                // API
                await clearCart();

            } catch (err) {

                console.log(err);

                fetchCart();
            }
        };

    // =========================
    // SELECT ITEM
    // =========================

    const handleSelectItem =
        (id) => {

            setSelectedItems(
                (prev) => {

                    if (
                        prev.includes(id)
                    ) {

                        return prev.filter(
                            (itemId) =>
                                itemId !== id
                        );
                    }

                    return [
                        ...prev,
                        id
                    ];
                }
            );
        };

    // =========================
    // SELECT ALL
    // =========================

    const handleSelectAll =
        () => {

            if (
                selectedItems.length ===
                cart.items.length
            ) {

                setSelectedItems([]);

            } else {

                setSelectedItems(
                    cart.items.map(
                        (item) => item.id
                    )
                );
            }
        };

    // =========================
    // SELECTED ITEMS
    // =========================

    const selectedCartItems =
        useMemo(() => {

            return (
                cart?.items?.filter(
                    (item) =>
                        selectedItems.includes(
                            item.id
                        )
                ) || []
            );

        }, [cart, selectedItems]);

    // =========================
    // TOTAL
    // =========================

    const totalPrice =
        selectedCartItems.reduce(
            (total, item) =>
                total +
                Number(item.subtotal),
            0
        );

    const totalQuantity =
        selectedCartItems.reduce(
            (total, item) =>
                total +
                item.quantity,
            0
        );

    // =========================
    // COUPON
    // =========================

    const discount =
        coupon === "SALE10"
            ? totalPrice * 0.1
            : 0;

    const finalTotal =
        totalPrice - discount;

    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div className="cart-loading">
                Loading...
            </div>
        );
    }

    return (

        <CustomerLayout>

            <>
                <style>{styles}</style>

                <div className="cart-page">

                    <div className="cart-wrapper">

                        {/* TOP */}

                        <div className="cart-top">

                            <div>

                                <h1 className="cart-title">
                                    Giỏ hàng
                                </h1>

                                <p className="cart-subtitle">
                                    {cart?.total_quantity || 0} sản phẩm
                                </p>

                            </div>

                            {
                                cart?.items?.length > 0 && (
                                    <button
                                        onClick={handleClearCart}
                                        className="clear-btn"
                                    >
                                        Xóa tất cả
                                    </button>
                                )
                            }

                        </div>

                        {
                            cart?.items?.length === 0 ? (

                                <div className="empty-cart">

                                    <div className="empty-icon">
                                        🛒
                                    </div>

                                    <h2>
                                        Giỏ hàng trống
                                    </h2>

                                </div>

                            ) : (

                                <div className="cart-grid">

                                    {/* LEFT */}

                                    <div>

                                        {/* HEADER */}

                                        <div className="cart-header-table">

                                            <div className="header-product">

                                                <input
                                                    type="checkbox"
                                                    checked={
                                                        selectedItems.length ===
                                                        cart.items.length
                                                    }
                                                    onChange={handleSelectAll}
                                                />

                                                <span>
                                                    Tất cả ({cart.items.length})
                                                </span>

                                            </div>

                                            <div className="header-price">
                                                Đơn giá
                                            </div>

                                            <div className="header-quantity">
                                                Số lượng
                                            </div>

                                            <div className="header-total">
                                                Thành tiền
                                            </div>

                                            <div className="header-remove">

                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth="1.6"
                                                    stroke="currentColor"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6 7h12M9 7V4h6v3m-7 4v6m4-6v6m4-6v6M5 7l1 13h12l1-13"
                                                    />
                                                </svg>

                                            </div>

                                        </div>

                                        {/* ITEMS */}

                                        <div className="cart-items">

                                            {
                                                cart.items.map((item) => (

                                                    <div
                                                        key={item.id}
                                                        className="cart-item"
                                                    >

                                                        {/* PRODUCT */}

                                                        <div className="product-section">

                                                            <input
                                                                type="checkbox"
                                                                checked={
                                                                    selectedItems.includes(item.id)
                                                                }
                                                                onChange={() =>
                                                                    handleSelectItem(item.id)
                                                                }
                                                            />

                                                            <div className="cart-image">

                                                                <img
                                                                    src={item.product.thumbnail}
                                                                    alt=""
                                                                />

                                                            </div>

                                                            <div className="product-info">

                                                                <h3 className="product-name">
                                                                    {item.product.name}
                                                                </h3>

                                                                <div className="variant">
                                                                    {item.variant.variant_name}
                                                                </div>

                                                            </div>

                                                        </div>

                                                        {/* PRICE */}

                                                        <div className="price">
                                                            {Number(item.variant.price).toLocaleString("vi-VN")}
                                                        </div>

                                                        {/* QUANTITY */}

                                                        <div className="quantity-box">

                                                            <button
                                                                onClick={() =>
                                                                    handleUpdateQuantity(
                                                                        item.id,
                                                                        item.quantity,
                                                                        "decrease"
                                                                    )
                                                                }
                                                            >
                                                                -
                                                            </button>

                                                            <span>
                                                                {item.quantity}
                                                            </span>

                                                            <button
                                                                onClick={() =>
                                                                    handleUpdateQuantity(
                                                                        item.id,
                                                                        item.quantity,
                                                                        "increase"
                                                                    )
                                                                }
                                                            >
                                                                +
                                                            </button>

                                                        </div>

                                                        {/* SUBTOTAL */}

                                                        <div className="subtotal">
                                                            {Number(item.subtotal).toLocaleString("vi-VN")}
                                                        </div>

                                                        {/* REMOVE */}

                                                        <button
                                                            className="remove-btn"
                                                            onClick={() =>
                                                                handleRemoveItem(item.id)
                                                            }
                                                        >

                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                fill="none"
                                                                viewBox="0 0 24 24"
                                                                strokeWidth="1.8"
                                                                stroke="currentColor"
                                                            >
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M6 7h12M9 7V4h6v3m-7 4v6m4-6v6m4-6v6M5 7l1 13h12l1-13"
                                                                />
                                                            </svg>

                                                        </button>

                                                    </div>

                                                ))
                                            }

                                        </div>

                                    </div>

                                    {/* RIGHT */}

                                    <div className="summary-column">

                                        {/* COUPON */}

                                        <div className="coupon-box">

                                            <h3>
                                                Mã giảm giá
                                            </h3>

                                            <div className="coupon-input">

                                                <input
                                                    type="text"
                                                    placeholder="Nhập mã giảm giá"
                                                    value={coupon}
                                                    onChange={(e) =>
                                                        setCoupon(e.target.value)
                                                    }
                                                />

                                                <button>
                                                    Áp dụng
                                                </button>

                                            </div>

                                        </div>

                                        {/* SUMMARY */}

                                        <div className="summary-box">

                                            <h2>
                                                Tóm tắt đơn hàng
                                            </h2>

                                            <div className="summary-row">

                                                <span>
                                                    Sản phẩm
                                                </span>

                                                <span>
                                                    {totalQuantity}
                                                </span>

                                            </div>

                                            <div className="summary-row">

                                                <span>
                                                    Tạm tính
                                                </span>

                                                <span>
                                                    {totalPrice.toLocaleString("vi-VN")}
                                                </span>

                                            </div>

                                            <div className="summary-row">

                                                <span>
                                                    Giảm giá
                                                </span>

                                                <span className="discount">
                                                    -{Number(discount).toLocaleString("vi-VN")}
                                                </span>

                                            </div>

                                            <div className="summary-total">

                                                <span>
                                                    Tổng cộng
                                                </span>

                                                <span className="total-price">
                                                    {Number(finalTotal).toLocaleString("vi-VN")}
                                                </span>

                                            </div>

                                            <button className="checkout-btn">
                                                Mua hàng
                                            </button>

                                        </div>

                                    </div>

                                </div>

                            )
                        }

                    </div>

                </div>

            </>

        </CustomerLayout>
    );
}

const styles = `

*{
    box-sizing:border-box;
}

/* PAGE */

.cart-page{
    min-height:100vh;
    background:#f5f5f5;
    // padding:24px 16px;
}

.cart-wrapper{
    max-width:1380px;
    margin:auto;
}

/* TOP */

.cart-top{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:18px;
}

.cart-title{
    font-size:32px;
    font-weight:700;
    color:#111;
}

.cart-subtitle{
    margin-top:4px;
    font-size:14px;
    color:#777;
}

.clear-btn{
    border:none;
    background:#ef4444;
    color:white;
    padding:10px 18px;
    border-radius:12px;
    cursor:pointer;
    font-size:14px;
}

/* GRID */

.cart-grid{
    display:grid;
    grid-template-columns:2fr 370px;
    gap:18px;
    align-items:flex-start;
}

/* HEADER */

.cart-header-table{
    background:white;
    border-radius:14px;
    padding:14px 18px;

    display:grid;
    grid-template-columns:
        1.8fr
        120px
        130px
        120px
        40px;

    align-items:center;

    margin-bottom:12px;

    font-size:14px;
    color:#666;
}

.header-product{
    display:flex;
    align-items:center;
    gap:10px;
}

.header-remove{
    display:flex;
    justify-content:center;
}

.header-remove svg{
    width:20px;
    height:20px;
    stroke:#777;
}

/* ITEMS */

.cart-items{
    display:flex;
    flex-direction:column;
    gap:12px;
}

.cart-item{
    background:white;
    border-radius:16px;
    padding:14px 18px;

    display:grid;
    grid-template-columns:
        1.8fr
        120px
        130px
        120px
        40px;

    align-items:center;

    gap:10px;
}

.product-section{
    display:flex;
    align-items:flex-start;
    gap:12px;
}

.product-section input{
    margin-top:8px;
}

.cart-image{
    width:78px;
    height:78px;
    border-radius:12px;
    overflow:hidden;
    background:#f3f3f3;
    flex-shrink:0;
}

.cart-image img{
    width:100%;
    height:100%;
    object-fit:cover;
}

.product-info{
    flex:1;
}

.product-name{
    font-size:14px;
    font-weight:400;
    color:#222;
    line-height:1.5;

    display:-webkit-box;
    -webkit-line-clamp:2;
    -webkit-box-orient:vertical;
    overflow:hidden;

    margin-bottom:8px;
}

.variant{
    display:inline-flex;
    padding:5px 10px;
    border-radius:999px;
    background:#f3f3f3;
    font-size:11px;
    color:#666;

    max-width:170px;

    overflow:hidden;
    white-space:nowrap;
    text-overflow:ellipsis;
}

/* PRICE */

.price,
.subtotal {
    font-size: 14px;
    font-weight: 400;
    color: #444;
    text-align: center;
}

/* QUANTITY */

.quantity-box{
    width:108px;
    height:38px;

    border:1px solid #ddd;
    border-radius:10px;

    overflow:hidden;

    display:flex;
    align-items:center;
    justify-content:center;
}

.quantity-box button{
    width:34px;
    height:38px;

    border:none;
    background:white;

    cursor:pointer;

    font-size:16px;
}

.quantity-box span{
    flex:1;
    text-align:center;
    font-size:14px;
}

/* REMOVE */

.remove-btn{
    border:none;
    background:none;

    display:flex;
    align-items:center;
    justify-content:center;

    cursor:pointer;
}

.remove-btn svg{
    width:20px;
    height:20px;
    stroke:#888;
}

.remove-btn:hover svg{
    stroke:#ef4444;
}

/* RIGHT */

.summary-column{
    display:flex;
    flex-direction:column;
    gap:14px;

    position:sticky;
    top:14px;
}

.coupon-box,
.summary-box{
    background:white;
    border-radius:16px;
    padding:18px;
}

.coupon-box h3,
.summary-box h2{
    font-size:18px;
    font-weight:600;
    margin-bottom:16px;
}

/* COUPON */

.coupon-input{
    display:flex;
    gap:8px;
}

.coupon-input input{
    flex:1;
    height:42px;

    border:1px solid #ddd;
    border-radius:10px;

    padding:0 14px;

    outline:none;
}

.coupon-input button{
    border:none;
    background:black;
    color:white;

    padding:0 18px;

    border-radius:10px;
    cursor:pointer;
}

/* SUMMARY */

.summary-row{
    display:flex;
    justify-content:space-between;

    margin-bottom:14px;

    font-size:14px;
    color:#555;
}

.discount{
    color:#ef4444;
}

.summary-total{
    border-top:1px solid #eee;

    margin-top:18px;
    padding-top:18px;

    display:flex;
    justify-content:space-between;
    align-items:center;
}

.total-price{
    font-size:28px;
    font-weight:700;
    color:#ef4444;
}

.checkout-btn{
    width:100%;
    height:50px;

    border:none;
    border-radius:12px;

    background:#ef4444;
    color:white;

    font-size:15px;
    font-weight:600;

    cursor:pointer;

    margin-top:20px;
}

/* EMPTY */

.empty-cart{
    background:white;
    border-radius:16px;
    padding:80px 20px;
    text-align:center;
}

/* LOADING */

.cart-loading{
    min-height:100vh;
    display:flex;
    align-items:center;
    justify-content:center;
}

/* RESPONSIVE */

@media(max-width:992px){

    .cart-grid{
        grid-template-columns:1fr;
    }

    .summary-column{
        position:static;
    }
}

@media(max-width:768px){

    .cart-header-table{
        display:none;
    }

    .cart-item{
        grid-template-columns:1fr;
    }

    .cart-image{
        width:100px;
        height:100px;
    }

    .quantity-box{
        width:100%;
    }
}

`;

export default Cart;