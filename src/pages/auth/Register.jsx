import { useState } from "react";
import styles from "../../components/auth/authStyles";
import logo from "../../assets/logo.png";

import {
    Link,
    useNavigate
} from "react-router-dom";

import API from "../../services/api";

function Register() {

    const navigate = useNavigate();

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

        try {

            const res = await API.post(
                "/auth/register",
                form
            );

            alert(res.data.message);

            navigate("/");

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

            {/* LEFT */}
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

            {/* RIGHT */}
            <div style={styles.rightSide}>

                <form
                    style={styles.form}
                    onSubmit={handleSubmit}
                >

                    <h2 style={styles.heading}>
                        Đăng ký
                    </h2>

                    <input
                        type="text"
                        name="username"
                        placeholder="Username"
                        onChange={handleChange}
                        style={styles.input}
                    />

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
                        Đăng ký
                    </button>

                    <p style={styles.text}>
                        Đã có tài khoản?

                        <Link to="/" style={styles.link}>
                            {" "}Đăng nhập
                        </Link>
                    </p>

                </form>

            </div>

        </div>

    </div>
);
}


export default Register;