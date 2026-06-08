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

import socket from "../../socket";
import Swal from "sweetalert2";

function Orders() {

    // =========================
    // STATES
    // =========================

    const [orders, setOrders] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [searchTerm, setSearchTerm] =
        useState("");

    const [statusFilter, setStatusFilter] =
        useState("all");

    // Bộ lọc tháng/năm
    const [monthFilter, setMonthFilter] = useState("all");
    const [yearFilter, setYearFilter] = useState("all");

    // Lấy danh sách năm có trong đơn hàng
    const getAvailableYears = () => {
        const years = orders.map(order => {
            if (order.created_at) {
                return new Date(order.created_at).getFullYear();
            }
            return null;
        }).filter(year => year !== null);
        
        return [...new Set(years)].sort((a, b) => b - a);
    };

    // Lấy danh sách tháng có trong đơn hàng theo năm được chọn
    const getAvailableMonths = () => {
        if (yearFilter === "all") return [];
        
        const months = orders.filter(order => {
            if (!order.created_at) return false;
            const orderYear = new Date(order.created_at).getFullYear();
            return orderYear === parseInt(yearFilter);
        }).map(order => {
            return new Date(order.created_at).getMonth() + 1;
        });
        
        return [...new Set(months)].sort((a, b) => a - b);
    };

    // =========================
    // NAVIGATE
    // =========================

    const navigate =
        useNavigate();

    // =========================
    // FETCH ORDERS
    // =========================

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

    // =========================
    // LOAD DATA + SOCKET
    // =========================

    useEffect(() => {

        fetchOrders();

        // ORDER CREATED

        const handleOrderCreated =
            (newOrder) => {

                console.log(
                    "SOCKET order_created:",
                    newOrder
                );

                setOrders((prev) => [

                    newOrder,
                    ...prev
                ]);
            };

        // ORDER UPDATED

        const handleOrderUpdated =
            (updatedOrder) => {

                console.log(
                    "SOCKET order_updated:",
                    updatedOrder
                );

                setOrders((prev) => {

                    return prev.map((order) => {

                        if (
                            Number(order.id)
                            ===
                            Number(updatedOrder.order_id)
                        ) {

                            return {
                                ...order,
                                status:
                                    updatedOrder.status,
                                payment_status:
                                    updatedOrder.payment_status,
                                shipping_provider:
                                    updatedOrder.shipping_provider,
                                tracking_code:
                                    updatedOrder.tracking_code
                            };
                        }

                        return order;
                    });
                });
            };

        // SOCKET LISTENERS

        socket.on(
            "order_created",
            handleOrderCreated
        );

        socket.on(
            "order_updated",
            handleOrderUpdated
        );

        // CLEANUP

        return () => {

            socket.off(
                "order_created",
                handleOrderCreated
            );

            socket.off(
                "order_updated",
                handleOrderUpdated
            );
        };

    }, []);

    // =========================
    // FORMAT PRICE
    // =========================

    const formatPrice =
        (price) => {

            return Number(price)
                .toLocaleString(
                    "vi-VN"
                ) + "đ";
        };

    // =========================
    // STATUS CLASS
    // =========================

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

                case "returned":
                    return "status returned";

                default:
                    return "status";
            }
        };

    // =========================
    // STATUS TEXT
    // =========================

    const getStatusText =
        (status) => {

            switch (status) {

                case "pending":
                    return "Chờ xác nhận";

                case "confirmed":
                    return "Đã xác nhận";

                case "shipping":
                    return "Đang giao";

                case "completed":
                    return "Hoàn thành";

                case "cancelled":
                    return "Đã huỷ";

                case "returned":
                    return "Hoàn hàng";

                case "return_requested":
                    return "Yêu cầu hoàn hàng";

                default:
                    return status;
            }
        };

    // =========================
    // NEXT STATUS
    // =========================

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

    // =========================
    // UPDATE STATUS
    // =========================

