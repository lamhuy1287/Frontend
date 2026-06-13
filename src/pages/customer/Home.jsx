import CustomerLayout from "../../layouts/CustomerLayout";
import Banner from "../../components/customer/Banner";
import LatestProducts from "../../components/customer/LatestProducts";
import BestSellingProducts from "../../components/customer/BestSellingProducts";
import ProductCard from "../../components/customer/Prductcard/ProductCard";


function Home() {
    return (
        <CustomerLayout>
            <Banner />
            <LatestProducts />
            <BestSellingProducts />  
        </CustomerLayout>
    );
}

export default Home;