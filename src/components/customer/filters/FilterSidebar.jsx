import { useState } from "react";

function FilterSidebar({

    // =====================
    // CATEGORY PROPS
    // =====================
    childCategories = [],
    selectedChildCategory,
    setSelectedChildCategory,

    // =====================
    // PRICE PROPS
    // =====================
    selectedPrice,
    setSelectedPrice,

    // =====================
    // BRAND PROPS
    // =====================
    brands = [],
    selectedBrand,
    setSelectedBrand,

    // =====================
    // OPTIONAL: COLLAPSE SECTIONS
    // =====================
    isCollapsible = false

}) {

    // State cho collapse sections (nếu cần)
    const [openSections, setOpenSections] = useState({
        price: true,
        brand: true,
        category: true
    });

    const toggleSection = (section) => {
        if (isCollapsible) {
            setOpenSections(prev => ({
                ...prev,
                [section]: !prev[section]
            }));
        }
    };

    // =========================
    // RESET ALL FILTERS
    // =========================

    const resetAllFilters = () => {
        setSelectedChildCategory(null);
        setSelectedPrice(null);
        setSelectedBrand(null);
    };

    // =========================
    // CHECK ACTIVE FILTERS
    // =========================

    const hasActiveFilters = () => {
        return selectedChildCategory !== null ||
            selectedPrice !== null ||
            selectedBrand !== null;
    };

    // =========================
    // COUNT ACTIVE FILTERS
    // =========================

    const getActiveFilterCount = () => {
        let count = 0;
        if (selectedChildCategory) count++;
        if (selectedPrice) count++;
        if (selectedBrand) count++;
        return count;
    };

    // =========================
    // RENDER SECTION HEADER
    // =========================

    const renderSectionHeader = (title, section, count = 0) => {
        return (
            <div
                style={{
                    ...styles.sectionHeader,
                    cursor: isCollapsible ? "pointer" : "default"
                }}
                onClick={() => isCollapsible && toggleSection(section)}
            >
                <h3 style={styles.sectionTitle}>{title}</h3>
                {count > 0 && (
                    <span style={styles.filterBadge}>{count}</span>
                )}
                {isCollapsible && (
                    <span style={styles.chevron}>
                        {openSections[section] ? "▼" : "▶"}
                    </span>
                )}
            </div>
        );
    };

    // =========================
    // RENDER PRICE SECTION
    // =========================

    const renderPriceSection = () => {
        if (!openSections.price && isCollapsible) return null;

        return (
            <div style={styles.section}>
                {renderSectionHeader("💰 Giá tiền", "price")}
                <div style={styles.sectionContent}>
                    <label style={styles.radioItem}>
                        <input
                            type="radio"
                            name="price"
                            checked={selectedPrice === null}
                            onChange={() => setSelectedPrice(null)}
                            style={styles.radio}
                        />
                        <span style={styles.radioLabel}>Tất cả</span>
                    </label>

                    <label style={styles.radioItem}>
                        <input
                            type="radio"
                            name="price"
                            checked={selectedPrice === "under_500"}
                            onChange={() => setSelectedPrice("under_500")}
                            style={styles.radio}
                        />
                        <span style={styles.radioLabel}>Dưới 500.000đ</span>
                    </label>

                    <label style={styles.radioItem}>
                        <input
                            type="radio"
                            name="price"
                            checked={selectedPrice === "500_1000"}
                            onChange={() => setSelectedPrice("500_1000")}
                            style={styles.radio}
                        />
                        <span style={styles.radioLabel}>500.000đ - 1.000.000đ</span>
                    </label>

                    <label style={styles.radioItem}>
                        <input
                            type="radio"
                            name="price"
                            checked={selectedPrice === "over_1000"}
                            onChange={() => setSelectedPrice("over_1000")}
                            style={styles.radio}
                        />
                        <span style={styles.radioLabel}>Trên 1.000.000đ</span>
                    </label>
                </div>
            </div>
        );
    };

    // =========================
    // RENDER BRAND SECTION
    // =========================

    const renderBrandSection = () => {
        if (!brands || brands.length === 0) return null;
        if (!openSections.brand && isCollapsible) return null;

        return (
            <div style={styles.section}>
                {renderSectionHeader("🏷️ Thương hiệu", "brand")}
                <div style={styles.sectionContent}>
                    <label style={styles.radioItem}>
                        <input
                            type="radio"
                            name="brand"
                            checked={selectedBrand === null}
                            onChange={() => setSelectedBrand(null)}
                            style={styles.radio}
                        />
                        <span style={styles.radioLabel}>Tất cả</span>
                    </label>

                    {brands.map((brand) => (
                        <label
                            key={brand.id}
                            style={styles.radioItem}
                        >
                            <input
                                type="radio"
                                name="brand"
                                checked={selectedBrand === brand.id}
                                onChange={() => setSelectedBrand(brand.id)}
                                style={styles.radio}
                            />
                            <span style={styles.radioLabel}>{brand.name}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    };

    // =========================
    // RENDER CATEGORY SECTION
    // =========================

    const renderCategorySection = () => {
        if (!childCategories || childCategories.length === 0) return null;
        if (!openSections.category && isCollapsible) return null;

        return (
            <div style={styles.section}>
                {renderSectionHeader("📂 Danh mục con", "category")}
                <div style={styles.sectionContent}>
                    <label style={styles.radioItem}>
                        <input
                            type="radio"
                            name="child_category"
                            checked={selectedChildCategory === null}
                            onChange={() => setSelectedChildCategory(null)}
                            style={styles.radio}
                        />
                        <span style={styles.radioLabel}>Tất cả</span>
                    </label>

                    {childCategories.map((category) => (
                        <label
                            key={category.id}
                            style={styles.radioItem}
                        >
                            <input
                                type="radio"
                                name="child_category"
                                checked={selectedChildCategory === category.id}
                                onChange={() => setSelectedChildCategory(category.id)}
                                style={styles.radio}
                            />
                            <span style={styles.radioLabel}>{category.name}</span>
                        </label>
                    ))}
                </div>
            </div>
        );
    };

    // =========================
    // RENDER ACTIVE FILTER TAGS
    // =========================

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
            activeFilters.push({ type: "price", label: priceText, onRemove: () => setSelectedPrice(null) });
        }

        if (selectedBrand) {
            const brand = brands.find(b => b.id === selectedBrand);
            if (brand) {
                activeFilters.push({ type: "brand", label: brand.name, onRemove: () => setSelectedBrand(null) });
            }
        }

        if (selectedChildCategory) {
            const category = childCategories.find(c => c.id === selectedChildCategory);
            if (category) {
                activeFilters.push({ type: "category", label: category.name, onRemove: () => setSelectedChildCategory(null) });
            }
        }

        return (
            <div style={styles.activeFilters}>
                <div style={styles.activeFiltersHeader}>
                    <span style={styles.activeFiltersTitle}>Bộ lọc đang chọn</span>
                    <button onClick={resetAllFilters} style={styles.clearAllBtn}>
                        Xóa tất cả
                    </button>
                </div>
                <div style={styles.filterTags}>
                    {activeFilters.map((filter, index) => (
                        <div key={index} style={styles.filterTag}>
                            <span>{filter.label}</span>
                            <button
                                onClick={filter.onRemove}
                                style={styles.removeTagBtn}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    // =========================
    // MAIN RENDER
    // =========================

    return (
        <div style={styles.sidebar}>

            {/* HEADER */}
            <div style={styles.header}>
                <h2 style={styles.title}>
                    🔍 Bộ lọc sản phẩm
                </h2>
                {hasActiveFilters() && (
                    <button
                        onClick={resetAllFilters}
                        style={styles.resetAllBtn}
                    >
                        Xóa hết ({getActiveFilterCount()})
                    </button>
                )}
            </div>

            {/* ACTIVE FILTER TAGS */}
            {renderActiveFilters()}

            {/* FILTER SECTIONS */}
            <div style={styles.filtersContainer}>
                {renderPriceSection()}
                {renderBrandSection()}
                {renderCategorySection()}
            </div>

            {/* NO FILTERS MESSAGE */}
            {(!brands || brands.length === 0) &&
                (!childCategories || childCategories.length === 0) && (
                    <div style={styles.noFilters}>
                        <span>📭</span>
                        <p>Không có bộ lọc nào</p>
                    </div>
                )}
        </div>
    );
}

// =========================
// STYLES
// =========================

const styles = {
    sidebar: {
        width: "300px",
        minWidth: "300px",
        background: "#ffffff",
        borderRadius: "24px",
        padding: "24px",
        position: "sticky",
        top: "20px",
        border: "1px solid #eaeaea",
        boxShadow: "0 10px 35px rgba(0,0,0,0.08)",
        transition: "all 0.3s ease"
    },

    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "24px",
        paddingBottom: "16px",
        borderBottom: "1px solid #f1f1f1"
    },

    title: {
        fontSize: "20px",
        fontWeight: "700",
        color: "#111827",
        margin: 0,
        letterSpacing: "-0.3px"
    },

    resetAllBtn: {
        border: "none",
        background: "#fff3eb",
        color: "#ff6b00",
        fontSize: "13px",
        fontWeight: "600",
        cursor: "pointer",
        padding: "8px 12px",
        borderRadius: "10px"
    },

    filtersContainer: {
        display: "flex",
        flexDirection: "column",
        gap: "10px"
    },

    section: {
        background: "#fafafa",
        borderRadius: "16px",
        padding: "16px",
        border: "1px solid #f0f0f0"
    },

    sectionHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "14px"
    },

    sectionTitle: {
        fontSize: "15px",
        fontWeight: "700",
        color: "#1f2937",
        margin: 0
    },

    filterBadge: {
        background: "#ff6b00",
        color: "#fff",
        padding: "3px 8px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: "700"
    },

    chevron: {
        color: "#6b7280",
        fontSize: "12px"
    },

    sectionContent: {
        display: "flex",
        flexDirection: "column",
        gap: "8px",
        maxHeight: "260px",
        overflowY: "auto",
        paddingRight: "4px"
    },

    radioItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "10px 12px",
        borderRadius: "12px",
        background: "#ffffff",
        cursor: "pointer",
        border: "1px solid #ececec",
        transition: "all 0.2s ease"
    },

    radio: {
        width: "18px",
        height: "18px",
        accentColor: "#ff6b00",
        cursor: "pointer"
    },

    radioLabel: {
        fontSize: "14px",
        color: "#374151",
        fontWeight: "500",
        flex: 1
    },

    activeFilters: {
        background: "#fffaf5",
        border: "1px solid #ffe3cc",
        borderRadius: "16px",
        padding: "16px",
        marginBottom: "20px"
    },

    activeFiltersHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "12px"
    },

    activeFiltersTitle: {
        fontSize: "14px",
        fontWeight: "700",
        color: "#374151"
    },

    clearAllBtn: {
        border: "none",
        background: "transparent",
        color: "#ff6b00",
        fontWeight: "600",
        cursor: "pointer",
        fontSize: "13px"
    },

    filterTags: {
        display: "flex",
        flexWrap: "wrap",
        gap: "8px"
    },

    filterTag: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        background: "#ff6b00",
        color: "#fff",
        padding: "7px 12px",
        borderRadius: "999px",
        fontSize: "12px",
        fontWeight: "600"
    },

    removeTagBtn: {
        border: "none",
        background: "rgba(255,255,255,0.2)",
        color: "#fff",
        borderRadius: "50%",
        width: "18px",
        height: "18px",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: "11px"
    },

    noFilters: {
        textAlign: "center",
        padding: "50px 20px",
        color: "#9ca3af",
        fontSize: "14px"
    }
};

export default FilterSidebar;