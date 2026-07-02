import {
    FaHome,
    FaBox,
    FaTags,
    FaBuilding,
    FaShoppingCart,
    FaUsers,
    FaSignOutAlt,
    FaTicketAlt,
    FaTag,
    FaChartLine,
    FaFileAlt
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

import socket from "../../socket";
import Swal from "sweetalert2";

function Sidebar() {

    const navigate = useNavigate();
    const location = useLocation();
    
    // State cho số lượng đơn hàng chờ (badge)
    const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

    // =========================
    // SOCKET REALTIME
    // =========================

    useEffect(() => {

        // =========================
        // NEW ORDER - HIỂN THỊ TOAST
        // =========================

        const handleNewOrder = (order) => {
            // Tăng số lượng đơn hàng chờ
            setPendingOrdersCount(prev => prev + 1);

            // Hiển thị toast thông báo
            Swal.fire({
                toast: true,
                position: "top-end",
                icon: "info",
                title: `🛒 Đơn hàng mới #${order.id}`,
                text: `${order.customer_name || "Khách hàng"} vừa đặt hàng`,
                showConfirmButton: false,
                timer: 10000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    // Thêm hiệu ứng click để chuyển đến trang đơn hàng
                    toast.onclick = () => {
                        navigate("/admin/orders");
                        setPendingOrdersCount(0); // Reset count khi vào trang đơn hàng
                        Swal.close();
                    };
                }
            });

            // Phát âm thanh thông báo (nếu muốn)
            try {
                const audio = new Audio("/notification.mp3");
                audio.play().catch(e => console.log("Audio không hỗ trợ"));
            } catch (error) {
                console.log("Lỗi phát âm thanh:", error);
            }

            // Thay đổi title để thu hút sự chú ý
            const originalTitle = document.title;
            document.title = "🔔 ĐƠN HÀNG MỚI! 🔔";
            setTimeout(() => {
                document.title = originalTitle;
            }, 5000);
        };

        socket.on("new_order", handleNewOrder);

        return () => {
            socket.off("new_order", handleNewOrder);
        };

    }, [navigate]);

    // Reset badge khi vào trang đơn hàng
    useEffect(() => {
        if (location.pathname === "/admin/orders") {
            setPendingOrdersCount(0);
        }
    }, [location.pathname]);

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
        // Dashboard: chỉ active khi chính xác /admin
        if (path === "/admin") {
            return location.pathname === "/admin";
        }
        
        // Reports: active cho tất cả các route con của /admin/reports
        if (path === "/admin/reports") {
            return location.pathname.startsWith("/admin/reports");
        }
        
        // Products: active cho product và product detail
        if (path === "/admin/products") {
            return location.pathname === "/admin/products" || 
                   location.pathname.startsWith("/admin/products/");
        }
        
        // Categories: active cho category và category detail
        if (path === "/admin/categories") {
            return location.pathname === "/admin/categories" || 
                   location.pathname.startsWith("/admin/categories/");
        }
        
        // Brands: active cho brand và brand detail
        if (path === "/admin/brands") {
            return location.pathname === "/admin/brands" || 
                   location.pathname.startsWith("/admin/brands/");
        }
        
        // Coupons: active cho coupons và create-coupon
        if (path === "/admin/coupons") {
            return location.pathname === "/admin/coupons" || 
                   location.pathname.startsWith("/admin/coupons/") ||
                   location.pathname === "/admin/create-coupon";
        }
        
        // Discounts: active cho discounts và create-discount
        if (path === "/admin/discounts") {
            return location.pathname === "/admin/discounts" || 
                   location.pathname.startsWith("/admin/discounts/") ||
                   location.pathname === "/admin/discounts/create";
        }
        
        // Orders: active cho orders và order detail
        if (path === "/admin/orders") {
            return location.pathname === "/admin/orders" || 
                   location.pathname.startsWith("/admin/orders/");
        }
        
        // Users: active cho users và user detail
        if (path === "/admin/users") {
            return location.pathname === "/admin/users" || 
                   location.pathname.startsWith("/admin/users/");
        }
        
        // Fallback: exact match
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
            DASHBOARD & REPORTS
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

            <MenuItem
                to="/admin/reports"
                icon={<FaChartLine />}
                text="Báo cáo chi tiết"
                active={isActive("/admin/reports")}
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
                active={isActive("/admin/coupons")}
            />

            <MenuItem
                to="/admin/discounts"
                icon={<FaTag />}
                text="Discount"
                active={isActive("/admin/discounts")}
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
                badge={pendingOrdersCount > 0 ? pendingOrdersCount : null}
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