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
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import socket from "../../socket";
import Swal from "sweetalert2";

function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // ===== SOCKET REALTIME =====
  useEffect(() => {
    const handleNewOrder = (order) => {
      setPendingOrdersCount((prev) => prev + 1);

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
          toast.onclick = () => {
            navigate("/admin/orders");
            setPendingOrdersCount(0);
            Swal.close();
          };
        },
      });

      try {
        const audio = new Audio("/notification.mp3");
        audio.play().catch(() => {});
      } catch (error) {}

      const originalTitle = document.title;
      document.title = "🔔 ĐƠN HÀNG MỚI! 🔔";
      setTimeout(() => {
        document.title = originalTitle;
      }, 5000);
    };

    socket.on("new_order", handleNewOrder);
    return () => socket.off("new_order", handleNewOrder);
  }, [navigate]);

  // Reset badge khi vào trang đơn hàng
  useEffect(() => {
    if (location.pathname === "/admin/orders") {
      setPendingOrdersCount(0);
    }
  }, [location.pathname]);

  // Đóng sidebar khi chuyển trang trên mobile
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // ===== LOGOUT =====
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  // ===== ACTIVE =====
  const isActive = (path) => {
    if (path === "/admin") return location.pathname === "/admin";
    if (path === "/admin/reports") return location.pathname.startsWith("/admin/reports");
    if (path === "/admin/products") return location.pathname === "/admin/products" || location.pathname.startsWith("/admin/products/");
    if (path === "/admin/categories") return location.pathname === "/admin/categories" || location.pathname.startsWith("/admin/categories/");
    if (path === "/admin/brands") return location.pathname === "/admin/brands" || location.pathname.startsWith("/admin/brands/");
    if (path === "/admin/coupons") return location.pathname === "/admin/coupons" || location.pathname.startsWith("/admin/coupons/") || location.pathname === "/admin/create-coupon";
    if (path === "/admin/discounts") return location.pathname === "/admin/discounts" || location.pathname.startsWith("/admin/discounts/") || location.pathname === "/admin/discounts/create";
    if (path === "/admin/orders") return location.pathname === "/admin/orders" || location.pathname.startsWith("/admin/orders/");
    if (path === "/admin/users") return location.pathname === "/admin/users" || location.pathname.startsWith("/admin/users/");
    return location.pathname === path;
  };

  // ===== TOGGLE =====
  const toggleSidebar = () => setIsMobileOpen((prev) => !prev);

  return (
    <>
      {/* Inject CSS */}
      <style>{styles}</style>

      {/* Mobile Toggle Button */}
      <button className="sidebar-toggle" onClick={toggleSidebar}>
        {isMobileOpen ? <FaTimes /> : <FaBars />}
      </button>

      {/* Overlay (mobile) */}
      {isMobileOpen && <div className="sidebar-overlay" onClick={toggleSidebar} />}

      {/* Sidebar */}
      <div className={`sidebar ${isMobileOpen ? "open" : ""}`}>
        {/* LOGO */}
        <div className="sidebar-logo">
          <h1 className="logo-text">Hobby Corner</h1>
          <p className="logo-sub">Admin Dashboard</p>
        </div>

        {/* MENU */}
        <div className="sidebar-menu">
          <div className="group-title">TỔNG QUAN</div>
          <MenuItem to="/admin" icon={<FaHome />} text="Dashboard" active={isActive("/admin")} />
          <MenuItem to="/admin/reports" icon={<FaChartLine />} text="Báo cáo chi tiết" active={isActive("/admin/reports")} />

          <div className="group-title">QUẢN LÝ SẢN PHẨM</div>
          <MenuItem to="/admin/categories" icon={<FaTags />} text="Danh mục" active={isActive("/admin/categories")} />
          <MenuItem to="/admin/brands" icon={<FaBuilding />} text="Hãng" active={isActive("/admin/brands")} />
          <MenuItem to="/admin/products" icon={<FaBox />} text="Sản phẩm" active={isActive("/admin/products")} />

          <div className="group-title">KHUYẾN MÃI</div>
          <MenuItem to="/admin/coupons" icon={<FaTicketAlt />} text="Mã giảm giá" active={isActive("/admin/coupons")} />
          <MenuItem to="/admin/discounts" icon={<FaTag />} text="Discount" active={isActive("/admin/discounts")} />

          <div className="group-title">ĐƠN HÀNG</div>
          <MenuItem
            to="/admin/orders"
            icon={<FaShoppingCart />}
            text="Đơn hàng"
            active={isActive("/admin/orders")}
            badge={pendingOrdersCount > 0 ? pendingOrdersCount : null}
          />

          <div className="group-title">NGƯỜI DÙNG</div>
          <MenuItem to="/admin/users" icon={<FaUsers />} text="Người dùng" active={isActive("/admin/users")} />
        </div>

        {/* LOGOUT */}
        <button className="sidebar-logout" onClick={handleLogout}>
          <FaSignOutAlt /> Đăng xuất
        </button>
      </div>
    </>
  );
}

