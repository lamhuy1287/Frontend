
import {
    useEffect,
    useState
} from "react";

import {
    useNavigate
} from "react-router-dom";

import {
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaSignOutAlt
} from "react-icons/fa";

import CustomerLayout from "../../layouts/CustomerLayout";


import {
    updateProfile
} from "../../services/userService";



import "./Profile.css";

function Profile() {

    const navigate =
        useNavigate();

    // =========================
    // STATE
    // =========================

    const [user,
        setUser] =
        useState(null);

    const [isEditing,
        setIsEditing] =
        useState(false);

    const [loading,
        setLoading] =
        useState(false);

    const [form,
        setForm] =
        useState({
            name: "",
            phone: "",
            address: ""
        });

    // =========================
    // LOAD USER
    // =========================

    useEffect(() => {

        const userData =
            localStorage.getItem(
                "user"
            );

        if (userData) {

            const parsedUser =
                JSON.parse(userData);

            setUser(parsedUser);

            setForm({
                name:
                    parsedUser.name || "",

                phone:
                    parsedUser.phone || "",

                address:
                    parsedUser.address || ""
            });

        }

    }, []);

    // =========================
    // HANDLE CHANGE
    // =========================

    const handleChange = (e) => {

        setForm({

            ...form,

            [e.target.name]:
                e.target.value

        });

    };

    // =========================
    // SAVE PROFILE
    // =========================

    const handleSave =
        async () => {

            try {

                setLoading(true);

                // =====================
                // CALL API
                // =====================

                const res =
                    await updateProfile(form);

                const updatedUser =
                    res.data.user;

                // =====================
                // UPDATE STATE
                // =====================

                setUser(updatedUser);

                // =====================
                // UPDATE LOCAL STORAGE
                // =====================

                localStorage.setItem(
                    "user",
                    JSON.stringify(updatedUser)
                );

                // =====================
                // CLOSE EDIT MODE
                // =====================

                setIsEditing(false);

                alert(
                    "Cập nhật thông tin thành công"
                );

            } catch (error) {

                console.log(error);

                alert(
                    "Cập nhật thất bại"
                );

            } finally {

                setLoading(false);

            }

        };

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        navigate("/");

    };

    return (

        <CustomerLayout>

            <div className="profile-page">

                <div className="profile-card">

                    {/* HEADER */}

                    <div className="profile-header">

                        <div className="profile-avatar">

                            {
                                user?.name
                                    ?.charAt(0)
                                    ?.toUpperCase()
                            }

                        </div>

                        <h1>
                            {user?.name || "Người dùng"}
                        </h1>

                        <p>
                            Thành viên
                        </p>

                    </div>

                    {/* BODY */}

                    <div className="profile-body">

                        {/* NAME */}

                        <div className="profile-item">

                            <div className="profile-label">

                                <FaUser />

                                <span>
                                    Tên người dùng :
                                </span>

                            </div>

                            {
                                isEditing ? (

                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        className="profile-input"
                                    />

                                ) : (

                                    <div className="profile-value">

                                        {
                                            user?.name ||
                                            "Chưa cập nhật"
                                        }

                                    </div>

                                )
                            }

                        </div>

                        {/* EMAIL */}

                        <div className="profile-item">

                            <div className="profile-label">

                                <FaEnvelope />

                                <span>
                                    Email
                                </span>

                            </div>

                            <div className="profile-value">

                                {
                                    user?.email ||
                                    "Chưa cập nhật"
                                }

                            </div>

                        </div>

                        {/* PHONE */}

                        <div className="profile-item">

                            <div className="profile-label">

                                <FaPhone />

                                <span>
                                    Số điện thoại
                                </span>

                            </div>

                            {
                                isEditing ? (

                                    <input
                                        type="text"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className="profile-input"
                                    />

                                ) : (

                                    <div className="profile-value">

                                        {
                                            user?.phone ||
                                            "Chưa cập nhật"
                                        }

                                    </div>

                                )
                            }

                        </div>

                        {/* ADDRESS */}

                        <div className="profile-item">

                            <div className="profile-label">

                                <FaMapMarkerAlt />

                                <span>
                                    Địa chỉ
                                </span>

                            </div>

                            {
                                isEditing ? (

                                    <textarea
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        className="profile-textarea"
                                    />

                                ) : (

                                    <div className="profile-value">

                                        {
                                            user?.address ||
                                            "Chưa cập nhật"
                                        }

                                    </div>

                                )
                            }

                        </div>

                    </div>

                    {/* FOOTER */}

                    <div className="profile-footer">

                        {
                            isEditing ? (

                                <button
                                    className="save-btn"
                                    onClick={handleSave}
                                    disabled={loading}
                                >

                                    {
                                        loading
                                            ? "Đang lưu..."
                                            : "Lưu thông tin"
                                    }

                                </button>

                            ) : (

                                <button
                                    className="edit-btn"
                                    onClick={() =>
                                        setIsEditing(true)
                                    }
                                >

                                    Chỉnh sửa

                                </button>

                            )
                        }

                        <button
                            className="logout-btn"
                            onClick={handleLogout}
                        >

                            <FaSignOutAlt />

                            <span>
                                Đăng xuất
                            </span>

                        </button>

                    </div>

                </div>

            </div>

        </CustomerLayout>

    );

}

export default Profile;

