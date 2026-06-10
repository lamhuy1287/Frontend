import { useEffect, useState } from "react";
import { getUsers, searchUsers, getUserDetail } from "../../services/adminService";
import "./Users.css";

import { FaEye } from "react-icons/fa";



function Users() {

    // =========================
    // STATES
    // =========================

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 10,
        total: 0,
        pages: 1
    });
    const [sortBy, setSortBy] = useState("successful_orders");
    const [sortOrder, setSortOrder] = useState("desc");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedUser, setSelectedUser] = useState(null);
    const [showModal, setShowModal] = useState(false);

    // =========================
    // FETCH USERS
    // =========================

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            setError("");

            let response;
            if (searchKeyword.trim()) {
                response = await searchUsers(searchKeyword, page, pagination.limit);
            } else {
                response = await getUsers(page, pagination.limit, sortBy, sortOrder);
            }

            if (response.success) {
                setUsers(response.data.items);
                setPagination({
                    page: response.data.page,
                    limit: response.data.limit,
                    total: response.data.total,
                    pages: response.data.pages
                });
            } else {
                setError(response.message || "Không thể tải dữ liệu");
            }
        } catch (err) {
            setError(err.response?.data?.message || "Có lỗi xảy ra");
        } finally {
            setLoading(false);
        }
    };

    // Load khi sort hoặc search thay đổi
    useEffect(() => {
        fetchUsers(1);
    }, [sortBy, sortOrder, searchKeyword]);

    // =========================
    // XEM CHI TIẾT USER
    // =========================

    const handleViewDetail = async (userId) => {
        try {
            setLoading(true);
            const response = await getUserDetail(userId);
            if (response.success) {
                setSelectedUser(response.data);
                setShowModal(true);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError("Không thể tải chi tiết người dùng");
        } finally {
            setLoading(false);
        }
    };

    // =========================
    // ĐỔI SẮP XẾP
    // =========================

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === "desc" ? "asc" : "desc");
        } else {
            setSortBy(column);
            setSortOrder("desc");
        }
    };

    // =========================
    // RENDER BADGE HẠNG
    // =========================