// ===== MENU ITEM =====
function MenuItem({ to, icon, text, active, badge }) {
  return (
    <Link to={to} className={`menu-item ${active ? "active" : ""}`}>
      <div className="menu-left">
        <span className="menu-icon">{icon}</span>
        <span>{text}</span>
      </div>
      {badge && <span className="menu-badge">{badge}</span>}
    </Link>
  );
}

// ===== STYLES =====
const styles = `
  /* ===== SIDEBAR TOGGLE (Mobile) ===== */
  .sidebar-toggle {
    position: fixed;
    top: 16px;
    left: 16px;
    z-index: 1001;
    background: #1e293b;
    color: white;
    border: none;
    border-radius: 10px;
    width: 44px;
    height: 44px;
    font-size: 20px;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    transition: 0.2s;
  }
  .sidebar-toggle:hover { background: #334155; }

  /* ===== OVERLAY ===== */
  .sidebar-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.5);
    z-index: 999;
    display: none;
  }

  /* ===== SIDEBAR ===== */
  .sidebar {
    width: 270px;
    height: 100vh;
    background: #0f172a;
    color: white;
    padding: 24px 20px;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1000;
    transition: transform 0.3s ease;
    box-shadow: 4px 0 20px rgba(0,0,0,0.2);
  }

  .sidebar-logo {
    margin-bottom: 32px;
  }
  .logo-text {
    color: #60a5fa;
    font-size: 28px;
    font-weight: 800;
    margin: 0;
  }
  .logo-sub {
    color: #94a3b8;
    font-size: 14px;
    margin-top: 4px;
  }

  .sidebar-menu {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .group-title {
    color: #64748b;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    margin-top: 24px;
    margin-bottom: 8px;
  }

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    border-radius: 12px;
    text-decoration: none;
    color: #94a3b8;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
  }
  .menu-item:hover {
    background: #1e293b;
    color: #f1f5f9;
  }
  .menu-item.active {
    background: #2563eb;
    color: white;
  }

  .menu-left {
    display: flex;
    align-items: center;
    gap: 14px;
  }
  .menu-icon {
    font-size: 18px;
    flex-shrink: 0;
  }

  .menu-badge {
    background: #ef4444;
    color: white;
    min-width: 24px;
    height: 24px;
    border-radius: 999px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    font-weight: 700;
    padding: 0 8px;
  }

  .sidebar-logout {
    margin-top: auto;
    background: #dc2626;
    color: white;
    border: none;
    padding: 14px;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-weight: 700;
    font-size: 15px;
    transition: 0.2s;
    margin-top: 20px;
  }
  .sidebar-logout:hover {
    background: #b91c1c;
  }

  /* ===== RESPONSIVE ===== */
  @media (max-width: 992px) {
    .sidebar-toggle {
      display: flex;
    }
    .sidebar-overlay {
      display: block;
    }
    .sidebar {
      transform: translateX(-100%);
      width: 280px;
      padding: 20px 16px;
    }
    .sidebar.open {
      transform: translateX(0);
    }
  }

  @media (max-width: 480px) {
    .sidebar {
      width: 100%;
      max-width: 320px;
    }
    .logo-text {
      font-size: 24px;
    }
    .menu-item {
      padding: 10px 14px;
      font-size: 14px;
    }
    .menu-icon {
      font-size: 16px;
    }
    .sidebar-logout {
      font-size: 14px;
      padding: 12px;
    }
  }

  /* Scrollbar */
  .sidebar::-webkit-scrollbar {
    width: 4px;
  }
  .sidebar::-webkit-scrollbar-track {
    background: transparent;
  }
  .sidebar::-webkit-scrollbar-thumb {
    background: #334155;
    border-radius: 10px;
  }
`;

export default Sidebar;