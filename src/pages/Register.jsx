import { useState } from "react";

import {
    Link,
    useNavigate
} from "react-router-dom";

import API from "../services/api";

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

        <div style={styles.container}>

            <form
                style={styles.form}
                onSubmit={handleSubmit}
            >

                <h2>Đăng ký</h2>

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

                <p>
                    Đã có tài khoản?

                    <Link to="/">
                        {" "}Đăng nhập
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

export default Register;