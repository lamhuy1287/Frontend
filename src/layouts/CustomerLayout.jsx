import Header from "../components/customer/Header";
import Footer from "../components/customer/Footer";

function CustomerLayout({ children }) {

    return (

        <div className="layout">

            <Header />

            <main className="main-content">

                {children}

            </main>

            <Footer />

        </div>

    );
}

export default CustomerLayout;