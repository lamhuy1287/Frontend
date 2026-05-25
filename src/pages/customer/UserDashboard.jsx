import { useNavigate } from "react-router-dom";

function UserDashboard() {

    const navigate = useNavigate();

    const user = JSON.parse(
        localStorage.getItem("user")
    );

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        // xóa localStorage
        localStorage.removeItem("user");

        localStorage.removeItem("token");

        // chuyển về login
        navigate("/");

    };

    return (

        <div style={styles.container}>

            <h1>User Dashboard</h1>

            <h2>
                Xin chào {user.name}
            </h2>

            <button
                style={styles.button}
                onClick={handleLogout}
            >
                Đăng xuất
            </button>

        </div>

    );
}

const styles = {

    container: {
        padding: "40px",
    },

    button: {
        marginTop: "20px",
        padding: "12px 20px",
        background: "red",
        color: "white",
        border: "none",
        cursor: "pointer",
        borderRadius: "5px",
        fontSize: "16px",
    },

};

export default UserDashboard;