import "./Header.css";

import logo from "../../assets/logo2.png";

import {
    Link,
    useNavigate
} from "react-router-dom";

import {
    useEffect,
    useState,
    useRef,
    useCallback
} from "react";

import {
    FaSearch,
    FaShoppingCart,
    FaUser,
    FaBoxOpen,
    FaSignOutAlt,
    FaTimes
} from "react-icons/fa";

import {
    getCategories
} from "../../services/categoryService";

import {
    searchProducts
} from "../../services/productService";

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

    const [user,
        setUser] =
        useState(null);

    // SEARCH STATES
    const [searchTerm,
        setSearchTerm] =
        useState("");

    const [searchSuggestions,
        setSearchSuggestions] =
        useState([]);

    const [showSuggestions,
        setShowSuggestions] =
        useState(false);

    const [isSearching,
        setIsSearching] =
        useState(false);

    // =========================
    // NAVIGATE
    // =========================

    const navigate =
        useNavigate();

    // =========================
    // REFS
    // =========================

    const dropdownRef =
        useRef();

    const searchRef =
        useRef();

    const searchInputRef =
        useRef();

    // =========================
    // CART CONTEXT
    // =========================

    const {
        cartCount
    } = useCart();

    // =========================
    // LOAD DATA
    // =========================

    useEffect(() => {

        loadCategories();

        loadUser();

    }, []);

    // =========================
    // LOAD USER
    // =========================

    const loadUser = () => {

        try {

            const userData =
                localStorage.getItem(
                    "user"
                );

            if (userData) {

                setUser(
                    JSON.parse(userData)
                );

            }

        } catch (error) {

            console.log(
                "LOAD USER ERROR:",
                error
            );

        }

    };

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
    // CLOSE SEARCH SUGGESTIONS
    // =========================

    useEffect(() => {

        const handleClickOutside = (
            event
        ) => {

            if (
                searchRef.current &&
                !searchRef.current.contains(
                    event.target
                )
            ) {

                setShowSuggestions(false);

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
    // SEARCH PRODUCTS (DEBOUNCE)
    // =========================

    const fetchSearchSuggestions =
        useCallback(
            async (keyword) => {

                if (
                    !keyword.trim() ||
                    keyword.trim().length < 2
                ) {

                    setSearchSuggestions([]);
                    setShowSuggestions(false);
                    return;

                }

                setIsSearching(true);

                try {

                    const results =
                        await searchProducts(
                            keyword,
                            5
                        );

                    setSearchSuggestions(
                        results || []
                    );

                    setShowSuggestions(
                        true
                    );

                } catch (error) {

                    console.log(
                        "SEARCH SUGGESTIONS ERROR:",
                        error
                    );

                    setSearchSuggestions([]);

                } finally {

                    setIsSearching(false);

                }

            },
            []
        );

    // DEBOUNCE FUNCTION
    const debounce = (func, delay) => {

        let timeoutId;

        return (...args) => {

            clearTimeout(timeoutId);

            timeoutId = setTimeout(
                () => func(...args),
                delay
            );

        };

    };

    const debouncedSearch =
        useCallback(
            debounce(
                fetchSearchSuggestions,
                500
            ),
            [fetchSearchSuggestions]
        );

    // =========================
    // HANDLE SEARCH INPUT CHANGE
    // =========================

    const handleSearchChange = (
        e
    ) => {

        const value =
            e.target.value;

        setSearchTerm(value);

        debouncedSearch(value);

    };

    // =========================
    // HANDLE SEARCH SUBMIT
    // =========================

    const handleSearchSubmit = () => {

        if (
            !searchTerm.trim()
        ) {

            return;

        }

        setShowSuggestions(false);

        navigate(
            `/search?q=${encodeURIComponent(
                searchTerm.trim()
            )}`
        );

    };
    

    // =========================
    // HANDLE KEY PRESS (ENTER)
    // =========================

    const handleKeyPress = (
        e
    ) => {

        if (e.key === "Enter") {

            handleSearchSubmit();

        }

    };

    // =========================
    // HANDLE SUGGESTION CLICK - CHUYỂN ĐẾN PRODUCT DETAIL
    // =========================

    const handleSuggestionClick = (
        productId
    ) => {

        // Đóng dropdown suggestions
        setShowSuggestions(false);
        
        // Xóa search term
        setSearchTerm("");
        
        // Chuyển đến trang chi tiết sản phẩm
        navigate(`/product/${productId}`);

    };

    // =========================
    // CLEAR SEARCH
    // =========================

    const clearSearch = () => {

        setSearchTerm("");

        setSearchSuggestions([]);

        setShowSuggestions(false);

        if (searchInputRef.current) {

            searchInputRef.current.focus();

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

    // =========================
    // HÀM LẤY ẢNH SẢN PHẨM
    // =========================

    const getProductImage = (product) => {
        if (!product) return "";
        
        // Từ images array
        if (product.images && product.images.length > 0) {
            const firstImage = product.images[0];
            if (firstImage.image_url) return firstImage.image_url;
            if (firstImage.url) return firstImage.url;
            if (typeof firstImage === 'string') return firstImage;
        }
        
        // Từ image trực tiếp
        if (product.image) return product.image;
        
        return "";
    };

    // =========================
    // HÀM LẤY GIÁ SẢN PHẨM
    // =========================

    const getProductPrice = (product) => {
        if (!product) return 0;
        
        if (product.variants && product.variants.length > 0) {
            return Number(product.variants[0].price) || 0;
        }
        return Number(product.price) || 0;
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

                    {/* SEARCH BOX */}

                    <div
                        className="search-box"
                        ref={searchRef}
                    >

                        <FaSearch
                            className="search-icon"
                            onClick={
                                handleSearchSubmit
                            }
                        />

                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Tìm kiếm sản phẩm..."
                            value={searchTerm}
                            onChange={
                                handleSearchChange
                            }
                            onKeyPress={
                                handleKeyPress
                            }
                        />

                        {searchTerm && (

                            <FaTimes
                                className="search-clear-icon"
                                onClick={
                                    clearSearch
                                }
                            />

                        )}

                        {/* SEARCH SUGGESTIONS */}
                        {showSuggestions && (
                            <div className="search-suggestions">
                                {isSearching ? (
                                    <div className="suggestion-loading">
                                        Đang tìm kiếm...
                                    </div>
                                ) : searchSuggestions.length > 0 ? (
                                    <>
                                        {searchSuggestions.map((product) => (
                                            <div
                                                key={product.id}
                                                className="suggestion-item"
                                                onClick={() => handleSuggestionClick(product.id)}
                                                style={{ cursor: 'pointer' }}
                                            >
                                                {/* HÌNH ẢNH */}
                                                {(() => {
                                                    const imageUrl = getProductImage(product);
                                                    return imageUrl ? (
                                                        <img
                                                            src={imageUrl}
                                                            alt={product.name}
                                                            className="suggestion-image"
                                                            onError={(e) => {
                                                                e.target.src = "https://via.placeholder.com/50";
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="suggestion-image-placeholder">
                                                            🏷️
                                                        </div>
                                                    );
                                                })()}
                                                
                                                {/* THÔNG TIN */}
                                                <div className="suggestion-info">
                                                    <div className="suggestion-name">
                                                        {product.name}
                                                    </div>
                                                    <div className="suggestion-price">
                                                        {getProductPrice(product).toLocaleString('vi-VN')} đ
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div
                                            className="suggestion-view-all"
                                            onClick={handleSearchSubmit}
                                        >
                                            Xem tất cả kết quả cho "{searchTerm}"
                                        </div>
                                    </>
                                ) : (
                                    searchTerm.trim().length >= 2 && (
                                        <div className="suggestion-no-results">
                                            Không tìm thấy sản phẩm nào
                                        </div>
                                    )
                                )}
                            </div>
                        )}

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
                                    {
                                        user
                                            ? user.name
                                            : "Tài khoản"
                                    }
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