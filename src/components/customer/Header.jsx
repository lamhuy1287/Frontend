import "./Header.css";
import logo from "../../assets/logo2.png";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

import {
    FaSearch,
    FaShoppingCart,
    FaUser,
    FaChevronDown
} from "react-icons/fa";

import {
    getCategories
} from "../../services/categoryService";

// CART CONTEXT
import {
    useCart
} from "../../context/CartContext";

function Header() {

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

                // NORMALIZE DATA
                const normalized =
                    Array.isArray(res)
                        ? res
                        : res?.data || [];

                // SAFE CHILDREN
                const safeData =
                    normalized.map(
                        (item) => ({

                            ...item,

                            children:
                                Array.isArray(
                                    item.children
                                )
                                    ? item.children
                                    : []

                        })
                    );

                setCategories(
                    safeData
                );

            } catch (error) {

                console.log(error);

                setCategories([]);

            }

        };

    return (

        <header>

            {/* TOP HEADER */}

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

            {/* MENU */}

            <div className="menu">

                <div className="container">

                    <nav className="menu-nav">

                        {
                            Array.isArray(
                                categories
                            ) &&
                            categories.map(
                                (
                                    category
                                ) => (

                                    <div
                                        className="menu-item"
                                        key={
                                            category.id
                                        }
                                    >

                                        <button>

                                            {
                                                category.name
                                            }

                                            {
                                                category.children.length > 0 && (

                                                    <FaChevronDown />

                                                )
                                            }

                                        </button>

                                        {
                                            category.children.length > 0 && (

                                                <div className="dropdown">

                                                    {
                                                        category.children.map(
                                                            (
                                                                child
                                                            ) => (

                                                                <Link
                                                                    key={
                                                                        child.id
                                                                    }
                                                                    to={`/category/${child.id}`}
                                                                >

                                                                    {
                                                                        child.name
                                                                    }

                                                                </Link>

                                                            )
                                                        )
                                                    }

                                                </div>

                                            )
                                        }

                                    </div>

                                )
                            )
                        }

                    </nav>

                </div>

            </div>

        </header>

    );

}

export default Header;