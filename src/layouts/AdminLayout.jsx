import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "../components/Admin/Sidebar";

const SIDEBAR_WIDTH = 270;
const MOBILE_BREAKPOINT = 992;

function AdminLayout() {
  const [isMobile, setIsMobile] = useState(
    window.innerWidth <= MOBILE_BREAKPOINT
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        background: "#F3F4F6",
      }}
    >
      {/* Sidebar */}
      <Sidebar />

      {/* Content */}
      <main
        style={{
          marginLeft: isMobile ? 0 : SIDEBAR_WIDTH,
          padding: isMobile ? "80px 20px 20px" : "20px",
          minHeight: "100vh",
          overflowX: "hidden",
          overflowY: "auto",
          transition: "margin-left 0.3s ease",
          boxSizing: "border-box",
        }}
      >
        <Outlet />
      </main>
    </div>
  );
}

export default AdminLayout;