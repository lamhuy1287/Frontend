import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../layouts/CustomerLayout";
import { getCart, updateCartItem, removeCartItem, clearCart } from "../../services/cartService";
import { useCart } from "../../context/CartContext";
import { validateCoupon } from "../../services/couponService";
import socket from "../../socket";

function Cart() {
  const navigate = useNavigate();
  const { setCartCount, removeCartItem: removeCartItemContext } = useCart();

  // ===== STATE =====
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [couponMessage, setCouponMessage] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // ===== FETCH CART =====
  const fetchCart = async () => {
    try {
      const res = await getCart();
      console.log("CART:", res.data);
      const cartData = res.data.data;
      setCart(cartData);
      setCartCount(cartData?.total_quantity || 0);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    const handleCartUpdated = () => fetchCart();
    socket.on("cart_updated", handleCartUpdated);
    return () => socket.off("cart_updated", handleCartUpdated);
  }, []);

  useEffect(() => {
    const handleDiscountUpdated = () => fetchCart();
    socket.on("discount_updated", handleDiscountUpdated);
    return () => socket.off("discount_updated", handleDiscountUpdated);
  }, []);

  // ===== AUTO SELECT ALL =====
  useEffect(() => {
    if (cart?.items) {
      setSelectedItems(cart.items.map((item) => item.id));
    }
  }, [cart]);

  // ===== UPDATE QUANTITY =====
  const handleUpdateQuantity = async (itemId, currentQuantity, type) => {
    let newQuantity = type === "increase" ? currentQuantity + 1 : currentQuantity - 1;

    try {
      if (newQuantity <= 0) {
        // Xóa item khỏi UI ngay
        setCart((prev) => {
          if (!prev) return prev;
          const updatedItems = prev.items.filter((item) => item.id !== itemId);
          const totalQuantity = updatedItems.reduce((total, item) => total + item.quantity, 0);
          setCartCount(totalQuantity);
          return { ...prev, items: updatedItems, total_quantity: totalQuantity };
        });
        setSelectedItems((prev) => prev.filter((id) => id !== itemId));
        await removeCartItem(itemId);
        return;
      }

      await updateCartItem(itemId, newQuantity);
      setCart((prev) => {
        if (!prev) return prev;
        const updatedItems = prev.items.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              quantity: newQuantity,
              subtotal: Number(item.variant.price) * newQuantity,
            };
          }
          return item;
        });
        const totalQuantity = updatedItems.reduce((total, item) => total + item.quantity, 0);
        setCartCount(totalQuantity);
        return { ...prev, items: updatedItems, total_quantity: totalQuantity };
      });
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Không thể cập nhật số lượng");
      fetchCart();
    }
  };

  // ===== REMOVE ITEM =====
  const handleRemoveItem = async (itemId) => {
    try {
      setCart((prev) => {
        if (!prev) return prev;
        const updatedItems = prev.items.filter((item) => item.id !== itemId);
        const totalQuantity = updatedItems.reduce((total, item) => total + item.quantity, 0);
        setCartCount(totalQuantity);
        return { ...prev, items: updatedItems, total_quantity: totalQuantity };
      });
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
      await removeCartItem(itemId);
    } catch (err) {
      console.log(err);
      fetchCart();
    }
  };

  // ===== CLEAR CART =====
  const handleClearCart = async () => {
    try {
      setCart({ items: [], total_quantity: 0 });
      setSelectedItems([]);
      setCartCount(0);
      await clearCart();
    } catch (err) {
      console.log(err);
      fetchCart();
    }
  };

  // ===== SELECT ITEM / SELECT ALL =====
  const handleSelectItem = (id) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cart.items.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.items.map((item) => item.id));
    }
  };

  // ===== COMPUTED: selected items, totals =====
  const selectedCartItems = useMemo(
    () => cart?.items?.filter((item) => selectedItems.includes(item.id)) || [],
    [cart, selectedItems]
  );

  const totalPrice = useMemo(
    () => selectedCartItems.reduce((total, item) => total + Number(item.subtotal), 0),
    [selectedCartItems]
  );

  const totalQuantity = useMemo(
    () => selectedCartItems.reduce((total, item) => total + item.quantity, 0),
    [selectedCartItems]
  );

  // ===== COUPON =====
  const handleApplyCoupon = async () => {
    try {
      if (!coupon.trim()) {
        alert("Vui lòng nhập mã");
        return;
      }
      const res = await validateCoupon(coupon, totalPrice);
      console.log("COUPON:", res.data);
      setDiscount(res.data.discount_amount);
      setAppliedCoupon(res.data.coupon);
      setCouponMessage(res.data.message);
      alert("Áp dụng mã thành công");
    } catch (err) {
      console.log(err);
      setDiscount(0);
      setAppliedCoupon(null);
      setCouponMessage(err.response?.data?.message || "Mã không hợp lệ");
      alert(err.response?.data?.message || "Mã không hợp lệ");
    }
  };

  // ===== FINAL TOTAL =====
  const finalTotal = totalPrice - discount;

  // ===== CHECKOUT =====
  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert("Vui lòng chọn sản phẩm");
      return;
    }
    navigate("/checkout", {
      state: { selectedItems, couponCode: coupon, discountAmount: discount },
    });
  };

  // ===== LOADING =====
  if (loading) {
    return (
      <CustomerLayout>
        <div className="cart-loading">Loading...</div>
      </CustomerLayout>
    );
  }

  // ===== RENDER =====
  return (
    <CustomerLayout>
      <>
        <style>{styles}</style>
        <div className="cart-page">
          <div className="cart-wrapper">
            {/* TOP */}
            <div className="cart-top">
              <div>
                <h1 className="cart-title">Giỏ hàng</h1>
                <p className="cart-subtitle">{cart?.total_quantity || 0} sản phẩm</p>
              </div>
              {cart?.items?.length > 0 && (
                <button onClick={handleClearCart} className="clear-btn">
                  Xóa tất cả
                </button>
              )}
            </div>

            {cart?.items?.length === 0 ? (
              <div className="empty-cart">
                <div className="empty-icon">🛒</div>
                <h2>Giỏ hàng trống</h2>
              </div>
            ) : (
              <div className="cart-grid">
                {/* LEFT: items */}
                <div>
                  {/* HEADER */}
                  <div className="cart-header-table">
                    <div className="header-product">
                      <input
                        type="checkbox"
                        checked={selectedItems.length === cart.items.length}
                        onChange={handleSelectAll}
                      />
                      <span>Tất cả ({cart.items.length})</span>
                    </div>
                    <div className="header-price">Đơn giá</div>
                    <div className="header-quantity">Số lượng</div>
                    <div className="header-total">Thành tiền</div>
                    <div className="header-remove">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.6" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V4h6v3m-7 4v6m4-6v6m4-6v6M5 7l1 13h12l1-13" />
                      </svg>
                    </div>
                  </div>

                  {/* ITEMS */}
                  <div className="cart-items">
                    {cart.items.map((item) => (
                      <div key={item.id} className="cart-item">
                        <div className="product-section">
                          <input
                            type="checkbox"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleSelectItem(item.id)}
                          />
                          <div className="cart-image">
                            <img src={item.product.thumbnail} alt="" />
                          </div>
                          <div className="product-info">
                            <h3 className="product-name">{item.product.name}</h3>
                            <div className="variant">{item.variant.variant_name}</div>
                          </div>
                        </div>

                        <div className="price">{Number(item.variant.price).toLocaleString("vi-VN")}</div>

                        <div className="quantity-box">
                          <button onClick={() => handleUpdateQuantity(item.id, item.quantity, "decrease")}>-</button>
                          <span>{item.quantity}</span>
                          <button onClick={() => handleUpdateQuantity(item.id, item.quantity, "increase")}>+</button>
                        </div>

                        <div className="subtotal">{Number(item.subtotal).toLocaleString("vi-VN")}</div>

                        <button className="remove-btn" onClick={() => handleRemoveItem(item.id)}>
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.8" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 7h12M9 7V4h6v3m-7 4v6m4-6v6m4-6v6M5 7l1 13h12l1-13" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* RIGHT: summary */}
                <div className="summary-column">
                  <div className="coupon-box">
                    <h3>Mã giảm giá</h3>
                    <div className="coupon-input">
                      <input
                        type="text"
                        placeholder="Nhập mã giảm giá"
                        value={coupon}
                        onChange={(e) => setCoupon(e.target.value)}
                      />
                      <button onClick={handleApplyCoupon}>Áp dụng</button>
                    </div>
                  </div>

                  <div className="summary-box">
                    <h2>Tóm tắt đơn hàng</h2>
                    <div className="summary-row">
                      <span>Sản phẩm</span>
                      <span>{totalQuantity}</span>
                    </div>
                    <div className="summary-row">
                      <span>Tạm tính</span>
                      <span>{totalPrice.toLocaleString("vi-VN")}</span>
                    </div>
                    <div className="summary-row">
                      <span>Giảm giá</span>
                      <span className="discount">-{Number(discount).toLocaleString("vi-VN")}</span>
                    </div>
                    <div className="summary-total">
                      <span>Tổng cộng</span>
                      <span className="total-price">{Number(finalTotal).toLocaleString("vi-VN")}</span>
                    </div>
                    <button className="checkout-btn" onClick={handleCheckout}>
                      Mua hàng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </>
    </CustomerLayout>
  );
}

// ===== CSS (responsive) =====
const styles = `
* { box-sizing: border-box; }

.cart-page {
  min-height: 100vh;
  background: #f5f5f5;
  padding: 24px 16px;
}
.cart-wrapper {
  max-width: 1380px;
  margin: auto;
}
.cart-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
}
.cart-title {
  font-size: 32px;
  font-weight: 700;
  color: #111;
}
.cart-subtitle {
  margin-top: 4px;
  font-size: 14px;
  color: #777;
}
.clear-btn {
  border: none;
  background: #ef4444;
  color: white;
  padding: 10px 18px;
  border-radius: 12px;
  cursor: pointer;
  font-size: 14px;
  transition: 0.2s;
}
.clear-btn:hover { background: #dc2626; }

.cart-grid {
  display: grid;
  grid-template-columns: 2fr 370px;
  gap: 18px;
  align-items: flex-start;
}
.cart-header-table {
  background: white;
  border-radius: 14px;
  padding: 14px 18px;
  display: grid;
  grid-template-columns: 1.8fr 120px 130px 120px 40px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  color: #666;
}
.header-product { display: flex; align-items: center; gap: 10px; }
.header-remove { display: flex; justify-content: center; }
.header-remove svg { width: 20px; height: 20px; stroke: #777; }

.cart-items { display: flex; flex-direction: column; gap: 12px; }
.cart-item {
  background: white;
  border-radius: 16px;
  padding: 14px 18px;
  display: grid;
  grid-template-columns: 1.8fr 120px 130px 120px 40px;
  align-items: center;
  gap: 10px;
}
.product-section { display: flex; align-items: flex-start; gap: 12px; }
.product-section input { margin-top: 8px; }
.cart-image {
  width: 78px; height: 78px;
  border-radius: 12px;
  overflow: hidden;
  background: #f3f3f3;
  flex-shrink: 0;
}
.cart-image img { width: 100%; height: 100%; object-fit: cover; }
.product-info { flex: 1; }
.product-name {
  font-size: 14px;
  font-weight: 400;
  color: #222;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  margin-bottom: 8px;
}
.variant {
  display: inline-flex;
  padding: 5px 10px;
  border-radius: 999px;
  background: #f3f3f3;
  font-size: 11px;
  color: #666;
  max-width: 170px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.price, .subtotal {
  font-size: 14px;
  font-weight: 400;
  color: #444;
  text-align: center;
}
.quantity-box {
  width: 108px;
  height: 38px;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.quantity-box button {
  width: 34px; height: 38px;
  border: none;
  background: white;
  cursor: pointer;
  font-size: 16px;
}
.quantity-box button:hover { background: #f0f0f0; }
.quantity-box span {
  flex: 1;
  text-align: center;
  font-size: 14px;
}
.remove-btn {
  border: none;
  background: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.remove-btn svg { width: 20px; height: 20px; stroke: #888; }
.remove-btn:hover svg { stroke: #ef4444; }

.summary-column {
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: sticky;
  top: 14px;
}
.coupon-box, .summary-box {
  background: white;
  border-radius: 16px;
  padding: 18px;
}
.coupon-box h3, .summary-box h2 {
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 16px;
}
.coupon-input {
  display: flex;
  gap: 8px;
}
.coupon-input input {
  flex: 1;
  height: 42px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 0 14px;
  outline: none;
}
.coupon-input input:focus { border-color: #ef4444; }
.coupon-input button {
  border: none;
  background: black;
  color: white;
  padding: 0 18px;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
}
.coupon-input button:hover { background: #333; }

.summary-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 14px;
  font-size: 14px;
  color: #555;
}
.discount { color: #ef4444; }
.summary-total {
  border-top: 1px solid #eee;
  margin-top: 18px;
  padding-top: 18px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.total-price {
  font-size: 28px;
  font-weight: 700;
  color: #ef4444;
}
.checkout-btn {
  width: 100%;
  height: 50px;
  border: none;
  border-radius: 12px;
  background: #ef4444;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 20px;
  transition: 0.2s;
}
.checkout-btn:hover { background: #dc2626; }

.empty-cart {
  background: white;
  border-radius: 16px;
  padding: 80px 20px;
  text-align: center;
}
.empty-icon { font-size: 64px; margin-bottom: 16px; }
.cart-loading {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  color: #888;
}

/* ===== RESPONSIVE ===== */
@media (max-width: 992px) {
  .cart-grid {
    grid-template-columns: 1fr;
  }
  .summary-column {
    position: static;
  }
}
@media (max-width: 768px) {
  .cart-page { padding: 16px 12px; }
  .cart-title { font-size: 26px; }
  .cart-header-table { display: none; }
  .cart-item {
    grid-template-columns: 1fr;
    padding: 16px;
    gap: 12px;
  }
  .product-section { align-items: center; }
  .cart-image { width: 80px; height: 80px; }
  .price, .subtotal {
    text-align: left;
    font-size: 15px;
    font-weight: 500;
  }
  .price::before { content: "Đơn giá: "; color: #888; font-weight: 400; }
  .subtotal::before { content: "Thành tiền: "; color: #888; font-weight: 400; }
  .quantity-box { width: 120px; height: 40px; }
  .quantity-box button { width: 38px; height: 40px; }
  .remove-btn { justify-content: flex-start; }
  .summary-column { gap: 12px; }
  .coupon-box, .summary-box { padding: 16px; }
  .total-price { font-size: 24px; }
}
@media (max-width: 480px) {
  .cart-top { flex-direction: column; align-items: flex-start; gap: 12px; }
  .clear-btn { align-self: stretch; text-align: center; }
  .cart-title { font-size: 22px; }
  .cart-image { width: 70px; height: 70px; }
  .product-name { font-size: 13px; }
  .variant { font-size: 10px; }
}
`;

export default Cart;