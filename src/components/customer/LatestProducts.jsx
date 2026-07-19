import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import ProductCard from "./Prductcard/ProductCard";

import "./LatestProducts.css";

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
                    limit: 5 // chỉ lấy 5 sản phẩm
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

            <section className="latest-products-loading">

                <div className="latest-spinner"></div>

                <p>
                    Đang tải sản phẩm...
                </p>

            </section>

        );

    }

    // =========================
    // UI
    // =========================
    return (

        <section className="latest-products">

            <div className="latest-products-container">

                {/* HEADER */}
                <div className="latest-products-header">

                    <div>

                        <h2 className="latest-products-title">
                            Sản phẩm mới nhất
                        </h2>
                    </div>

                </div>

                {/* GRID */}
                <div className="latest-products-grid">

                    {products.map((p) => (

                        <div
                            key={p.id}
                            className="latest-product-item"
                        >

                            <ProductCard product={p} />

                        </div>

                    ))}

                </div>

            </div>

        </section>

    );

}

export default LatestProducts;