import { useNavigate } from "react-router-dom";
import CustomerLayout from "../../layouts/CustomerLayout";

function Profile() {

    const navigate = useNavigate();

    const handleLogout = () => {

        // Xóa dữ liệu đăng nhập
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");

        // Chuyển về trang login
        navigate("/");
    };

    return (
        <CustomerLayout>

            <div style={{ padding: "40px" }}>

                <h1>Profile</h1>

                <button
                    onClick={handleLogout}
                    style={{
                        marginTop: "20px",
                        padding: "10px 20px",
                        backgroundColor: "red",
                        color: "white",
                        border: "none",
                        borderRadius: "6px",
                        cursor: "pointer"
                    }}
                >
                    Đăng xuất
                </button>

            </div>
        </CustomerLayout>
    );
}

export default Profile;