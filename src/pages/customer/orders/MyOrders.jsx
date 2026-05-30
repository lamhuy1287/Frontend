
import "./MyOrders.css";

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import {
    FaBoxOpen
} from "react-icons/fa";

import CustomerLayout
    from "../../../layouts/CustomerLayout";

import {
    getMyOrders
} from "../../../services/orderService";

function MyOrders() {

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    /*
    |--------------------------------------------------------------------------
    | FETCH ORDERS
    |--------------------------------------------------------------------------
    */

    const fetchOrders = async () => {

        try {

            const response =
                await getMyOrders();

            console.log(response);

            setOrders(response.data);

        } catch (error) {

            console.log(
                "LOAD MY ORDERS ERROR:",
                error
            );

        } finally {

            setLoading(false);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | LOAD
    |--------------------------------------------------------------------------
    */

    useEffect(() => {

        fetchOrders();

    }, []);

    /*
    |--------------------------------------------------------------------------
    | FORMAT PRICE
    |--------------------------------------------------------------------------
    */

    const formatPrice = (price) => {

        return Number(price)
            .toLocaleString("vi-VN") + "đ";
    };

    /*
    |--------------------------------------------------------------------------
    | STATUS CLASS
    |--------------------------------------------------------------------------
    */

    const getStatusClass = (status) => {

        switch (status) {

            case "pending":
                return "status pending";

            case "confirmed":
                return "status confirmed";

            case "shipping":
                return "status shipping";

            case "completed":
                return "status completed";

            case "cancelled":
                return "status cancelled";

            default:
                return "status";
        }
    };

    /*
    |--------------------------------------------------------------------------
    | LOADING
    |--------------------------------------------------------------------------
    */

    if (loading) {

        return (

            <CustomerLayout>

                <div className="my-orders-loading">

                    Đang tải đơn hàng...

                </div>

            </CustomerLayout>
        );
    }

    return (

        <CustomerLayout>

            <div className="my-orders-page">

                {/* HEADER */}

                <div className="my-orders-header">

                    <h1>
                        Đơn hàng của tôi
                    </h1>

                    <p>
                        Theo dõi đơn hàng của bạn
                    </p>

                </div>

                {/* EMPTY */}

                {
                    orders.length === 0 && (

                        <div className="empty-orders">

                            <FaBoxOpen />

                            <h3>
                                Chưa có đơn hàng nào
                            </h3>

                            <p>
                                Hãy mua sắm ngay hôm nay
                            </p>

                            <Link
                                to="/products"
                                className="shop-btn"
                            >
                                Mua sắm ngay
                            </Link>

                        </div>
                    )
                }

                {/* ORDER LIST */}

                <div className="orders-list">

                    {
                        orders.map((order, index) => (

                            <div
                                className="order-card"
                                key={order.id}
                            >

                                {/* TOP */}

                                <div className="order-top">

                                    <div>

                                        <h3>
                                            Đơn hàng #{index + 1}
                                        </h3>

                                        <span>
                                            {
                                                new Date(
                                                    order.created_at
                                                ).toLocaleDateString(
                                                    "vi-VN"
                                                )
                                            }
                                        </span>

                                    </div>

                                    <div
                                        className={
                                            getStatusClass(
                                                order.status
                                            )
                                        }
                                    >
                                        {order.status}
                                    </div>

                                </div>

                                {/* BODY */}

                                <div className="order-body">

                                    <div>

                                        <p>
                                            Phương thức thanh toán
                                        </p>

                                        <strong>
                                            {
                                                order.payment_method
                                            }
                                        </strong>

                                    </div>

                                    <div>

                                        <p>
                                            Tổng tiền
                                        </p>

                                        <strong className="price">

                                            {
                                                formatPrice(
                                                    order.total_price
                                                )
                                            }

                                        </strong>

                                    </div>

                                </div>

                                {/* FOOTER */}

                                <div className="order-footer">

                                    <Link
                                        to={`/my-orders/${order.id}`}
                                        className="view-detail-btn"
                                    >

                                        Xem chi tiết

                                    </Link>

                                </div>

                            </div>
                        ))
                    }

                </div>

            </div>

        </CustomerLayout>
    );
}

export default MyOrders;