const renderRankBadge = (orders, totalSpent) => {
    if (orders >= 30 || totalSpent >= 10000000) {
        return <span className="rank-gold">🏆 VIP</span>;
    }
    if (orders >= 10 || totalSpent >= 3000000) {
        return <span className="rank-silver">⭐ Thân thiết</span>;
    }
    if (orders >= 3 || totalSpent >= 500000) {
        return <span className="rank-bronze">✨ Thường</span>;
    }
    return <span className="rank-normal">Mới</span>;
};

    // =========================
    // RENDER STATUS ĐƠN HÀNG
    // =========================

    const renderOrderStatus = (status) => {
        const statusMap = {
            pending: { text: "Chờ xử lý", class: "status-pending" },
            confirmed: { text: "Đã xác nhận", class: "status-confirmed" },
            shipping: { text: "Đang giao", class: "status-shipping" },
            completed: { text: "Hoàn thành", class: "status-completed" },
            cancelled: { text: "Đã hủy", class: "status-cancelled" },
            return_requested: { text: "Yêu cầu trả hàng", class: "status-return" }
        };
        const s = statusMap[status] || { text: status, class: "status-default" };
        return <span className={`order-status ${s.class}`}>{s.text}</span>;
    };

    // =========================
    // RENDER
    // =========================

    return (
        <div className="users-management">
            {/* HEADER */}
            <div className="users-header">
                <div>
                    <h1>Quản lý người dùng</h1>
                    <p>Danh sách khách hàng và thống kê đơn hàng</p>
                </div>
            </div>

            {/* SEARCH */}
            <div className="users-search">
                <input
                    type="text"
                    placeholder="Tìm kiếm theo tên, email hoặc số điện thoại..."
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    className="search-input"
                />
                <button 
                    className="search-btn"
                    onClick={() => fetchUsers(1)}
                >
                    🔍 Tìm kiếm
                </button>
                {searchKeyword && (
                    <button 
                        className="clear-btn"
                        onClick={() => setSearchKeyword("")}
                    >
                        ✕ Xóa
                    </button>
                )}
            </div>

            {/* ERROR */}
            {error && (
                <div className="users-error">
                    {error}
                </div>
            )}

            {/* TABLE */}
            {loading && !users.length ? (
                <div className="users-loading">Đang tải...</div>
            ) : (
                <>
                    <div className="users-table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th onClick={() => handleSort("name")}>
                                        Tên khách hàng
                                        {sortBy === "name" && (sortOrder === "desc" ? " ↓" : " ↑")}
                                    </th>
                                    <th onClick={() => handleSort("email")}>
                                        Email
                                        {sortBy === "email" && (sortOrder === "desc" ? " ↓" : " ↑")}
                                    </th>
                                    <th>Số điện thoại</th>
                                    <th onClick={() => handleSort("successful_orders")}>
                                        Đơn thành công
                                        {sortBy === "successful_orders" && (sortOrder === "desc" ? " ↓" : " ↑")}
                                    </th>
                                    <th onClick={() => handleSort("total_spent")}>
                                        Tổng chi tiêu
                                        {sortBy === "total_spent" && (sortOrder === "desc" ? " ↓" : " ↑")}
                                    </th>
                                    <th>Hạng</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="empty-row">
                                            Không có dữ liệu
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((user, index) => (
                                        <tr key={user.id}>
                                            <td className="user-name">
                                                {user.name}
                                                {index === 0 && sortBy === "successful_orders" && sortOrder === "desc" && (
                                                    <span className="top-rank">🥇</span>
                                                )}
                                                {index === 1 && sortBy === "successful_orders" && sortOrder === "desc" && (
                                                    <span className="top-rank">🥈</span>
                                                )}
                                                {index === 2 && sortBy === "successful_orders" && sortOrder === "desc" && (
                                                    <span className="top-rank">🥉</span>
                                                )}
                                            </td>
                                            <td>{user.email}</td>
                                            <td>{user.phone || "Chưa cập nhật"}</td>
                                            <td className="order-count">
                                                <span className="count-badge">
                                                    {user.successful_orders}
                                                </span>
                                            </td>
                                            <td className="total-spent">
                                                {user.total_spent.toLocaleString("vi-VN")}đ
                                            </td>
                                            <td>{renderRankBadge(user.successful_orders)}</td>

<td>
    <button
        className="view-detail-btn"
        onClick={() => handleViewDetail(user.id)}
    >
        <FaEye />
    </button>
</td>


                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* PAGINATION */}
                    {pagination.pages > 1 && (
                        <div className="users-pagination">
                            <button
                                className="page-btn"
                                onClick={() => fetchUsers(pagination.page - 1)}
                                disabled={pagination.page === 1}
                            >
                                « Trước
                            </button>
                            
                            <div className="page-numbers">
                                {[...Array(pagination.pages)].map((_, i) => {
                                    const pageNum = i + 1;
                                    if (
                                        pageNum === 1 ||
                                        pageNum === pagination.pages ||
                                        (pageNum >= pagination.page - 2 && pageNum <= pagination.page + 2)
                                    ) {
                                        return (
                                            <button
                                                key={pageNum}
                                                className={`page-number ${pagination.page === pageNum ? "active" : ""}`}
                                                onClick={() => fetchUsers(pageNum)}
                                            >
                                                {pageNum}
                                            </button>
                                        );
                                    }
                                    if (pageNum === pagination.page - 3 || pageNum === pagination.page + 3) {
                                        return <span key={pageNum} className="page-dots">...</span>;
                                    }
                                    return null;
                                })}
                            </div>
                            
                            <button
                                className="page-btn"
                                onClick={() => fetchUsers(pagination.page + 1)}
                                disabled={pagination.page === pagination.pages}
                            >
                                Sau »
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* MODAL CHI TIẾT USER */}
            {showModal && selectedUser && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2>Chi tiết khách hàng</h2>
                            <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
                        </div>
                        
                        <div className="modal-body">
                            {/* THÔNG TIN CƠ BẢN */}
                            <div className="user-info-section">
                                <h3>Thông tin cá nhân</h3>
                                <div className="info-row">
                                    <span className="info-label">Họ tên:</span>
                                    <span className="info-value">{selectedUser.name}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Email:</span>
                                    <span className="info-value">{selectedUser.email}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Số điện thoại:</span>
                                    <span className="info-value">{selectedUser.phone || "Chưa cập nhật"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Địa chỉ:</span>
                                    <span className="info-value">{selectedUser.address || "Chưa cập nhật"}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Ngày tham gia:</span>
                                    <span className="info-value">
                                        {new Date(selectedUser.created_at).toLocaleDateString("vi-VN")}
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Tổng đơn thành công:</span>
                                    <span className="info-value highlight">
                                        {selectedUser.successful_orders} đơn
                                    </span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Tổng đơn hàng:</span>
                                    <span className="info-value">
                                        {selectedUser.total_orders} đơn
                                    </span>
                                </div>
                            </div>

                            {/* LỊCH SỬ ĐƠN HÀNG */}
                            <div className="order-history-section">
                                <h3>Lịch sử mua hàng</h3>
                                {selectedUser.orders.length === 0 ? (
                                    <p className="empty-orders">Chưa có đơn hàng nào</p>
                                ) : (
                                    <table className="order-history-table">
                                        <thead>
                                            <tr>
                                                <th>Tên khách hàng</th>
                                                <th>Tổng tiền</th>
                                                <th>Trạng thái</th>
                                                <th>Phương thức</th>
                                                <th>Ngày đặt</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedUser.orders.map((order) => (
                                                <tr key={order.id}>
                                                    <td>{order.customer_name || `#${order.id}`}</td>
                                                    <td className="order-total">
                                                        {order.total_price.toLocaleString("vi-VN")}đ
                                                    </td>
                                                    <td>{renderOrderStatus(order.status)}</td>
                                                    <td>
                                                        {order.payment_method === "cod" ? "COD" :
                                                         order.payment_method === "vnpay" ? "VNPAY" :
                                                         order.payment_method === "momo" ? "MOMO" :
                                                         order.payment_method === "bank_transfer" ? "Chuyển khoản" :
                                                         order.payment_method}
                                                    </td>
                                                    <td>{new Date(order.created_at).toLocaleDateString("vi-VN")}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Users;