const handleChangeStatus =
    async (
        orderId,
        currentStatus
    ) => {

        const nextStatus =
            getNextStatus(
                currentStatus
            );

        // KHÔNG CÓ STATUS TIẾP THEO

        if (
            nextStatus ===
            currentStatus
        ) {

            return;
        }

        // MODAL XÁC NHẬN

        const result =
            await Swal.fire({

                title: "Xác nhận chuyển trạng thái",

                text:
                    `Bạn có muốn chuyển đơn hàng sang "${getStatusText(nextStatus)}" không?`,

                icon: "question",

                showCancelButton: true,

                confirmButtonText: "Đồng ý",

                cancelButtonText: "Huỷ",

                reverseButtons: true
            });

        // BẤM HUỶ

        if (!result.isConfirmed) {

            return;
        }

        try {

            if (nextStatus === "shipping") {
                const result = await Swal.fire({
                    title: "Thông tin vận chuyển",
html: `
    <div class="swal-form">
        <label for="shipping_provider">Đơn vị vận chuyển</label>
        <input id="shipping_provider" class="swal2-input" placeholder="GHN" />

        <label for="tracking_code">Mã vận đơn</label>
        <input id="tracking_code" class="swal2-input" placeholder="GHN123456789" />
    </div>
`,
                    showCancelButton: true,
                    confirmButtonText: "Xác nhận",
                    cancelButtonText: "Huỷ",
                    focusConfirm: false,
                    preConfirm: () => {
                        const shipping_provider = document.getElementById("shipping_provider").value;
                        const tracking_code = document.getElementById("tracking_code").value;

                        if (!shipping_provider || !tracking_code) {
                            Swal.showValidationMessage("Vui lòng nhập đầy đủ đơn vị vận chuyển và mã vận đơn.");
                        }

                        return {
                            status: "shipping",
                            shipping_provider,
                            tracking_code
                        };
                    }
                });

                if (!result.isConfirmed) {
                    return;
                }

                await updateOrderStatus(
                    orderId,
                    {
                        status: "shipping",
                        shipping_provider: result.value.shipping_provider,
                        tracking_code: result.value.tracking_code
                    }
                );
            } else {
                await updateOrderStatus(
                    orderId,
                    {
                        status: nextStatus
                    }
                );
            }

            // SUCCESS

            await Swal.fire({

                title: "Thành công",

                text:
                    `Đơn hàng đã chuyển sang "${getStatusText(nextStatus)}"`,

                icon: "success",

                confirmButtonText: "OK"
            });

        } catch (error) {

            console.log(
                "UPDATE STATUS ERROR:",
                error
            );

            // ERROR

            Swal.fire({

                title: "Thất bại",

                text:
                    "Cập nhật trạng thái thất bại",

                icon: "error",

                confirmButtonText: "OK"
            });
        }
    };
    // =========================
    // PAYMENT METHOD
    // =========================

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
                    return "Chuyển khoản";

                default:
                    return (
                        method
                        ||
                        "Không xác định"
                    );
            }
        };

    // =========================
    // FILTER ORDERS
    // =========================

    const filteredOrders =
        orders.filter((order) => {

            // Lọc theo từ khoá tìm kiếm
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

                getStatusText(order.status)
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

            // Lọc theo trạng thái
            const matchStatus =

                statusFilter ===
                "all"

                ||

                order.status ===
                statusFilter;

            // Lọc theo tháng và năm
            let matchDate = true;
            
            if (order.created_at) {
                const orderDate = new Date(order.created_at);
                const orderYear = orderDate.getFullYear();
                const orderMonth = orderDate.getMonth() + 1;
                
                if (yearFilter !== "all") {
                    matchDate = matchDate && (orderYear === parseInt(yearFilter));
                }
                
                if (monthFilter !== "all" && yearFilter !== "all") {
                    matchDate = matchDate && (orderMonth === parseInt(monthFilter));
                }
            } else if (yearFilter !== "all" || monthFilter !== "all") {
                matchDate = false;
            }

            return (
                matchKeyword
                &&
                matchStatus
                &&
                matchDate
            );
        });

    // =========================
    // LOADING
    // =========================

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

            {/* ========================= */}
            {/* TOOLBAR */}
            {/* ========================= */}

            <div className="orders-toolbar">

                {/* 1. TÌM KIẾM - TRÊN CÙNG */}

                <div className="search-section">

                    <div className="search-box">

                        <FaSearch />

                        <input
                            type="text"
                            placeholder="Tìm kiếm mã đơn, tên khách hàng, SĐT..."
                            value={searchTerm}
                            onChange={(e) =>
                                setSearchTerm(
                                    e.target.value
                                )
                            }
                        />

                    </div>

                </div>

                {/* 2. LỌC THEO TRẠNG THÁI - Ở GIỮA */}

                <div className="filter-section">

                    <div className="filter-label">
                        📌 Lọc theo trạng thái
                    </div>

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

                        <button
                            className={
                                statusFilter === "cancelled"
                                    ? "filter-btn active"
                                    : "filter-btn"
                            }
                            onClick={() =>
                                setStatusFilter(
                                    "cancelled"
                                )
                            }
                        >
                            Đã huỷ
                        </button>

                        <button
                            className={
                                statusFilter === "returned"
                                    ? "filter-btn active"
                                    : "filter-btn"
                            }
                            onClick={() =>
                                setStatusFilter(
                                    "returned"
                                )
                            }
                        >
                            Hoàn hàng
                        </button>

                    </div>

                </div>

                {/* 3. LỌC THEO THÁNG - NĂM - DƯỚI CÙNG */}

                <div className="filter-section">

                    <div className="filter-label">
                        📅 Lọc theo thời gian
                    </div>

                    <div className="date-filters">

                        <select
                            className="date-filter-select"
                            value={yearFilter}
                            onChange={(e) => {
                                setYearFilter(e.target.value);
                                setMonthFilter("all");
                            }}
                        >
                            <option value="all">📆 Tất cả năm</option>
                            {getAvailableYears().map(year => (
                                <option key={year} value={year}>
                                    Năm {year}
                                </option>
                            ))}
                        </select>

                        <select
                            className="date-filter-select"
                            value={monthFilter}
                            onChange={(e) => setMonthFilter(e.target.value)}
                            disabled={yearFilter === "all"}
                        >
                            <option value="all">📅 Tất cả tháng</option>
                            {getAvailableMonths().map(month => (
                                <option key={month} value={month}>
                                    Tháng {month}
                                </option>
                            ))}
                        </select>

                    </div>

                </div>

            </div>

            {/* ========================= */}
            {/* TABLE */}
            {/* ========================= */}

            <div className="orders-table-wrapper">

                <table className="orders-table">

                    <thead>

                    <tr>

                        <th>STT</th>

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

                            filteredOrders.map((order, index) => (

                                <tr key={order.id}>

                                    {/* STT */}

                                    <td>
                                        {index + 1}
                                    </td>

                                    {/* MÃ ĐƠN */}

                                    <td className="order-id">
                                        #{order.id}
                                    </td>

                                    {/* CUSTOMER */}

                                    <td>
                                        {order.customer_name || "—"}
                                    </td>

                                    {/* PHONE */}

                                    <td>
                                        {order.phone || "—"}
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
                                                getStatusText(
                                                    order.status
                                                )
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
                                    colSpan="9"
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