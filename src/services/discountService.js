import api from "./api";

export const getDiscounts = (page = 1, limit = 10) =>
    api.get(`/admin/discounts?page=${page}&limit=${limit}`);

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

export const getVariantOptions = () =>
    api.get("/admin/product-variants");
