import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";
// Đăng ký , đăng nhập
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
// Trang admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserDashboard from "./pages/customer/UserDashboard";
import AdminRoutes from "./routes/AdminRoutes";


// Trang người dùng
import Home from "./pages/customer/Home";
import Profile from "./pages/customer/Profile";
import ProductDetail from "./pages/customer/ProductDetail";
import Cart from "./pages/customer/Cart";
import CategoryProducts from "./pages/customer/CategoryProducts";


function App() {

    return (
        <BrowserRouter>

            <Routes>

                <Route
                    path="/"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/admin/*"
                    element={<AdminRoutes />}
                />


                <Route
                    path="/user"
                    element={<Home />}
                />
                <Route
                    path="/profile"
                    element={<Profile />}
                />
                <Route
                    path="/product/:id"
                    element={<ProductDetail />}
                />
                <Route
                    path="/cart"
                    element={<Cart />}
                />
<Route
    path="/category/:id"
    element={<CategoryProducts />}
/>

            </Routes>

        </BrowserRouter>
    );
}

export default App;