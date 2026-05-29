import CustomerLayout from "../../layouts/CustomerLayout";
import Banner from "../../components/customer/Banner";
import LatestProducts from "../../components/customer/LatestProducts";


function Home() {
    return (
        <CustomerLayout>
            <Banner />
            <LatestProducts />
        </CustomerLayout>
    );
}

export default Home;