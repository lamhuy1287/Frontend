import {
    FaHome,
    FaBox,
    FaTags,
    FaBuilding,
    FaShoppingCart,
    FaUsers,
    FaSignOutAlt,
    FaTicketAlt
} from "react-icons/fa";

import {
    Link,
    useLocation,
    useNavigate
} from "react-router-dom";

import {
    useEffect,
    useState
} from "react";

import {
    getAllOrders
} from "../../services/orderService";

import socket from "../../socket";

function Sidebar() {

    const navigate = useNavigate();

    const location = useLocation();

    // =========================
    // STATE
    // =========================

    const [pendingCount, setPendingCount] = useState(0);

    // =========================
    // FETCH PENDING ORDERS
    // =========================

    const fetchPendingOrders = async () => {

        try {

            const response = await getAllOrders();

            const orders = response.data || [];

            if (!Array.isArray(orders)) {

                console.log("Orders không phải mảng:", orders);

                setPendingCount(0);

                return;
            }

            const pendingOrders = orders.filter(
                (order) => order.status === "pending"
            );

            setPendingCount(pendingOrders.length);

        } catch (error) {

            console.log(
                "LOAD PENDING ORDERS ERROR:",
                error
            );

            setPendingCount(0);
        }
    };

    // =========================
    // SOCKET REALTIME
    // =========================

    useEffect(() => {

        fetchPendingOrders();

        socket.on("order_updated", () => {
            fetchPendingOrders();
        });

        socket.on("new_order", () => {
            fetchPendingOrders();
        });

        return () => {

            socket.off("order_updated");

            socket.off("new_order");
        };

    }, []);

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/");
    };

    // =========================
    // ACTIVE
    // =========================

    const isActive = (path) => {

        return location.pathname === path;
    };

    return (

        <div style={sidebarStyle}>

            {/* =========================
            LOGO
            ========================= */}

            <div style={logoWrapper}>

                <h1 style={logoText}>
                    Hobby Corner
                </h1>

                <p style={logoSubText}>
                    Admin Dashboard
                </p>

            </div>

            {/* =========================
            DASHBOARD
            ========================= */}

            <div style={groupTitle}>
                TỔNG QUAN
            </div>

            <MenuItem
                to="/admin"
                icon={<FaHome />}
                text="Dashboard"
                active={isActive("/admin")}
            />

            {/* =========================
            PRODUCT
            ========================= */}

            <div style={groupTitle}>
                QUẢN LÝ SẢN PHẨM
            </div>

            <MenuItem
                to="/admin/categories"
                icon={<FaTags />}
                text="Danh mục"
                active={isActive("/admin/categories")}
            />

            <MenuItem
                to="/admin/brands"
                icon={<FaBuilding />}
                text="Hãng"
                active={isActive("/admin/brands")}
            />

            <MenuItem
                to="/admin/products"
                icon={<FaBox />}
                text="Sản phẩm"
                active={isActive("/admin/products")}
            />

            {/* =========================
            COUPON
            ========================= */}

            <div style={groupTitle}>
                KHUYẾN MÃI
            </div>

            <MenuItem
                to="/admin/coupons"
                icon={<FaTicketAlt />}
                text="Mã giảm giá"
                active={
                    isActive("/admin/coupons") ||
                    isActive("/admin/create-coupon")
                }
            />

            {/* =========================
            ORDER
            ========================= */}

            <div style={groupTitle}>
                ĐƠN HÀNG
            </div>

            <MenuItem
                to="/admin/orders"
                icon={<FaShoppingCart />}
                text="Đơn hàng"
                active={isActive("/admin/orders")}
                badge={
                    pendingCount > 0
                        ? String(pendingCount)
                        : null
                }
            />

            {/* =========================
            USER
            ========================= */}

            <div style={groupTitle}>
                NGƯỜI DÙNG
            </div>

            <MenuItem
                to="/admin/users"
                icon={<FaUsers />}
                text="Người dùng"
                active={isActive("/admin/users")}
            />

            {/* =========================
            LOGOUT
            ========================= */}

            <button
                onClick={handleLogout}
                style={logoutStyle}
            >

                <FaSignOutAlt />

                Đăng xuất

            </button>

        </div>
    );
}

export default Sidebar;

// =======================================
// MENU ITEM
// =======================================

function MenuItem({
    to,
    icon,
    text,
    active,
    badge
}) {

    return (

        <Link
            to={to}
            style={{
                ...menuItemStyle,
                background: active
                    ? "#2563EB"
                    : "transparent",
                color: active
                    ? "white"
                    : "#D1D5DB"
            }}
        >

            <div style={menuLeft}>

                <span style={{ fontSize: "18px" }}>
                    {icon}
                </span>

                <span>
                    {text}
                </span>

            </div>

            {
                badge && (
                    <span style={badgeStyle}>
                        {badge}
                    </span>
                )
            }

        </Link>
    );
}

// =======================================
// STYLES
// =======================================

const sidebarStyle = {
    width: "270px",
    height: "100vh",
    background: "#111827",
    color: "white",
    padding: "25px",
    overflowY: "auto",
    display: "flex",
    flexDirection: "column"
};

const logoWrapper = {
    marginBottom: "35px"
};

const logoText = {
    color: "#60A5FA",
    fontSize: "28px",
    fontWeight: "800"
};

const logoSubText = {
    color: "#9CA3AF",
    marginTop: "5px",
    fontSize: "14px"
};

const groupTitle = {
    color: "#6B7280",
    fontSize: "12px",
    fontWeight: "700",
    marginTop: "25px",
    marginBottom: "12px",
    letterSpacing: "1px"
};

const menuItemStyle = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "14px",
    textDecoration: "none",
    marginBottom: "10px",
    transition: "0.3s",
    fontWeight: "600"
};

const menuLeft = {
    display: "flex",
    alignItems: "center",
    gap: "14px"
};

const badgeStyle = {
    background: "#EF4444",
    color: "white",
    minWidth: "24px",
    height: "24px",
    borderRadius: "999px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    fontWeight: "bold",
    padding: "0 8px"
};

const logoutStyle = {
    marginTop: "auto",
    background: "#DC2626",
    color: "white",
    border: "none",
    padding: "15px",
    borderRadius: "14px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    fontWeight: "700",
    fontSize: "15px"
};