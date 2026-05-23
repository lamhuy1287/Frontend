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

import { getCategories } from "../../services/categoryService";

function Header() {

    const [categories, setCategories] = useState([]);

    useEffect(() => {
        loadCategories();
    }, []);

    const loadCategories = async () => {
        try {
            const res = await getCategories();

            // ✅ Normalize dữ liệu để luôn là mảng
            const normalized =
                Array.isArray(res)
                    ? res
                    : res?.data || [];

            // ✅ đảm bảo children luôn là mảng
            const safeData = normalized.map(item => ({
                ...item,
                children: Array.isArray(item.children)
                    ? item.children
                    : []
            }));

            setCategories(safeData);

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
                    <Link to="/user" className="logo">
                        <img
                            src={logo}
                            alt="Logo"
                            className="logo-image"
                        />
                    </Link>

                    {/* SEARCH */}
                    <div className="search-box">
                        <FaSearch className="search-icon" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                        />
                    </div>

                    {/* ACTIONS */}
                    <div className="header-actions">

                        <Link to="/profile" className="action-item">
                            <FaUser />
                            <span>Tài khoản</span>
                        </Link>

                        <Link to="/cart" className="action-item cart">
                            <FaShoppingCart />
                            <span>Giỏ hàng</span>

                            <div className="cart-badge">
                                2
                            </div>
                        </Link>

                    </div>

                </div>
            </div>

            {/* MENU */}
            <div className="menu">
                <div className="container">

                    <nav className="menu-nav">

                        {Array.isArray(categories) && categories.map((category) => (
                            <div className="menu-item" key={category.id}>

                                <button>
                                    {category.name}

                                    {category.children.length > 0 && (
                                        <FaChevronDown />
                                    )}
                                </button>

                                {category.children.length > 0 && (
                                    <div className="dropdown">

                                        {category.children.map((child) => (
                                            <Link
                                                key={child.id}
                                                to={`/category/${child.id}`}
                                            >
                                                {child.name}
                                            </Link>
                                        ))}

                                    </div>
                                )}

                            </div>
                        ))}

                    </nav>

                </div>
            </div>

        </header>
    );
}

export default Header;