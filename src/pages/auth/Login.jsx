import { useEffect, useState } from "react";
import styles from "../../components/auth/authStyles";
import logo from "../../assets/logo.png";

import {
    Link,
    useNavigate
} from "react-router-dom";

import API from "../../services/api";

function Login() {

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

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

    };

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const res = await API.post("/auth/login", form);

            const { user, access_token } = res.data.data;

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            localStorage.setItem(
                "token",
                access_token
            );

            alert(res.data.message);

            navigate(
                user.role === "admin"
                    ? "/admin"
                    : "/user"
            );

        } catch (err) {

            if (err.response) {

                alert(err.response.data.message);

            } else {

                alert("Không kết nối được server");

            }

        }

    };

    return (

        <div style={styles.page}>

            <div style={styles.container}>

                {/* Banner Desktop */}
                {!isMobile && (

                    <div style={styles.leftSide}>

                        <div style={styles.overlay}>

                            <img
                                src={logo}
                                alt="Logo"
                                style={styles.logo}
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

                {/* Form */}
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
            width: 500,
            margin: "0 auto 20px",
            display: "block",
        }}
    />

                        )}

                        <h2
                            style={{
                                textAlign: "center",
                                margin: 0,
                                color: "#ff6b00",
                            }}
                        >
                            Chào mừng trở lại
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
                            Đăng nhập để tiếp tục mua sắm
                        </p>

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
                        >
                            Đăng nhập
                        </button>

                        <p
                            style={{
                                textAlign: "center",
                                margin: 0,
                                fontSize: 14,
                            }}
                        >
                            Chưa có tài khoản?{" "}

                            <Link
                                to="/register"
                                style={{
                                    color: "#ff6b00",
                                    fontWeight: "bold",
                                    textDecoration: "none",
                                }}
                            >
                                Đăng ký
                            </Link>

                        </p>

                    </form>

                </div>

            </div>

        </div>

    );

}

export default Login;