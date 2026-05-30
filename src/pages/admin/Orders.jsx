
import "./Orders.css";

import {
    FaSearch,
    FaEye
} from "react-icons/fa";

import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    getAllOrders,
    updateOrderStatus
} from "../../services/orderService";

function Orders() {


    // STATES


    const [orders,
        setOrders] =
        useState([]);

    const [loading,
        setLoading] =
        useState(true);

    const [searchTerm,
        setSearchTerm] =
        useState("");

    const [statusFilter,
        setStatusFilter] =
        useState("all");


    // NAVIGATE


    const navigate =
        useNavigate();

   
    //FETCH ORDERS
  

    const fetchOrders =
        async () => {

            try {

                const response =
                    await getAllOrders();

                console.log(
                    "ORDERS:",
                    response
                );

                setOrders(
                    response.data || []
                );

            } catch (error) {

                console.log(
                    "LOAD ORDERS ERROR:",
                    error
                );

            } finally {

                setLoading(false);
            }
        };

    // LOAD DATA
   

    useEffect(() => {

        fetchOrders();

    }, []);

   // FORMAT PRICE


    const formatPrice =
        (price) => {

            return Number(price)
                .toLocaleString(
                    "vi-VN"
                ) + "đ";
        };


    //ORDER STATUS
  

    const getStatusClass =
        (status) => {

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

  // NEXT STATUS
     

    const getNextStatus =
        (currentStatus) => {

            switch (currentStatus) {

                case "pending":
                    return "confirmed";

                case "confirmed":
                    return "shipping";

                case "shipping":
                    return "completed";

                default:
                    return currentStatus;
            }
        };

 // UPDATE STATUS
   


const handleChangeStatus =
    async (
        orderId,
        currentStatus
    ) => {

        const nextStatus =
            getNextStatus(
                currentStatus
            );

        if (
            nextStatus ===
            currentStatus
        ) {

            return;
        }

        try {

            await updateOrderStatus(
                orderId,
                nextStatus
            );

            // reload data thật

            fetchOrders();

        } catch (error) {

            console.log(
                "UPDATE STATUS ERROR:",
                error
            );
        }
    };



 // PAYMENT METHOD


    const getPaymentMethodText =
        (method) => {

            switch (method) {

                case "cod":
                    return "COD";

                case "vnpay":
                    return "VNPay";

                case "momo":
                    return "MoMo";

                case "bank_transfer":
                    return "Bank";

                default:
                    return (
                        method
                        ||
                        "Không xác định"
                    );
            }
        };

//FILTER ORDERS


    const filteredOrders =
        orders.filter((order) => {

            const keyword =
                searchTerm
                    .trim()
                    .toLowerCase();

            const matchKeyword = (

                String(order.id)
                    .includes(keyword)

                ||

                (
                    order.customer_name
                    || ""
                )
                    .toLowerCase()
                    .includes(keyword)

                ||

                (
                    order.phone
                    || ""
                )
                    .toLowerCase()
                    .includes(keyword)

                ||

                (
                    order.status
                    || ""
                )
                    .toLowerCase()
                    .includes(keyword)

                ||

                (
                    order.payment_method
                    || ""
                )
                    .toLowerCase()
                    .includes(keyword)
            );

            const matchStatus =

                statusFilter ===
                "all"

                ||

                order.status ===
                statusFilter;

            return (
                matchKeyword
                &&
                matchStatus
            );
        });

// LOADING


    if (loading) {

        return (

            <div className="orders-loading">

                Đang tải đơn hàng...

            </div>
        );
    }

    return (

        <div className="orders-page">

            {/* HEADER */}

            <div className="orders-header">

                <div>

                    <h1>
                        Quản lý đơn hàng
                    </h1>

                    <p>
                        Quản lý toàn bộ đơn hàng
                    </p>

                </div>

            </div>

            {/* TOOLBAR */}

            <div className="orders-toolbar">

                {/* SEARCH */}

                <div className="search-box">

                    <FaSearch />

                    <input
                        type="text"
                        placeholder="Tìm kiếm mã đơn, tên, SĐT..."
                        value={searchTerm}
                        onChange={(e) =>
                            setSearchTerm(
                                e.target.value
                            )
                        }
                    />

                </div>

                {/* FILTERS */}

                <div className="status-filters">

                    <button
                        className={
                            statusFilter === "all"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setStatusFilter("all")
                        }
                    >
                        Tất cả
                    </button>

                    <button
                        className={
                            statusFilter === "pending"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setStatusFilter(
                                "pending"
                            )
                        }
                    >
                        Chờ xác nhận
                    </button>

                    <button
                        className={
                            statusFilter === "confirmed"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setStatusFilter(
                                "confirmed"
                            )
                        }
                    >
                        Đã xác nhận
                    </button>

                    <button
                        className={
                            statusFilter === "shipping"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setStatusFilter(
                                "shipping"
                            )
                        }
                    >
                        Đang giao
                    </button>

                    <button
                        className={
                            statusFilter === "completed"
                                ? "filter-btn active"
                                : "filter-btn"
                        }
                        onClick={() =>
                            setStatusFilter(
                                "completed"
                            )
                        }
                    >
                        Hoàn thành
                    </button>

                </div>

            </div>

            {/* TABLE */}

            <div className="orders-table-wrapper">

                <table className="orders-table">

                    <thead>

                    <tr>

                        <th>Mã đơn</th>

                        <th>Khách hàng</th>

                        <th>SĐT</th>

                        <th>Tổng tiền</th>

                        <th>Hình thức</th>

                        <th>Trạng thái</th>

                        <th>Ngày tạo</th>

                        <th>Hành động</th>

                    </tr>

                    </thead>

                    <tbody>

                    {
                        filteredOrders.length > 0 ? (

                            filteredOrders.map((order) => (

                                <tr key={order.id}>

                                    {/* ID */}

                                    <td>
                                        #{order.id}
                                    </td>

                                    {/* CUSTOMER */}

                                    <td>
                                        {
                                            order.customer_name
                                        }
                                    </td>

                                    {/* PHONE */}

                                    <td>
                                        {order.phone}
                                    </td>

                                    {/* PRICE */}

                                    <td className="price">

                                        {
                                            formatPrice(
                                                order.total_price
                                            )
                                        }

                                    </td>

                                    {/* PAYMENT */}

                                    <td className="payment-method-cell">

                                        <span className="payment-method-badge">

                                            {
                                                getPaymentMethodText(
                                                    order.payment_method
                                                )
                                            }

                                        </span>

                                    </td>

                                    {/* STATUS */}

                                    <td>

                                        <button
                                            className={
                                                getStatusClass(
                                                    order.status
                                                )
                                            }
                                            onClick={() =>
                                                handleChangeStatus(
                                                    order.id,
                                                    order.status
                                                )
                                            }
                                        >

                                            {
                                                order.status
                                            }

                                        </button>

                                    </td>

                                    {/* DATE */}

                                    <td>

                                        {
                                            new Date(
                                                order.created_at
                                            )
                                                .toLocaleDateString(
                                                    "vi-VN"
                                                )
                                        }

                                    </td>

                                    {/* ACTION */}

                                    <td>

                                        <button
                                            className="view-btn"
                                            onClick={() =>
                                                navigate(
                                                    `/admin/orders/${order.id}`
                                                )
                                            }
                                        >

                                            <FaEye />

                                        </button>

                                    </td>

                                </tr>

                            ))

                        ) : (

                            <tr>

                                <td
                                    colSpan="8"
                                    className="empty-orders"
                                >

                                    Không tìm thấy đơn hàng

                                </td>

                            </tr>

                        )
                    }

                    </tbody>

                </table>

            </div>

        </div>
    );
}

export default Orders;

