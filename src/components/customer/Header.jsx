import "./Header.css";

import logo from "../../assets/logo2.png";

import { Link } from "react-router-dom";

import { useEffect, useState } from "react";

import {
    FaSearch,
    FaShoppingCart,
    FaUser
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

                        <Link
                            to="/profile"
                            className="action-item"
                        >

                            <FaUser />

                            <span>
                                Tài khoản
                            </span>

                        </Link>

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