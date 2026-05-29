
function FilterSidebar({

    childCategories = [],

    selectedChildCategory,

    setSelectedChildCategory,

    selectedPrice,

    setSelectedPrice
}) {

    // =========================
    // RESET FILTER
    // =========================

    const resetFilters = () => {

        setSelectedChildCategory(null);

        setSelectedPrice(null);
    };

    return (

        <div style={styles.sidebar}>

            {/* =====================
                HEADER
            ===================== */}

            <div style={styles.top}>

                <h2 style={styles.filterTitle}>
                    Bộ lọc
                </h2>

                <button
                    style={styles.resetBtn}
                    onClick={resetFilters}
                >
                    Reset
                </button>

            </div>

            {/* =====================
                PRICE
            ===================== */}

            <div style={styles.section}>

                <h3 style={styles.title}>
                    Giá tiền
                </h3>

                <label style={styles.item}>

                    <input
                        type="radio"
                        name="price"
                        checked={
                            selectedPrice ===
                            "under_500"
                        }
                        onChange={() =>
                            setSelectedPrice(
                                "under_500"
                            )
                        }
                    />

                    Dưới 500K

                </label>

                <label style={styles.item}>

                    <input
                        type="radio"
                        name="price"
                        checked={
                            selectedPrice ===
                            "500_1000"
                        }
                        onChange={() =>
                            setSelectedPrice(
                                "500_1000"
                            )
                        }
                    />

                    500K - 1 Triệu

                </label>

                <label style={styles.item}>

                    <input
                        type="radio"
                        name="price"
                        checked={
                            selectedPrice ===
                            "over_1000"
                        }
                        onChange={() =>
                            setSelectedPrice(
                                "over_1000"
                            )
                        }
                    />

                    Trên 1 Triệu

                </label>

            </div>

            {/* =====================
                CHILD CATEGORY
            ===================== */}

            <div style={styles.section}>

                <h3 style={styles.title}>
                    Danh mục con
                </h3>

                {childCategories.length === 0 && (

                    <p>
                        Không có danh mục con
                    </p>

                )}

                {childCategories.map((category) => (

                    <label
                        key={category.id}
                        style={styles.item}
                    >

                        <input
                            type="radio"
                            name="child_category"
                            checked={
                                selectedChildCategory
                                === category.id
                            }
                            onChange={() =>
                                setSelectedChildCategory(
                                    category.id
                                )
                            }
                        />

                        {category.name}

                    </label>

                ))}

            </div>

        </div>

    );
}

const styles = {

    sidebar: {

        width: "260px",

        minWidth: "260px",

        background: "#fff",

        border: "1px solid #eee",

        borderRadius: "12px",

        padding: "20px",

        height: "fit-content",

        position: "sticky",

        top: "120px"
    },

    top: {

        display: "flex",

        justifyContent: "space-between",

        alignItems: "center",

        marginBottom: "25px"
    },

    filterTitle: {

        fontSize: "22px",

        fontWeight: "700"
    },

    resetBtn: {

        border: "none",

        background: "#111",

        color: "#fff",

        padding: "8px 14px",

        borderRadius: "8px",

        cursor: "pointer"
    },

    section: {

        marginBottom: "30px"
    },

    title: {

        fontSize: "18px",

        fontWeight: "600",

        marginBottom: "15px"
    },

    item: {

        display: "flex",

        alignItems: "center",

        gap: "10px",

        marginBottom: "12px",

        cursor: "pointer",

        fontSize: "14px"
    }
};

export default FilterSidebar;
