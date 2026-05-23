import { Outlet } from "react-router-dom";

import Sidebar from "../components/admin/Sidebar";

function AdminLayout() {

    return (

        <div
            style={{
                display: "flex",
                width: "100%",
                height: "100vh"
            }}
        >

            {/* SIDEBAR */}
            <Sidebar />

            {/* CONTENT */}
            <div
                style={{
                    flex: 1,
                    background: "#F3F4F6",
                    padding: "20px",
                    overflowY: "auto"
                }}
            >

                <Outlet />

            </div>

        </div>
    );
}

export default AdminLayout;