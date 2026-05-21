import { useNavigate } from "react-router-dom";

function AdminDashboard() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    // =========================
    // LOGOUT
    // =========================
    const handleLogout = () => {

        // xóa dữ liệu đăng nhập
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        // chuyển về trang login
        navigate("/");
    };

    return (

        <div style={{ padding: "40px" }}>

            <h1>Admin Dashboard</h1>

            <h2>
                Xin chào {user.name}
            </h2>

            <button
                onClick={handleLogout}
                style={{
                    marginTop: "20px",
                    padding: "12px 20px",
                    border: "none",
                    borderRadius: "8px",
                    backgroundColor: "#ff6b35",
                    color: "white",
                    cursor: "pointer",
                    fontSize: "16px"
                }}
            >
                Đăng xuất
            </button>

        </div>

    );
}

export default AdminDashboard;