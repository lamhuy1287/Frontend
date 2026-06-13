import { Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";

import Dashboard from "../pages/admin/Dashboard";
import Reports from "../pages/admin/Reports"; // ✅ THÊM IMPORT BÁO CÁO

import Products from "../pages/admin/products/ProductList";
import Categoties from "../pages/admin/categories/CategoryList";
import Brands from "../pages/admin/brands/BrandList";
import ProductCreate from "../pages/admin/products/ProductCreate";
import ProductDetail from "../pages/admin/products/ProductDetail";
import ProductEdit from "../pages/admin/products/ProductEdit";

import Orders from "../pages/admin/Orders";

import OrderDetail from "../pages/admin/orders/OrderDetail";
import CreateCoupon from "../pages/admin/coupons/CreateCoupon";
import CouponList from "../pages/admin/coupons/CouponList";

import DiscountList from "../pages/admin/discounts/DiscountList";
import CreateDiscount from "../pages/admin/discounts/CreateDiscount";

import Users from "../pages/admin/Users";


function AdminRoutes() {

    return (

        <Routes>

            <Route path="/" element={<AdminLayout />}>

                <Route index element={<Dashboard />} />

                {/* ✅ THÊM ROUTE CHO BÁO CÁO CHI TIẾT */}
                <Route path="reports" element={<Reports />} />
                
                {/* Có thể thêm sub-route nếu muốn chia tabs */}
                {/* <Route path="reports/:tab" element={<Reports />} /> */}

                <Route
                    path="products"
                    element={<Products />}
                />
                <Route
                    path="categories"
                    element={<Categoties />}
                />
                <Route
                    path="brands"
                    element={<Brands />}
                />

                <Route
                    path="orders"
                    element={<Orders />}
                />

                <Route
                    path="users"
                    element={<Users />}
                />
                <Route
                    path="products/create"
                    element={<ProductCreate />}
                />
                <Route
                    path="products/:id"
                    element={<ProductDetail />}
                />
                <Route
                    path="products/edit/:id"
                    element={<ProductEdit />}
                />

                <Route
                    path="orders/:id"
                    element={<OrderDetail />}
                />
                <Route
                    path="coupons"
                    element={<CouponList />}
                />
                <Route
                    path="create-coupon"
                    element={<CreateCoupon />}
                />

                <Route
                    path="discounts"
                    element={<DiscountList />}
                />
                <Route
                    path="discounts/create"
                    element={<CreateDiscount />}
                />
            </Route>

        </Routes>
    );
}

export default AdminRoutes;