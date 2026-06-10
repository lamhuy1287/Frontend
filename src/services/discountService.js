
import api from "./api";

// =========================
// DISCOUNTS
// =========================

export const getDiscounts = (
    page = 1,
    limit = 10
) =>
    api.get(
        `/admin/discounts?page=${page}&limit=${limit}`
    );

export const getDiscount = (id) =>
    api.get(`/admin/discounts/${id}`);

export const createDiscount = (data) =>
    api.post("/admin/discounts", data);

export const updateDiscount = (id, data) =>
    api.put(`/admin/discounts/${id}`, data);

export const deleteDiscount = (id) =>
    api.delete(`/admin/discounts/${id}`);

export const toggleDiscount = (id) =>
    api.patch(`/admin/discounts/${id}/toggle`);


// =========================
// CATEGORIES
// =========================

// Danh mục cha
export const getParentCategories = () =>
    api.get("/admin/categories/parents");

// Danh mục con theo danh mục cha
export const getChildCategories = (
    parentId
) =>
    api.get(
        `/admin/categories/${parentId}/children`
    );


// =========================
// PRODUCTS
// =========================

// Lấy sản phẩm theo danh mục con
export const getProductsByCategory = (
    categoryId
) =>
    api.get(
        `/admin/categories/${categoryId}/products`
    );


// =========================
// VARIANTS
// =========================

// Lấy variant theo sản phẩm
export const getVariantsByProduct = (
    productId
) =>
    api.get(
        `/admin/products/${productId}/variants`
    );


// API cũ
export const getVariantOptions = () =>
    api.get("/admin/product-variants");

