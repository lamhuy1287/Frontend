
import "./Header.css";

import logo from "../../assets/logo2.png";

import { Link } from "react-router-dom";

import {
    useEffect,
    useState,
    useRef
} from "react";

import {
    FaSearch,
    FaShoppingCart,
    FaUser,
    FaBoxOpen,
    FaSignOutAlt
} from "react-icons/fa";

import {
    getCategories
} from "../../services/categoryService";

// CART CONTEXT
import {
    useCart
} from "../../context/CartContext";

function Header() {

    // =========================
    // STATES
    // =========================

    const [categories,
        setCategories] =
        useState([]);

    const [showDropdown,
        setShowDropdown] =
        useState(false);

    // =========================
    // REF
    // =========================

    const dropdownRef =
        useRef();

    // =========================
    // CART CONTEXT
    // =========================

    const {
        cartCount
    } = useCart();

    // =========================
    // EFFECT
    // =========================

    useEffect(() => {

        loadCategories();

    }, []);

    // =========================
    // CLOSE DROPDOWN
    // =========================

    useEffect(() => {

        const handleClickOutside = (
            event
        ) => {

            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(
                    event.target
                )
            ) {

                setShowDropdown(false);
            }
        };

        document.addEventListener(
            "mousedown",
            handleClickOutside
        );

        return () => {

            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };

    }, []);

    // =========================
    // LOAD CATEGORIES
    // =========================

    const loadCategories =
        async () => {

            try {

                const res =
                    await getCategories();

                console.log(
                    "CATEGORIES:",
                    res
                );

                // =====================
                // NORMALIZE DATA
                // =====================

                const normalized =
                    Array.isArray(res)
                        ? res
                        : res?.data || [];

                setCategories(
                    normalized
                );

            } catch (error) {

                console.log(
                    "LOAD CATEGORY ERROR:",
                    error
                );

                setCategories([]);

            }

        };

    // =========================
    // LOGOUT
    // =========================

    const handleLogout = () => {

        localStorage.removeItem(
            "access_token"
        );

        window.location.href =
            "/";
    };

    // =========================
    // RENDER
    // =========================

    return (

        <header>

            {/* =====================
                TOP HEADER
            ===================== */}

            <div className="top-header">

                <div className="container top-header-container">

                    {/* LOGO */}

                    <Link
                        to="/user"
                        className="logo"
                    >

                        <img
                            src={logo}
                            alt="Logo"
                            className="logo-image"
                        />

                    </Link>

                    {/* SEARCH */}

                    <div className="search-box">

                        <FaSearch
                            className="search-icon"
                        />

                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                        />

                    </div>

                    {/* ACTIONS */}

                    <div className="header-actions">

                        {/* PROFILE */}

                        <div
                            className="profile-dropdown"
                            ref={dropdownRef}
                        >

                            <button
                                className="action-item profile-btn"
                                onClick={() =>
                                    setShowDropdown(
                                        !showDropdown
                                    )
                                }
                            >

                                <FaUser />

                                <span>
                                    Tài khoản
                                </span>

                            </button>

                            {
                                showDropdown && (

                                    <div className="dropdown-menu">

                                        {/* PROFILE */}

                                        <Link
                                            to="/profile"
                                            className="dropdown-item"
                                            onClick={() =>
                                                setShowDropdown(false)
                                            }
                                        >

                                            <FaUser />

                                            <span>
                                                Tài khoản
                                            </span>

                                        </Link>

                                        {/* ORDERS */}

                                        <Link
                                            to="/my-orders"
                                            className="dropdown-item"
                                            onClick={() =>
                                                setShowDropdown(false)
                                            }
                                        >

                                            <FaBoxOpen />

                                            <span>
                                                Đơn hàng
                                            </span>

                                        </Link>

                                        {/* LOGOUT */}

                                        <button
                                            className="dropdown-item logout-btn"
                                            onClick={handleLogout}
                                        >

                                            <FaSignOutAlt />

                                            <span>
                                                Đăng xuất
                                            </span>

                                        </button>

                                    </div>

                                )
                            }

                        </div>

                        {/* CART */}

                        <Link
                            to="/cart"
                            className="action-item cart"
                        >

                            <FaShoppingCart />

                            <span>
                                Giỏ hàng
                            </span>

                            {
                                cartCount > 0 && (

                                    <div className="cart-badge">

                                        {cartCount}

                                    </div>

                                )
                            }

                        </Link>

                    </div>

                </div>

            </div>

            {/* =====================
                MENU
            ===================== */}

            <div className="menu">

                <div className="container">

                    <nav className="menu-nav">

                        {
                            Array.isArray(categories) &&
                            categories.map((category) => (

                                <div
                                    className="menu-item"
                                    key={category.id}
                                >

                                    <Link
                                        to={`/category/${category.id}`}
                                        className="menu-link"
                                    >

                                        {category.name}

                                    </Link>

                                </div>

                            ))
                        }

                    </nav>

                </div>

            </div>

        </header>

    );

}

export default Header;

