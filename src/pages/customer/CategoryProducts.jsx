import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CustomerLayout from "../../layouts/CustomerLayout";
import ProductCard from "../../components/customer/Prductcard/ProductCard";
import FilterSidebar from "../../components/customer/filters/FilterSidebar";
import { getProducts } from "../../services/productService";
import { getCategories } from "../../services/categoryService";
import { getBrands } from "../../services/brandService";

function CategoryProducts() {
  const { id } = useParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [brands, setBrands] = useState([]);
  const [childCategories, setChildCategories] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState(null);
  const [selectedChildCategory, setSelectedChildCategory] = useState(null);
  const [selectedPrice, setSelectedPrice] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);

  // ===== INJECT CSS =====
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      .cp-container {
        width: 95%;
        max-width: 1500px;
        margin: 0 auto;
        padding: 20px 0 60px;
      }
      .cp-header {
        margin-bottom: 30px;
        text-align: center;
      }
      .cp-title {
        font-size: 28px;
        font-weight: 700;
        color: #111;
        margin-bottom: 8px;
      }
      .cp-content {
        display: flex;
        gap: 24px;
        align-items: flex-start;
      }
      .cp-sidebar-wrapper {
        flex-shrink: 0;
        transition: all 0.3s ease;
      }
      .cp-sidebar-wrapper .filter-sidebar.collapsed {
        width: auto;
        min-width: 60px;
      }
      .cp-products-section {
        flex: 1;
        min-width: 0;
      }
      .cp-toolbar {
        width: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        background: #fff;
        padding: 16px 20px;
        border-radius: 16px;
        border: 1px solid #f3e8df;
        flex-wrap: wrap;
        gap: 12px;
      }
      .cp-result-count {
        font-size: 14px;
        font-weight: 600;
        color: #444;
      }
      .cp-sort-box {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .cp-sort-label {
        font-size: 14px;
        color: #666;
      }
      .cp-sort-select {
        height: 40px;
        padding: 0 14px;
        border-radius: 10px;
        border: 1px solid #ddd;
        background: #fff;
        outline: none;
        cursor: pointer;
        font-size: 13px;
      }
      .cp-sort-select:focus {
        border-color: #ff6b00;
      }
      .cp-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 20px;
      }
      .cp-product-item {
        width: 100%;
      }
      .cp-empty {
        width: 100%;
        background: #fff;
        border: 1px solid #eee;
        border-radius: 16px;
        padding: 40px;
        text-align: center;
        font-size: 16px;
        color: #777;
      }
      .cp-loading {
        padding: 50px;
        text-align: center;
        font-size: 18px;
        color: #888;
      }

      /* Responsive */
      @media (max-width: 1024px) {
        .cp-grid {
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 16px;
        }
      }
      @media (max-width: 768px) {
        .cp-container {
          width: 100%;
          padding: 12px 12px 40px;
        }
        .cp-content {
          flex-direction: column;
          gap: 16px;
        }
        .cp-sidebar-wrapper {
          width: 100%;
        }
        .cp-header {
          margin-bottom: 16px;
        }
        .cp-title {
          font-size: 22px;
        }
        .cp-toolbar {
          padding: 12px 16px;
          flex-direction: column;
          align-items: stretch;
          gap: 10px;
          border-radius: 12px;
        }
        .cp-result-count {
          font-size: 13px;
          text-align: center;
        }
        .cp-sort-box {
          justify-content: center;
        }
        .cp-sort-select {
          height: 36px;
          font-size: 12px;
        }
        .cp-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
        }
        .cp-empty {
          padding: 30px 20px;
          font-size: 14px;
        }
      }
      @media (max-width: 400px) {
        .cp-grid {
          grid-template-columns: 1fr 1fr;
          gap: 10px;
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
    loadFilters();
  }, [id]);

  const loadFilters = async () => {
    try {
      const brandRes = await getBrands();
      let brandData = [];
      if (brandRes?.data && Array.isArray(brandRes.data)) {
        brandData = brandRes.data;
      } else if (brandRes?.data?.brands && Array.isArray(brandRes.data.brands)) {
        brandData = brandRes.data.brands;
      } else if (brandRes?.brands && Array.isArray(brandRes.brands)) {
        brandData = brandRes.brands;
      } else if (Array.isArray(brandRes)) {
        brandData = brandRes;
      }
      setBrands(brandData);

      const categoryRes = await getCategories();
      let categories = [];
      if (categoryRes?.data && Array.isArray(categoryRes.data)) {
        categories = categoryRes.data;
      } else if (Array.isArray(categoryRes)) {
        categories = categoryRes;
      }

      const currentCategory = categories.find((item) => item.id === Number(id));
      if (currentCategory) {
        setCategoryName(currentCategory.name);
        setChildCategories(currentCategory.children || []);
      }
    } catch (error) {
      console.log("LOAD FILTER ERROR:", error);
    }
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const params = {};
      const categoryId = selectedChildCategory || id;
      if (categoryId) params.category_id = categoryId;
      params.limit = 100;

      if (sortBy === "price_asc") params.sort = "price_asc";
      else if (sortBy === "price_desc") params.sort = "price_desc";
      else params.sort = "newest";

      if (selectedBrand) params.brand_id = selectedBrand;

      if (selectedPrice === "under_500") params.max_price = 500000;
      else if (selectedPrice === "500_1000") {
        params.min_price = 500000;
        params.max_price = 1000000;
      } else if (selectedPrice === "over_1000") {
        params.min_price = 1000000;
      }

      const res = await getProducts(params);
      let productsData = [];
      if (res.data?.data?.products) productsData = res.data.data.products;
      else if (res.data?.data && Array.isArray(res.data.data)) productsData = res.data.data;
      else if (res.data?.products && Array.isArray(res.data.products)) productsData = res.data.products;
      else if (Array.isArray(res.data)) productsData = res.data;
      setProducts(productsData);
    } catch (error) {
      console.log("LOAD PRODUCTS ERROR:", error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [id, selectedBrand, selectedChildCategory, selectedPrice, sortBy]);

  const brandIdsFromProducts =
    products.length > 0 ? [...new Set(products.map((p) => p.brand_id).filter(Boolean))] : [];
  const availableBrands = brands.filter((brand) => brandIdsFromProducts.includes(brand.id));

  const toggleFilterSidebar = () => {
    setIsFilterCollapsed((prev) => !prev);
  };

  if (loading) {
    return (
      <CustomerLayout>
        <div className="cp-loading">Đang tải sản phẩm...</div>
      </CustomerLayout>
    );
  }

  return (
    <CustomerLayout>
      <div className="cp-container">
        <div className="cp-header">
          <h2 className="cp-title">{categoryName || "Danh mục"}</h2>
        </div>

        <div className="cp-content">
          <div className="cp-sidebar-wrapper">
            <FilterSidebar
              brands={availableBrands}
              selectedBrand={selectedBrand}
              setSelectedBrand={setSelectedBrand}
              childCategories={childCategories}
              selectedChildCategory={selectedChildCategory}
              setSelectedChildCategory={setSelectedChildCategory}
              selectedPrice={selectedPrice}
              setSelectedPrice={setSelectedPrice}
              isCollapsible={true}
              isSidebarCollapsed={isFilterCollapsed}
              onToggleSidebar={toggleFilterSidebar}
            />
          </div>

          <div className="cp-products-section">
            <div className="cp-toolbar">
              <div className="cp-result-count">{products.length} sản phẩm</div>
              <div className="cp-sort-box">
                <span className="cp-sort-label">Sắp xếp:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="cp-sort-select"
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price_asc">Giá tăng dần</option>
                  <option value="price_desc">Giá giảm dần</option>
                </select>
              </div>
            </div>

            {products.length === 0 ? (
              <div className="cp-empty">Không có sản phẩm</div>
            ) : (
              <div className="cp-grid">
                {products.map((product) => {
                  const productPrice =
                    product.variants?.[0]?.price || product.price || 0;
                  const productImage =
                    product.images?.[0]?.image_url ||
                    product.image ||
                    "https://picsum.photos/300/300";

                  return (
                    <div key={product.id} className="cp-product-item">
                      <ProductCard
                        product={{
                          ...product,
                          image: productImage,
                          price: Number(productPrice),
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </CustomerLayout>
  );
}

export default CategoryProducts;