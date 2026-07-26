import "./Header.css";

import logo from "../../assets/logo2.png";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { FaSearch, FaShoppingCart, FaUser, FaBoxOpen, FaSignOutAlt, FaTimes } from "react-icons/fa";
import { getCategories } from "../../services/categoryService";
import { searchProducts } from "../../services/productService";
import { useCart } from "../../context/CartContext";
import toast from "react-hot-toast"; // Thêm import toast

function Header() {
  // =========================
  // STATES
  // =========================

  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [user, setUser] = useState(null);

  // SEARCH STATES
  const [searchTerm, setSearchTerm] = useState("");
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // =========================
  // NAVIGATE
  // =========================

  const navigate = useNavigate();

  // =========================
  // REFS
  // =========================

  const dropdownRef = useRef();
  const searchRef = useRef();
  const searchInputRef = useRef();

  // =========================
  // CART CONTEXT
  // =========================

  const { cartCount } = useCart();

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
      const userData = localStorage.getItem("user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.log("LOAD USER ERROR:", error);
    }
  };

  // =========================
  // CLOSE DROPDOWN
  // =========================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================
  // CLOSE SEARCH SUGGESTIONS
  // =========================

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // =========================
  // LOAD CATEGORIES
  // =========================

  const loadCategories = async () => {
    try {
      const res = await getCategories();
      const normalized = Array.isArray(res) ? res : res?.data || [];
      setCategories(normalized);
    } catch (error) {
      console.log("LOAD CATEGORY ERROR:", error);
      setCategories([]);
    }
  };

  // =========================
  // SEARCH PRODUCTS (DEBOUNCE)
  // =========================

  const fetchSearchSuggestions = useCallback(async (keyword) => {
    if (!keyword.trim() || keyword.trim().length < 2) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    setIsSearching(true);
    try {
      const results = await searchProducts(keyword, 5);
      setSearchSuggestions(results || []);
      setShowSuggestions(true);
    } catch (error) {
      console.log("SEARCH SUGGESTIONS ERROR:", error);
      setSearchSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  const debouncedSearch = useCallback(debounce(fetchSearchSuggestions, 500), [fetchSearchSuggestions]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    debouncedSearch(value);
  };

  const handleSearchSubmit = () => {
    if (!searchTerm.trim()) return;
    setShowSuggestions(false);
    navigate(`/search?q=${encodeURIComponent(searchTerm.trim())}`);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handleSuggestionClick = (productId) => {
    setShowSuggestions(false);
    setSearchTerm("");
    navigate(`/product/${productId}`);
  };

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
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // =========================
  // HÀM LẤY ẢNH SẢN PHẨM
  // =========================

  const getProductImage = (product) => {
    if (!product) return "";
    if (product.images && product.images.length > 0) {
      const firstImage = product.images[0];
      if (firstImage.image_url) return firstImage.image_url;
      if (firstImage.url) return firstImage.url;
      if (typeof firstImage === 'string') return firstImage;
    }
    if (product.image) return product.image;
    return "";
  };

  const getProductPrice = (product) => {
    if (!product) return 0;
    if (product.variants && product.variants.length > 0) {
      return Number(product.variants[0].price) || 0;
    }
    return Number(product.price) || 0;
  };

  // =========================
  // HANDLE CART CLICK
  // =========================

  const handleCartClick = (e) => {
    e.preventDefault(); // ngăn chặn Link (nếu dùng Link)
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Vui lòng đăng nhập để xem giỏ hàng");
      return;
    }
    navigate("/cart");
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
          <Link to="/" className="logo">
            <img src={logo} alt="Logo" className="logo-image" />
          </Link>

          {/* SEARCH BOX */}
          <div className="search-box" ref={searchRef}>
            <FaSearch className="search-icon" onClick={handleSearchSubmit} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Tìm kiếm sản phẩm..."
              value={searchTerm}
              onChange={handleSearchChange}
              onKeyPress={handleKeyPress}
            />
            {searchTerm && (
              <FaTimes className="search-clear-icon" onClick={clearSearch} />
            )}

            {/* SEARCH SUGGESTIONS */}
            {showSuggestions && (
              <div className="search-suggestions">
                {isSearching ? (
                  <div className="suggestion-loading">Đang tìm kiếm...</div>
                ) : searchSuggestions.length > 0 ? (
                  <>
                    {searchSuggestions.map((product) => (
                      <div
                        key={product.id}
                        className="suggestion-item"
                        onClick={() => handleSuggestionClick(product.id)}
                        style={{ cursor: 'pointer' }}
                      >
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
                            <div className="suggestion-image-placeholder">🏷️</div>
                          );
                        })()}
                        <div className="suggestion-info">
                          <div className="suggestion-name">{product.name}</div>
                          <div className="suggestion-price">
                            {getProductPrice(product).toLocaleString('vi-VN')} đ
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="suggestion-view-all" onClick={handleSearchSubmit}>
                      Xem tất cả kết quả cho "{searchTerm}"
                    </div>
                  </>
                ) : (
                  searchTerm.trim().length >= 2 && (
                    <div className="suggestion-no-results">Không tìm thấy sản phẩm nào</div>
                  )
                )}
              </div>
            )}
          </div>

          {/* ACTIONS */}
          <div className="header-actions">
            {/* PROFILE */}
            {user ? (
              <div className="profile-dropdown" ref={dropdownRef}>
                <button
                  className="action-item profile-btn"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <FaUser />
                  <span>{user.name}</span>
                </button>

                {showDropdown && (
                  <div className="dropdown-menu">
                    <Link to="/profile" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <FaUser />
                      <span>Tài khoản</span>
                    </Link>
                    <Link to="/my-orders" className="dropdown-item" onClick={() => setShowDropdown(false)}>
                      <FaBoxOpen />
                      <span>Đơn hàng</span>
                    </Link>
                    <button className="dropdown-item logout-btn" onClick={handleLogout}>
                      <FaSignOutAlt />
                      <span>Đăng xuất</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="action-item profile-btn">
                <FaUser />
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* CART */}
            <div className="action-item cart" onClick={handleCartClick} style={{ cursor: 'pointer' }}>
              <FaShoppingCart />
              <span>Giỏ hàng</span>
              {cartCount > 0 && <div className="cart-badge">{cartCount}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* =====================
          MENU
      ===================== */}

      <div className="menu">
        <div className="container">
          <nav className="menu-nav">
            {Array.isArray(categories) &&
              categories.map((category) => (
                <div className="menu-item" key={category.id}>
                  <Link to={`/category/${category.id}`} className="menu-link">
                    {category.name}
                  </Link>
                </div>
              ))}
          </nav>
        </div>
      </div>
    </header>
  );
}

export default Header;