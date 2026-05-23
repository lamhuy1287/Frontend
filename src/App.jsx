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
import UserDashboard from "./pages/user/UserDashboard";
import AdminRoutes from "./routes/AdminRoutes";


// Trang người dùng
import Home from "./pages/user/Home";
import Profile from "./pages/user/Profile";

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

            </Routes>

        </BrowserRouter>
    );
}

export default App;