import {
    BrowserRouter,
    Routes,
    Route,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

// Đăng ký , đăng nhập
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";

// Trang admin
import AdminRoutes from "./routes/AdminRoutes";

// Trang người dùng
import Home from "./pages/customer/Home";
import Profile from "./pages/customer/Profile";
import ProductDetail from "./pages/customer/ProductDetail";
import Cart from "./pages/customer/Cart";
import CategoryProducts from "./pages/customer/CategoryProducts";
import Checkout from "./pages/customer/Checkout";
import PaymentSuccess from "./pages/customer/PaymentSuccess";
import PaymentCancel from "./pages/customer/PaymentCancel";
import OrderDetail from "./pages/customer/OrderDetail";
import MyOrders from "./pages/customer/orders/MyOrders";
import SearchResults from "./pages/customer/SearchResults";

function App() {
    return (
        <BrowserRouter>
            <Toaster position="top-right" />

            <Routes>
                {/* Trang chủ */}
                <Route path="/" element={<Home />} />

                {/* Đăng nhập / Đăng ký */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Admin */}
                <Route path="/admin/*" element={<AdminRoutes />} />

                {/* Người dùng */}
                <Route path="/user" element={<Home />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/payment-success" element={<PaymentSuccess />} />
                <Route path="/payment-cancel" element={<PaymentCancel />} />
                <Route path="/my-orders/:id" element={<OrderDetail />} />
                <Route path="/category/:id" element={<CategoryProducts />} />
                <Route path="/my-orders" element={<MyOrders />} />
                <Route path="/search" element={<SearchResults />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;