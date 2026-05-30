
import {
    useEffect,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";

import {
    getAdminOrderDetail
} from "../../../services/orderService";

import "./OrderDetail.css";

function OrderDetail() {

    // =========================
    // PARAMS
    // =========================

    const { id } = useParams();

    // =========================
    // STATES
    // =========================

    const [order,
        setOrder] =
        useState(null);

    const [loading,
        setLoading] =
        useState(true);

    // =========================
    // EFFECT
    // =========================

    useEffect(() => {

        if (id) {

            fetchOrder();
        }

    }, [id]);

    // =========================
    // FETCH ORDER
    // =========================

    const fetchOrder =
        async () => {

            try {

                setLoading(true);

                const res =
                    await getAdminOrderDetail(id);

                console.log(
                    "ADMIN ORDER DETAIL:",
                    res
                );

                setOrder(
                    res?.data || null
                );

            } catch (error) {

                console.log(
                    "LOAD ORDER DETAIL ERROR:",
                    error
                );

            } finally {

                setLoading(false);
            }
        };

    // =========================
    // LOADING
    // =========================

    if (loading) {

        return (

            <div className="admin-order-detail-page">

                <h2>
                    Loading...
                </h2>

            </div>
        );
    }

    // =========================
    // NOT FOUND
    // =========================

    if (!order) {

        return (

            <div className="admin-order-detail-page">

                <h2>
                    Không tìm thấy đơn hàng
                </h2>

            </div>
        );
    }

    // =========================
    // RENDER
    // =========================

    return (

        <div className="admin-order-detail-page">

            {/* HEADER */}

            <div className="detail-header">

                <div>

                    <h1>
                        Đơn hàng
                        #{order.id}
                    </h1>

                    <p>
                        {
                            new Date(
                                order.created_at
                            ).toLocaleString()
                        }
                    </p>

                </div>

                <div
                    className={`status-badge ${order.status}`}
                >

                    {order.status}

                </div>

            </div>

            {/* CUSTOMER */}

            <div className="detail-card">

                <h3>
                    Thông tin khách hàng
                </h3>

                <div className="detail-grid">

                    <div>

                        <strong>
                            Họ tên:
                        </strong>

                        <p>
                            {order.customer_name}
                        </p>

                    </div>

                    <div>

                        <strong>
                            Số điện thoại:
                        </strong>

                        <p>
                            {order.phone}
                        </p>

                    </div>

                    <div>

                        <strong>
                            Địa chỉ:
                        </strong>

                        <p>
                            {order.address}
                        </p>

                    </div>

                </div>

            </div>

            {/* ORDER */}

            <div className="detail-card">

                <h3>
                    Thông tin thanh toán
                </h3>

                <div className="detail-grid">

                    <div>

                        <strong>
                            Phương thức:
                        </strong>

                        <p>
                            {order.payment_method}
                        </p>

                    </div>

                    <div>

                        <strong>
                            Thanh toán:
                        </strong>

                        <p>
                            {order.payment_status}
                        </p>

                    </div>

                </div>

            </div>

            {/* ITEMS */}

            <div className="detail-card">

                <h3>
                    Sản phẩm
                </h3>

                <div className="order-items">

                    {
                        order.items?.map((item) => (

                            <div
                                className="order-item"
                                key={item.id}
                            >

                                <div className="item-left">

                                    <h4>
                                        {
                                            item.product_name
                                        }
                                    </h4>

                                    <p>
                                        {
                                            item.variant_name
                                        }
                                    </p>

                                </div>

                                <div className="item-right">

                                    <span>

                                        x{item.quantity}

                                    </span>

                                    <strong>

                                        {
                                            Number(item.price)
                                                .toLocaleString()
                                        }đ

                                    </strong>

                                </div>

                            </div>

                        ))
                    }

                </div>

            </div>

            {/* TOTAL */}

            <div className="total-box">

                Tổng cộng:

                <span>

                    {
                        Number(order.total_price)
                            .toLocaleString()
                    }đ

                </span>

            </div>

        </div>

    );
}

export default OrderDetail;

