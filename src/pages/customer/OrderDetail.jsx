import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import CustomerLayout from "../../layouts/CustomerLayout";

import {
    getOrderDetail
} from "../../services/orderService";

function OrderDetail() {

    const { id } = useParams();

    const [order, setOrder] =
        useState(null);

    const [error, setError] =
        useState(null);

    useEffect(() => {

        const fetchOrder = async () => {

            try {

                const res =
                    await getOrderDetail(id);

                setOrder(
                    res.data.data
                );

            } catch (err) {

                console.error(err);

                setError(
                    err.response?.data?.message ||
                    "Không tải được đơn hàng"
                );
            }
        };

        if (id) {
            fetchOrder();
        }

    }, [id]);

    if (error) {

        return (
            <CustomerLayout>
                <div className="order-error">
                    {error}
                </div>
            </CustomerLayout>
        );
    }

    if (!order) {

        return (
            <CustomerLayout>
                <div className="order-loading">
                    Loading...
                </div>
            </CustomerLayout>
        );
    }

    return (

        <CustomerLayout>

            <>
                <style>{styles}</style>

                <div className="order-page">

                    <div className="order-wrapper">

                        <div className="order-header">

                            <div>

                                <h1>
                                    Đơn hàng #{order.id}
                                </h1>

                                <p>
                                    Chi tiết đơn hàng của bạn
                                </p>

                            </div>

                            <span
                                className={`status ${order.status}`}
                            >
                                {order.status}
                            </span>

                        </div>

                        <div className="order-grid">

                            {/* LEFT */}

                            <div>

                                <div className="card">

                                    <h2>
                                        Thông tin đơn hàng
                                    </h2>

                                    <div className="info-row">
                                        <span>Mã đơn</span>
                                        <strong>#{order.id}</strong>
                                    </div>

                                    <div className="info-row">
                                        <span>Khách hàng</span>
                                        <strong>{order.customer_name}</strong>
                                    </div>

                                    <div className="info-row">
                                        <span>Số điện thoại</span>
                                        <strong>{order.phone}</strong>
                                    </div>

                                    <div className="info-row">
                                        <span>Địa chỉ</span>
                                        <strong>{order.address}</strong>
                                    </div>

                                    <div className="info-row">
                                        <span>Thanh toán</span>
                                        <strong>{order.payment_method}</strong>
                                    </div>

                                    <div className="info-row">
                                        <span>Trạng thái thanh toán</span>
                                        <strong>
                                            {order.payment_status}
                                        </strong>
                                    </div>

                                    <div className="info-row">
                                        <span>Ngày tạo</span>
                                        <strong>
                                            {order.created_at
                                                ? new Date(order.created_at).toLocaleString("vi-VN")
                                                : "-"}
                                        </strong>
                                    </div>

                                </div>

                                <div className="card">

                                    <h2>
                                        Sản phẩm
                                    </h2>

                                    {
                                        order.items?.map((item) => (

                                            <div
                                                key={item.id}
                                                className="product-item"
                                            >

                                                <div>

                                                    <div className="product-name">
                                                        {item.product_name}
                                                    </div>

                                                    <div className="product-variant">
                                                        {item.variant_name}
                                                    </div>

                                                    <div className="product-qty">
                                                        Số lượng: {item.quantity}
                                                    </div>

                                                </div>

                                                <div className="product-price">

                                                    {Number(
                                                        item.price
                                                    ).toLocaleString("vi-VN")} đ

                                                </div>

                                            </div>

                                        ))
                                    }

                                </div>

                            </div>

                            {/* RIGHT */}

                            <div>

                                <div className="card">

                                    <h2>
                                        Thanh toán
                                    </h2>

                                    <div className="summary-row">
                                        <span>Tổng tiền</span>

                                        <strong className="total-price">

                                            {
                                                Number(
                                                    order.total_price
                                                ).toLocaleString("vi-VN")
                                            } đ

                                        </strong>

                                    </div>

                                    <div className="summary-row">
                                        <span>Giảm giá</span>

                                        <strong>

                                            {
                                                Number(
                                                    order.discount_amount
                                                ).toLocaleString("vi-VN")
                                            } đ

                                        </strong>

                                    </div>

                                </div>

                            </div>

                        </div>

                    </div>

                </div>

            </>

        </CustomerLayout>

    );
}

const styles = `

.order-page{
    min-height:100vh;
    background:#f5f5f5;
    padding:24px 16px;
}

.order-wrapper{
    max-width:1200px;
    margin:auto;
}

.order-header{
    display:flex;
    justify-content:space-between;
    align-items:center;
    margin-bottom:20px;
}

.order-header h1{
    margin:0;
    font-size:32px;
}

.order-header p{
    margin-top:6px;
    color:#666;
}

.order-grid{
    display:grid;
    grid-template-columns:2fr 1fr;
    gap:20px;
}

.card{
    background:white;
    border-radius:16px;
    padding:24px;
    margin-bottom:20px;
    box-shadow:0 4px 20px rgba(0,0,0,.05);
}

.card h2{
    margin-bottom:18px;
}

.info-row{
    display:flex;
    justify-content:space-between;
    padding:10px 0;
    border-bottom:1px solid #eee;
}

.product-item{
    display:flex;
    justify-content:space-between;
    align-items:center;
    padding:16px 0;
    border-bottom:1px solid #eee;
}

.product-name{
    font-weight:600;
    margin-bottom:4px;
}

.product-variant,
.product-qty{
    color:#666;
    font-size:14px;
}

.product-price{
    font-weight:700;
}

.summary-row{
    display:flex;
    justify-content:space-between;
    margin-bottom:16px;
}

.total-price{
    font-size:22px;
    color:#ef4444;
}

.status{
    padding:8px 14px;
    border-radius:999px;
    font-size:13px;
    font-weight:600;
}

.status.pending{
    background:#fef3c7;
    color:#92400e;
}

.status.completed{
    background:#dcfce7;
    color:#166534;
}

.status.cancelled{
    background:#fee2e2;
    color:#991b1b;
}

.order-loading,
.order-error{
    padding:40px;
    text-align:center;
}

@media(max-width:768px){

    .order-grid{
        grid-template-columns:1fr;
    }

    .order-header{
        flex-direction:column;
        align-items:flex-start;
        gap:12px;
    }

    .info-row,
    .product-item{
        flex-direction:column;
        align-items:flex-start;
        gap:6px;
    }
}

`;

export default OrderDetail;