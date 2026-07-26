import { useState, useEffect } from "react";

function FilterSidebar({
  childCategories = [],
  selectedChildCategory,
  setSelectedChildCategory,
  selectedPrice,
  setSelectedPrice,
  brands = [],
  selectedBrand,
  setSelectedBrand,
  isCollapsible = false,
  isSidebarCollapsed = false,
  onToggleSidebar = null,
}) {
  const [openSections, setOpenSections] = useState({
    price: true,
    brand: true,
    category: true,
  });

  // ===== INJECT CSS =====
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      /* ===== FILTER SIDEBAR ===== */
      .filter-sidebar {
        width: 300px;
        min-width: 300px;
        background: #ffffff;
        border-radius: 24px;
        padding: 24px;
        position: sticky;
        top: 20px;
        border: 1px solid #eaeaea;
        box-shadow: 0 10px 35px rgba(0,0,0,0.08);
        transition: all 0.3s ease;
        max-height: calc(100vh - 40px);
        overflow-y: auto;
      }
      .filter-sidebar.collapsed {
        padding: 16px;
        min-width: unset;
        width: auto;
      }
      .filter-sidebar.collapsed .filter-sidebar-title {
        font-size: 16px;
      }
      .filter-sidebar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
        padding-bottom: 16px;
        border-bottom: 1px solid #f1f1f1;
      }
      .filter-sidebar-title {
        font-size: 20px;
        font-weight: 700;
        color: #111827;
        margin: 0;
        letter-spacing: -0.3px;
      }
      .filter-sidebar-reset-btn {
        border: none;
        background: #fff3eb;
        color: #ff6b00;
        font-size: 13px;
        font-weight: 600;
        cursor: pointer;
        padding: 8px 12px;
        border-radius: 10px;
        transition: 0.2s;
      }
      .filter-sidebar-reset-btn:hover {
        background: #ffe4d5;
      }
      .filter-sidebar-toggle-btn {
        border: none;
        background: transparent;
        font-size: 20px;
        cursor: pointer;
        padding: 4px 8px;
        border-radius: 8px;
        transition: 0.2s;
        line-height: 1;
      }
      .filter-sidebar-toggle-btn:hover {
        background: #f0f0f0;
      }
      .filter-active-filters {
        background: #fffaf5;
        border: 1px solid #ffe3cc;
        border-radius: 16px;
        padding: 16px;
        margin-bottom: 20px;
      }
      .filter-active-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }
      .filter-active-title {
        font-size: 14px;
        font-weight: 700;
        color: #374151;
      }
      .filter-clear-all {
        border: none;
        background: transparent;
        color: #ff6b00;
        font-weight: 600;
        cursor: pointer;
        font-size: 13px;
      }
      .filter-clear-all:hover {
        text-decoration: underline;
      }
      .filter-tags {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }
      .filter-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        background: #ff6b00;
        color: #fff;
        padding: 7px 12px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
      }
      .filter-tag-remove {
        border: none;
        background: rgba(255,255,255,0.2);
        color: #fff;
        border-radius: 50%;
        width: 18px;
        height: 18px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 11px;
      }
      .filter-tag-remove:hover {
        background: rgba(255,255,255,0.4);
      }
      .filter-sections {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .filter-section {
        background: #fafafa;
        border-radius: 16px;
        padding: 16px;
        border: 1px solid #f0f0f0;
      }
      .filter-section-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }
      .filter-section-title {
        font-size: 15px;
        font-weight: 700;
        color: #1f2937;
        margin: 0;
      }
      .filter-badge {
        background: #ff6b00;
        color: #fff;
        padding: 3px 8px;
        border-radius: 999px;
        font-size: 11px;
        font-weight: 700;
      }
      .filter-chevron {
        color: #6b7280;
        font-size: 12px;
      }
      .filter-section-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        max-height: 260px;
        overflow-y: auto;
        padding-right: 4px;
      }
      .filter-radio-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 12px;
        border-radius: 12px;
        background: #ffffff;
        cursor: pointer;
        border: 1px solid #ececec;
        transition: all 0.2s ease;
      }
      .filter-radio-item:hover {
        border-color: #ff6b00;
        background: #fff7f0;
      }
      .filter-radio-item input[type="radio"] {
        width: 18px;
        height: 18px;
        accent-color: #ff6b00;
        cursor: pointer;
        flex-shrink: 0;
      }
      .filter-radio-label {
        font-size: 14px;
        color: #374151;
        font-weight: 500;
        flex: 1;
      }
      .filter-no-filters {
        text-align: center;
        padding: 50px 20px;
        color: #9ca3af;
        font-size: 14px;
      }

      /* ===== RESPONSIVE ===== */
      @media (max-width: 1024px) {
        .filter-sidebar {
          width: 260px;
          min-width: 260px;
          padding: 20px;
        }
      }
      @media (max-width: 768px) {
        .filter-sidebar {
          width: 100%;
          min-width: unset;
          position: relative;
          top: 0;
          margin-bottom: 20px;
          padding: 16px;
          border-radius: 16px;
          max-height: none;
          overflow-y: visible;
        }
        .filter-sidebar.collapsed {
          padding: 12px;
        }
        .filter-sidebar.collapsed .filter-sidebar-title {
          font-size: 14px;
        }
        .filter-sidebar-header {
          flex-wrap: wrap;
          gap: 8px;
        }
        .filter-sidebar-title {
          font-size: 18px;
        }
        .filter-section {
          padding: 12px;
        }
        .filter-radio-item {
          padding: 8px 10px;
        }
        .filter-radio-label {
          font-size: 13px;
        }
        .filter-active-filters {
          padding: 12px;
        }
        .filter-tag {
          font-size: 11px;
          padding: 5px 10px;
        }
        .filter-section-content {
          max-height: 200px;
        }
      }
      @media (max-width: 400px) {
        .filter-sidebar {
          padding: 12px;
        }
        .filter-sidebar-title {
          font-size: 16px;
        }
        .filter-radio-item {
          padding: 6px 8px;
          font-size: 12px;
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // ===== LOGIC =====
  const toggleSection = (section) => {
    if (isCollapsible) {
      setOpenSections((prev) => ({
        ...prev,
        [section]: !prev[section],
      }));
    }
  };

  const resetAllFilters = () => {
    setSelectedChildCategory(null);
    setSelectedPrice(null);
    setSelectedBrand(null);
  };

  const hasActiveFilters = () =>
    selectedChildCategory !== null ||
    selectedPrice !== null ||
    selectedBrand !== null;

  const getActiveFilterCount = () => {
    let count = 0;
    if (selectedChildCategory) count++;
    if (selectedPrice) count++;
    if (selectedBrand) count++;
    return count;
  };

  const renderSectionHeader = (title, section, count = 0) => (
    <div
      className="filter-section-header"
      style={{ cursor: isCollapsible ? "pointer" : "default" }}
      onClick={() => isCollapsible && toggleSection(section)}
    >
      <h3 className="filter-section-title">{title}</h3>
      {count > 0 && <span className="filter-badge">{count}</span>}
      {isCollapsible && (
        <span className="filter-chevron">
          {openSections[section] ? "▼" : "▶"}
        </span>
      )}
    </div>
  );

  const renderPriceSection = () => {
    if (!openSections.price && isCollapsible) return null;
    return (
      <div className="filter-section">
        {renderSectionHeader("💰 Giá tiền", "price")}
        <div className="filter-section-content">
          <label className="filter-radio-item">
            <input
              type="radio"
              name="price"
              checked={selectedPrice === null}
              onChange={() => setSelectedPrice(null)}
            />
            <span className="filter-radio-label">Tất cả</span>
          </label>
          <label className="filter-radio-item">
            <input
              type="radio"
              name="price"
              checked={selectedPrice === "under_500"}
              onChange={() => setSelectedPrice("under_500")}
            />
            <span className="filter-radio-label">Dưới 500.000đ</span>
          </label>
          <label className="filter-radio-item">
            <input
              type="radio"
              name="price"
              checked={selectedPrice === "500_1000"}
              onChange={() => setSelectedPrice("500_1000")}
            />
            <span className="filter-radio-label">500.000đ - 1.000.000đ</span>
          </label>
          <label className="filter-radio-item">
            <input
              type="radio"
              name="price"
              checked={selectedPrice === "over_1000"}
              onChange={() => setSelectedPrice("over_1000")}
            />
            <span className="filter-radio-label">Trên 1.000.000đ</span>
          </label>
        </div>
      </div>
    );
  };

  const renderBrandSection = () => {
    if (!brands || brands.length === 0) return null;
    if (!openSections.brand && isCollapsible) return null;
    return (
      <div className="filter-section">
        {renderSectionHeader("🏷️ Thương hiệu", "brand")}
        <div className="filter-section-content">
          <label className="filter-radio-item">
            <input
              type="radio"
              name="brand"
              checked={selectedBrand === null}
              onChange={() => setSelectedBrand(null)}
            />
            <span className="filter-radio-label">Tất cả</span>
          </label>
          {brands.map((brand) => (
            <label key={brand.id} className="filter-radio-item">
              <input
                type="radio"
                name="brand"
                checked={selectedBrand === brand.id}
                onChange={() => setSelectedBrand(brand.id)}
              />
              <span className="filter-radio-label">{brand.name}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderCategorySection = () => {
    if (!childCategories || childCategories.length === 0) return null;
    if (!openSections.category && isCollapsible) return null;
    return (
      <div className="filter-section">
        {renderSectionHeader("📂 Danh mục con", "category")}
        <div className="filter-section-content">
          <label className="filter-radio-item">
            <input
              type="radio"
              name="child_category"
              checked={selectedChildCategory === null}
              onChange={() => setSelectedChildCategory(null)}
            />
            <span className="filter-radio-label">Tất cả</span>
          </label>
          {childCategories.map((category) => (
            <label key={category.id} className="filter-radio-item">
              <input
                type="radio"
                name="child_category"
                checked={selectedChildCategory === category.id}
                onChange={() => setSelectedChildCategory(category.id)}
              />
              <span className="filter-radio-label">{category.name}</span>
            </label>
          ))}
        </div>
      </div>
    );
  };

  const renderActiveFilters = () => {
    if (!hasActiveFilters()) return null;

    const activeFilters = [];

    if (selectedPrice) {
      let priceText = "";
      switch (selectedPrice) {
        case "under_500":
          priceText = "Dưới 500.000đ";
          break;
        case "500_1000":
          priceText = "500.000đ - 1.000.000đ";
          break;
        case "over_1000":
          priceText = "Trên 1.000.000đ";
          break;
        default:
          priceText = selectedPrice;
      }
      activeFilters.push({
        type: "price",
        label: priceText,
        onRemove: () => setSelectedPrice(null),
      });
    }

    if (selectedBrand) {
      const brand = brands.find((b) => b.id === selectedBrand);
      if (brand) {
        activeFilters.push({
          type: "brand",
          label: brand.name,
          onRemove: () => setSelectedBrand(null),
        });
      }
    }

    if (selectedChildCategory) {
      const category = childCategories.find((c) => c.id === selectedChildCategory);
      if (category) {
        activeFilters.push({
          type: "category",
          label: category.name,
          onRemove: () => setSelectedChildCategory(null),
        });
      }
    }

    return (
      <div className="filter-active-filters">
        <div className="filter-active-header">
          <span className="filter-active-title">Bộ lọc đang chọn</span>
          <button className="filter-clear-all" onClick={resetAllFilters}>
            Xóa tất cả
          </button>
        </div>
        <div className="filter-tags">
          {activeFilters.map((filter, index) => (
            <div key={index} className="filter-tag">
              <span>{filter.label}</span>
              <button className="filter-tag-remove" onClick={filter.onRemove}>
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ===== RENDER =====
  return (
    <div className={`filter-sidebar ${isSidebarCollapsed ? "collapsed" : ""}`}>
      <div className="filter-sidebar-header">
        <h2 className="filter-sidebar-title">🔍 Bộ lọc sản phẩm</h2>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          {hasActiveFilters() && (
            <button className="filter-sidebar-reset-btn" onClick={resetAllFilters}>
              Xóa hết ({getActiveFilterCount()})
            </button>
          )}
          {onToggleSidebar && (
            <button
              className="filter-sidebar-toggle-btn"
              onClick={onToggleSidebar}
              aria-label={isSidebarCollapsed ? "Mở bộ lọc" : "Thu gọn bộ lọc"}
            >
              {isSidebarCollapsed ? "📂" : "📁"}
            </button>
          )}
        </div>
      </div>

      {!isSidebarCollapsed && (
        <>
          {renderActiveFilters()}
          <div className="filter-sections">
            {renderPriceSection()}
            {renderBrandSection()}
            {renderCategorySection()}
          </div>
          {(!brands || brands.length === 0) &&
            (!childCategories || childCategories.length === 0) && (
              <div className="filter-no-filters">
                <span>📭</span>
                <p>Không có bộ lọc nào</p>
              </div>
            )}
        </>
      )}
    </div>
  );
}

export default FilterSidebar;