import {
    useEffect,
    useState
} from "react";

import {
    useParams
} from "react-router-dom";

import CustomerLayout
    from "../../layouts/CustomerLayout";

import {
    getOrderDetail
} from "../../services/orderService";

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

            fetchOrderDetail();
        }

    }, [id]);

    // =========================
    // FETCH DETAIL
    // =========================

    const fetchOrderDetail =
        async () => {

            try {

                setLoading(true);

                const res =
                    await getOrderDetail(id);

                console.log(
                    "ORDER DETAIL:",
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

            <CustomerLayout>

                <div
                    style={{
                        padding: "40px"
                    }}
                >

                    <h2>
                        Loading...
                    </h2>

                </div>

            </CustomerLayout>
        );
    }

    // =========================
    // NOT FOUND
    // =========================

    if (!order) {

        return (

            <CustomerLayout>

                <div
                    style={{
                        padding: "40px"
                    }}
                >

                    <h2>
                        Không tìm thấy đơn hàng
                    </h2>

                </div>

            </CustomerLayout>
        );
    }

    // =========================
    // RENDER
    // =========================

    return (

        <CustomerLayout>

            <div className="order-detail-page">

                <h1>
                    Chi tiết đơn hàng
                    #{order.id}
                </h1>

                {/* CUSTOMER */}

                <div className="detail-card">

                    <h3>
                        Thông tin nhận hàng
                    </h3>

                    <p>
                        <strong>
                            Người nhận:
                        </strong>

                        {" "}
                        {order.customer_name}
                    </p>

                    <p>
                        <strong>
                            Số điện thoại:
                        </strong>

                        {" "}
                        {order.phone}
                    </p>

                    <p>
                        <strong>
                            Địa chỉ:
                        </strong>

                        {" "}
                        {order.address}
                    </p>

                </div>

                {/* ORDER INFO */}

                <div className="detail-card">

                    <h3>
                        Thông tin đơn hàng
                    </h3>

                    <p>
                        <strong>
                            Trạng thái:
                        </strong>

                        {" "}
                        {order.status}
                    </p>

                    <p>
                        <strong>
                            Thanh toán:
                        </strong>

                        {" "}
                        {order.payment_method}
                    </p>

                    <p>
                        <strong>
                            Trạng thái thanh toán:
                        </strong>

                        {" "}
                        {order.payment_status}
                    </p>

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

                                    <div>

                                        <h4>
                                            {item.product_name}
                                        </h4>

                                        <p>
                                            {item.variant_name}
                                        </p>

                                    </div>

                                    <div>

                                        x{item.quantity}

                                    </div>

                                    <div>

                                        {
                                            Number(item.price)
                                                .toLocaleString()
                                        }đ

                                    </div>

                                </div>

                            ))
                        }

                    </div>

                </div>

                {/* TOTAL */}

                <div className="order-total-box">

                    Tổng tiền:

                    <span>

                        {
                            Number(order.total_price)
                                .toLocaleString()
                        }đ

                    </span>

                </div>

            </div>

        </CustomerLayout>

    );
}

export default OrderDetail;

