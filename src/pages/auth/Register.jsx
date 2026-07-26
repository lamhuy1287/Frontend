import { useEffect, useState } from "react";
import styles from "../../components/auth/authStyles";
import logo from "../../assets/logo.png";

import {
    Link,
    useNavigate
} from "react-router-dom";

import API from "../../services/api";

function Register() {

    const navigate = useNavigate();

    // Responsive
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

    useEffect(() => {

        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        window.addEventListener("resize", handleResize);

        return () => {
            window.removeEventListener("resize", handleResize);
        };

    }, []);

    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        username: "",
        email: "",
        password: "",
    });

    // ============================
    // HANDLE CHANGE
    // ============================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

    };

    // ============================
    // HANDLE REGISTER
    // ============================

    const handleSubmit = async (e) => {

        e.preventDefault();

        if (loading) return;

        try {

            setLoading(true);

            const res = await API.post(
                "/auth/register",
                form
            );

            alert(res.data.message);

            navigate("/login");

        } catch (err) {

            console.log(err);

            if (err.response) {

                alert(err.response.data.message);

            } else {

                alert("Không kết nối được server");

            }

        } finally {

            setLoading(false);

        }

    };

    return (

        <div style={styles.page}>

            <div style={styles.container}>

                {/* Desktop Banner */}
                {!isMobile && (

                    <div style={styles.leftSide}>

                        <div style={styles.overlay}>
    <img
        src={logo}
        alt="Logo"
        style={{
            ...styles.logo,
            width: 500,
            margin: "0 auto 20px",
            display: "block",
        }}
    />

                            <h1 style={styles.title}>
                                LEGO & Mini Car Store
                            </h1>

                            <p style={styles.description}>
                                Chuyên mô hình LEGO và xe 1:64 cao cấp dành cho người sưu tầm.
                            </p>

                        </div>

                    </div>

                )}

                {/* Register Form */}

                <div style={styles.rightSide}>

                    <form
                        style={styles.form}
                        onSubmit={handleSubmit}
                    >

                        {isMobile && (

                            <img
                                src={logo}
                                alt="Logo"
                                style={{
                                    ...styles.logo,
                                    width: 110,
                                    margin: "0 auto 15px",
                                }}
                            />

                        )}

                        <h2
                            style={{
                                textAlign: "center",
                                color: "#ff6b00",
                                margin: 0,
                            }}
                        >
                            Tạo tài khoản
                        </h2>

                        <p
                            style={{
                                textAlign: "center",
                                color: "#666",
                                marginTop: 5,
                                marginBottom: 20,
                                fontSize: 14,
                            }}
                        >
                            Đăng ký để bắt đầu mua sắm cùng LEGO & Mini Car Store
                        </p>

                        <input
                            type="text"
                            name="username"
                            placeholder="Tên người dùng"
                            value={form.username}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={form.email}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Mật khẩu"
                            value={form.password}
                            onChange={handleChange}
                            style={styles.input}
                            required
                        />

                        <button
                            type="submit"
                            style={styles.button}
                            disabled={loading}
                        >
                            {loading
                                ? "Đang đăng ký..."
                                : "Đăng ký"}
                        </button>

                        <p
                            style={{
                                textAlign: "center",
                                margin: 0,
                                fontSize: 14,
                            }}
                        >
                            Đã có tài khoản?{" "}

                            <Link
                                to="/login"
                                style={{
                                    color: "#ff6b00",
                                    fontWeight: "bold",
                                    textDecoration: "none",
                                }}
                            >
                                Đăng nhập
                            </Link>

                        </p>

                    </form>

                </div>

            </div>

        </div>

    );

}

export default Register;