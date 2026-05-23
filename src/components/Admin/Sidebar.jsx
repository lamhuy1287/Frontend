import {
    FaHome,
    FaBox,
    FaTags,
    FaBuilding,
    FaShoppingCart,
    FaUsers,
    FaSignOutAlt
} from "react-icons/fa";

import { Link, useLocation, useNavigate } from "react-router-dom";

function Sidebar() {

    const navigate = useNavigate();

    const location = useLocation();

    const handleLogout = () => {

        localStorage.removeItem("token");

        localStorage.removeItem("user");

        navigate("/");
    };

    const isActive = (path) => {

        return location.pathname === path;
    };

    return (

        <div
            style={{
                width: "270px",
                height: "100vh",
                background: "#111827",
                color: "white",
                padding: "25px",
                overflowY: "auto"
            }}
        >

            {/* LOGO */}
            <div style={{ marginBottom: "40px" }}>

                <h1
                    style={{
                        color: "#60A5FA"
                    }}
                >
                    Hobby Corner
                </h1>

                <p
                    style={{
                        color: "#9CA3AF"
                    }}
                >
                    Admin Dashboard
                </p>

            </div>

            {/* DASHBOARD */}
            <MenuItem
                to="/admin"
                icon={<FaHome />}
                text="Dashboard"
                active={isActive("/admin")}
            />

            {/* PRODUCT */}
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

            {/* ORDER */}
            <div style={groupTitle}>
                ĐƠN HÀNG
            </div>

            <MenuItem
                to="/admin/orders"
                icon={<FaShoppingCart />}
                text="Đơn hàng"
                active={isActive("/admin/orders")}
            />

            {/* USER */}
            <div style={groupTitle}>
                NGƯỜI DÙNG
            </div>

            <MenuItem
                to="/admin/users"
                icon={<FaUsers />}
                text="Người dùng"
                active={isActive("/admin/users")}
            />

            {/* LOGOUT */}
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

function MenuItem({
    to,
    icon,
    text,
    active
}) {

    return (

        <Link
            to={to}
            style={{
                ...menuStyle,
                background: active
                    ? "#2563EB"
                    : "#1F2937"
            }}
        >

            {icon}

            {text}

        </Link>
    );
}

const menuStyle = {
    display: "flex",
    alignItems: "center",
    gap: "12px",

    padding: "14px 16px",

    borderRadius: "14px",

    color: "white",

    textDecoration: "none",

    marginBottom: "12px",

    transition: "0.3s"
};

const groupTitle = {
    color: "#9CA3AF",

    fontSize: "13px",

    marginTop: "30px",

    marginBottom: "15px",

    fontWeight: "bold"
};

const logoutStyle = {
    width: "100%",

    marginTop: "40px",

    padding: "14px",

    border: "none",

    borderRadius: "14px",

    background: "#DC2626",

    color: "white",

    cursor: "pointer",

    display: "flex",

    alignItems: "center",

    justifyContent: "center",

    gap: "10px"
};

export default Sidebar;