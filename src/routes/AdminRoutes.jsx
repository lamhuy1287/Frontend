import { Routes, Route } from "react-router-dom";

import AdminLayout from "../layouts/AdminLayout";

import Dashboard from "../pages/admin/Dashboard";

import Products from "../pages/admin/products/ProductList";
import Categoties from "../pages/admin/categories/CategoryList";
import Brands from "../pages/admin/brands/BrandList";
import ProductCreate from "../pages/admin/products/ProductCreate";
import ProductDetail from "../pages/admin/products/ProductDetail";
import ProductEdit from "../pages/admin/products/ProductEdit";

import Orders from "../pages/admin/Orders";

import Users from "../pages/admin/Users";


function AdminRoutes() {

    return (

        <Routes>

            <Route path="/" element={<AdminLayout />}>

                <Route index element={<Dashboard />} />

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



            </Route>

        </Routes>
    );
}

export default AdminRoutes;