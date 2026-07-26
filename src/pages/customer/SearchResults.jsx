import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaSpinner } from "react-icons/fa";

import CustomerLayout from "../../layouts/CustomerLayout";
import ProductCard from "../../components/customer/Prductcard/ProductCard";
import { searchProducts } from "../../services/productService";

function SearchResults() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortBy, setSortBy] = useState("relevance");

  const location = useLocation();
  const navigate = useNavigate();

  const searchQuery = new URLSearchParams(location.search).get("q") || "";

  // ===== INJECT CSS =====
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* ===== SEARCH RESULTS PAGE ===== */
      .sr-container {
        max-width: 1400px;
        margin: 0 auto;
        padding: 30px 20px;
        min-height: 100vh;
      }
      .sr-header {
        text-align: center;
        margin-bottom: 30px;
      }
      .sr-title {
        font-size: 28px;
        font-weight: 700;
        color: #111;
        margin-bottom: 12px;
      }
      .sr-search-info {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 16px;
        flex-wrap: wrap;
      }
      .sr-keyword {
        font-size: 16px;
        color: #ff6b00;
        font-weight: 600;
        background: #fff5ee;
        padding: 8px 20px;
        border-radius: 30px;
      }
      .sr-result-count {
        font-size: 14px;
        color: #666;
        background: #f5f5f5;
        padding: 8px 20px;
        border-radius: 30px;
      }
      .sr-toolbar {
        display: flex;
        justify-content: flex-end;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #eee;
      }
      .sr-sort-box {
        display: flex;
        align-items: center;
        gap: 12px;
      }
      .sr-sort-label {
        font-size: 14px;
        color: #666;
        font-weight: 500;
      }
      .sr-sort-select {
        height: 40px;
        padding: 0 16px;
        border-radius: 10px;
        border: 1px solid #ddd;
        background: #fff;
        outline: none;
        cursor: pointer;
        font-size: 14px;
        min-width: 140px;
      }
      .sr-sort-select:focus {
        border-color: #ff6b00;
      }
      .sr-grid {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 20px;
        margin-top: 20px;
      }
      .sr-product-item {
        width: 100%;
        cursor: pointer;
        transition: transform 0.2s ease;
      }
      .sr-product-item:hover {
        transform: translateY(-4px);
      }
      .sr-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        gap: 16px;
      }
      .sr-spinner {
        font-size: 48px;
        animation: sr-spin 1s linear infinite;
        color: #ff6b00;
      }
      .sr-empty {
        text-align: center;
        padding: 60px 20px;
        background: #fff;
        border-radius: 16px;
        margin-top: 40px;
      }
      .sr-empty-icon {
        font-size: 64px;
        margin-bottom: 20px;
      }
      .sr-empty-title {
        font-size: 20px;
        font-weight: 600;
        color: #333;
        margin-bottom: 10px;
      }
      .sr-empty-text {
        font-size: 14px;
        color: #777;
        margin-bottom: 24px;
      }
      .sr-btn-primary {
        padding: 12px 30px;
        background: #ff6b00;
        color: white;
        border: none;
        border-radius: 30px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }
      .sr-btn-primary:hover {
        background: #e55d00;
        transform: translateY(-2px);
      }
      .sr-show-more {
        text-align: center;
        margin-top: 40px;
      }
      .sr-btn-outline {
        padding: 12px 32px;
        background: transparent;
        color: #ff6b00;
        border: 2px solid #ff6b00;
        border-radius: 30px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s;
      }
      .sr-btn-outline:hover {
        background: #ff6b00;
        color: #fff;
      }

      @keyframes sr-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }

      /* ===== RESPONSIVE ===== */

      /* Tablet & small laptop */
      @media (max-width: 1024px) {
        .sr-grid {
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
        }
        .sr-container {
          padding: 20px 16px;
        }
      }

      /* Mobile */
      @media (max-width: 768px) {
        .sr-container {
          padding: 16px 12px;
        }
        .sr-title {
          font-size: 22px;
        }
        .sr-keyword {
          font-size: 14px;
          padding: 6px 16px;
        }
        .sr-result-count {
          font-size: 13px;
          padding: 6px 16px;
        }
        .sr-toolbar {
          flex-direction: column;
          align-items: stretch;
          gap: 12px;
          padding-bottom: 12px;
        }
        .sr-sort-box {
          justify-content: center;
        }
        .sr-sort-select {
          height: 36px;
          font-size: 13px;
          min-width: 120px;
        }
        .sr-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .sr-empty {
          padding: 40px 16px;
        }
        .sr-empty-icon {
          font-size: 48px;
        }
        .sr-empty-title {
          font-size: 18px;
        }
        .sr-btn-primary,
        .sr-btn-outline {
          padding: 10px 24px;
          font-size: 13px;
        }
      }

      /* Very small screens */
      @media (max-width: 400px) {
        .sr-grid {
          grid-template-columns: 1fr 1fr;
          gap: 10px;
        }
        .sr-title {
          font-size: 18px;
        }
        .sr-sort-select {
          min-width: 100px;
          font-size: 12px;
        }
        .sr-search-info {
          gap: 8px;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ===== LOGIC (giữ nguyên) =====

  useEffect(() => {
    if (!searchQuery) {
      navigate("/");
      return;
    }
    loadSearchResults();
  }, [searchQuery]);

  const loadSearchResults = async () => {
    setLoading(true);
    setError(null);
    try {
      const productsArray = await searchProducts(searchQuery);
      const finalProducts = Array.isArray(productsArray) ? productsArray : [];
      setProducts(finalProducts);
      if (finalProducts.length === 0) {
        setError("Không tìm thấy sản phẩm nào");
      }
    } catch (error) {
      console.log("SEARCH ERROR:", error);
      setError("Có lỗi xảy ra khi tìm kiếm");
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const getSortedProducts = () => {
    if (!Array.isArray(products) || products.length === 0) return [];
    let result = [...products];
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => {
          const priceA = a.variants?.[0]?.price || a.price || 0;
          const priceB = b.variants?.[0]?.price || b.price || 0;
          return priceA - priceB;
        });
        break;
      case "price_desc":
        result.sort((a, b) => {
          const priceA = a.variants?.[0]?.price || a.price || 0;
          const priceB = b.variants?.[0]?.price || b.price || 0;
          return priceB - priceA;
        });
        break;
      case "name_asc":
        result.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
        break;
      case "name_desc":
        result.sort((a, b) => (b.name || "").localeCompare(a.name || ""));
        break;
      default:
        break;
    }
    return result;
  };

  const sortedProducts = getSortedProducts();

  const getProductPrice = (product) => {
    if (product.variants && product.variants.length > 0 && product.variants[0].price) {
      return Number(product.variants[0].price);
    }
    if (product.price) {
      return Number(product.price);
    }
    return 0;
  };

  const getProductImage = (product) => {
    if (product.images && product.images.length > 0 && product.images[0].image_url) {
      return product.images[0].image_url;
    }
    if (product.image) {
      return product.image;
    }
    return "https://via.placeholder.com/300";
  };

  const handleProductClick = (productId) => {
    if (productId) navigate(`/product/${productId}`);
  };

  // ===== RENDER =====

  if (loading) {
    return (
      <CustomerLayout>
        <div className="sr-loading">
          <FaSpinner className="sr-spinner" />
          <p>Đang tìm kiếm...</p>
        </div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="sr-container">
        <div className="sr-header">
          <h1 className="sr-title">Kết quả tìm kiếm</h1>
          <div className="sr-search-info">
            <span className="sr-result-count">{products.length} sản phẩm</span>
          </div>
        </div>

        {products.length > 0 && (
          <div className="sr-toolbar">
            <div className="sr-sort-box">
              <span className="sr-sort-label">Sắp xếp:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="sr-sort-select"
              >
                <option value="relevance">Liên quan nhất</option>
                <option value="price_asc">Giá tăng dần</option>
                <option value="price_desc">Giá giảm dần</option>
                <option value="name_asc">Tên A-Z</option>
                <option value="name_desc">Tên Z-A</option>
              </select>
            </div>
          </div>
        )}

        {error ? (
          <div className="sr-empty">
            <div className="sr-empty-icon">🔍</div>
            <h3 className="sr-empty-title">{error}</h3>
            <p className="sr-empty-text">Hãy thử tìm kiếm với từ khóa khác</p>
            <button onClick={() => navigate("/")} className="sr-btn-primary">
              Về trang chủ
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="sr-empty">
            <div className="sr-empty-icon">🔍</div>
            <h3 className="sr-empty-title">Không tìm thấy sản phẩm</h3>
            <p className="sr-empty-text">
              Không có sản phẩm nào phù hợp với từ khóa "{searchQuery}"
            </p>
            <button onClick={() => navigate("/")} className="sr-btn-primary">
              Tiếp tục mua sắm
            </button>
          </div>
        ) : (
          <>
            <div className="sr-grid">
              {sortedProducts.map((product, index) => {
                const productPrice = getProductPrice(product);
                const productImage = getProductImage(product);
                return (
                  <div
                    key={product.id || index}
                    className="sr-product-item"
                    onClick={() => handleProductClick(product.id)}
                  >
                    <ProductCard
                      product={{
                        ...product,
                        image: productImage,
                        price: productPrice,
                      }}
                    />
                  </div>
                );
              })}
            </div>

            {products.length >= 20 && (
              <div className="sr-show-more">
                <button
                  className="sr-btn-outline"
                  onClick={() => console.log("Load more products")}
                >
                  Xem thêm sản phẩm
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </CustomerLayout>
  );
}

export default SearchResults;