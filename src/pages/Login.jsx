import { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import API from "../services/api";

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

        <div style={styles.container}>

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
    );
}

const styles = {

    container: {
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "#f4f4f4",
    },

    form: {
        width: "350px",
        padding: "30px",
        background: "white",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        gap: "15px",
    },

    input: {
        padding: "12px",
        fontSize: "16px",
    },

    button: {
        padding: "12px",
        background: "black",
        color: "white",
        border: "none",
        cursor: "pointer",
    },

};

export default Login;