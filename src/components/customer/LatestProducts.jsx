import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import ProductCard from "./PrductCard/ProductCard";

function LatestProducts() {

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);

    // =========================
    // FETCH PRODUCTS
    // =========================
    useEffect(() => {

        const fetchData = async () => {

            try {

                const res = await getProducts({
                    sort: "newest",
                    limit: 10
                });

                const productsArray =
                    res.data?.data?.products ||
                    res.data?.products ||
                    [];

                setProducts(productsArray);

            } catch (error) {

                console.log("Lỗi load sản phẩm:", error);

            } finally {

                setLoading(false);

            }

        };

        fetchData();

    }, []);

    // =========================
    // LOADING
    // =========================
    if (loading) {
        return (
            <div style={styles.loadingContainer}>
                <div style={styles.spinner}></div>

                <p style={styles.loadingText}>
                    Đang tải sản phẩm...
                </p>
            </div>
        );
    }

    // =========================
    // UI
    // =========================
    return (

        <section style={styles.section}>

            <div style={styles.container}>

                {/* TITLE */}
                <h2 style={styles.title}>
                    Sản phẩm mới nhất
                </h2>

                {/* GRID */}
                <div style={styles.grid}>

                    {products.map((p) => (

                        <ProductCard
                            key={p.id}
                            product={p}
                        />

                    ))}

                </div>

            </div>

        </section>

    );
}

// =========================
// STYLES
// =========================
const styles = {

    section: {
        width: "100%",
        marginTop: "50px",
    },

    container: {
        width: "80%",
        maxWidth: "1500px",
        margin: "auto",
        padding: "0 20px",
    },

    title: {
        fontSize: "22px",
        fontWeight: "700",
        marginBottom: "30px",
        color: "#111827",
    },

    grid: {
        display: "grid",

        gridTemplateColumns:
            "repeat(auto-fit, minmax(250px, 1fr))",

        gap: "20px",
    },

    loadingContainer: {
        width: "100%",
        textAlign: "center",
        padding: "60px 0",
    },

    spinner: {
        width: "40px",
        height: "40px",

        border: "4px solid #e5e7eb",
        borderTop: "4px solid #111827",

        borderRadius: "50%",

        margin: "auto",

        animation: "spin 1s linear infinite",
    },

    loadingText: {
        marginTop: "15px",
        color: "#6b7280",
        fontSize: "15px",
    },
};

export default LatestProducts;