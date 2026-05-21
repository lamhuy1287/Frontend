import { useState } from "react";
import styles from "../../components/auth/authStyles";
import logo from "../../assets/logo.png";

import {
    Link,
    useNavigate
} from "react-router-dom";

import API from "../../services/api";

function Login() {

    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: "",
        password: "",
    });

    // =========================
    // HANDLE CHANGE
    // =========================

    const handleChange = (e) => {

        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });

    };

    // =========================
    // HANDLE LOGIN
    // =========================

    const handleSubmit = async (e) => {

        e.preventDefault();

        try {

            const res = await API.post(
                "/auth/login",
                form
            );

            console.log(res.data);

            // =====================
            // BACKEND RESPONSE
            // =====================

            const responseData = res.data.data;

            const user = responseData.user;

            const token = responseData.access_token;

            // =====================
            // SAVE LOCAL STORAGE
            // =====================

            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );

            localStorage.setItem(
                "token",
                token
            );

            alert(res.data.message);

            // =====================
            // REDIRECT
            // =====================

            if (user.role === "admin") {

                navigate("/admin");

            } else {

                navigate("/user");

            }

        } catch (err) {

            console.log(err);

            if (err.response) {

                alert(err.response.data.message);

            } else {

                alert("Không kết nối được server");

            }

        }
    };

    return (
        <div style={styles.page}>

            {/* Container chính */}
            <div style={styles.container}>

                {/* Bên trái */}
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

                {/* Bên phải */}
                <div style={styles.rightSide}>

                    <form
                        style={styles.form}
                        onSubmit={handleSubmit}
                    >

                        <h2>Đăng nhập</h2>

                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            onChange={handleChange}
                            style={styles.input}
                        />

                        <input
                            type="password"
                            name="password"
                            placeholder="Password"
                            onChange={handleChange}
                            style={styles.input}
                        />

                        <button style={styles.button}>
                            Đăng nhập
                        </button>

                        <p>
                            Chưa có tài khoản?

                            <Link to="/register">
                                {" "}Đăng ký
                            </Link>
                        </p>

                    </form>

                </div>

            </div>

        </div>
    );
}



export default Login;