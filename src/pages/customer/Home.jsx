import CustomerLayout from "../../layouts/CustomerLayout";
import Banner from "../../components/customer/Banner";
import LatestProducts from "../../components/customer/LatestProducts";
import BestSellingProducts from "../../components/customer/BestSellingProducts";


function Home() {
    return (
        <CustomerLayout>
            <Banner />
            <LatestProducts />
            <BestSellingProducts />  {/* Bán chạy */}
        </CustomerLayout>
    );
}

export default Home;