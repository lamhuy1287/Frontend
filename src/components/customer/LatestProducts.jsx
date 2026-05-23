import { useEffect, useState } from "react";
import { getProducts } from "../../services/productService";
import ProductCard from "./ProductCard";

function LatestProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await getProducts({
                    sort: "newest",
                    limit: 8
                });

                console.log("API RESPONSE:", res.data);

                const productsArray = 
                    res.data?.data?.products ||
                    res.data?.products ||
                    [];

                console.log("Products array:", productsArray);

                setProducts(Array.isArray(productsArray) ? productsArray : []);
                setError(null);
            } catch (error) {
                console.log("Lỗi load sản phẩm:", error);
                setError("Không thể tải danh sách sản phẩm. Vui lòng thử lại sau!");
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="mt-10 container mx-auto text-center py-10">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                <p className="mt-2 text-gray-600">Đang tải sản phẩm...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mt-10 container mx-auto text-center py-10">
                <p className="text-red-500">{error}</p>
                <button 
                    onClick={() => window.location.reload()} 
                    className="mt-3 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition"
                >
                    Thử lại
                </button>
            </div>
        );
    }

    if (products.length === 0) {
        return (
            <div className="mt-10 container mx-auto text-center py-10">
                <p className="text-gray-500">Không có sản phẩm nào!</p>
            </div>
        );
    }

    return (
        <section className="mt-10 container mx-auto px-4">
            <h2 className="text-2xl font-bold mb-5">
                Sản phẩm mới nhất
            </h2>

            {/* Grid layout đẹp như Shopee, Tiki */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {products.map((p) => (
                    <ProductCard
                        key={p.id || p.product_code || Math.random()}
                        product={p}
                        onAddToCart={(product) => {
                            console.log("Add to cart:", product);
                            // Thêm logic giỏ hàng ở đây
                        }}
                    />
                ))}
            </div>
        </section>
    );
}

export default LatestProducts;