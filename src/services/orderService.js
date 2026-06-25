import api from "./api";

/*
|--------------------------------------------------------------------------
| CHECKOUT
|--------------------------------------------------------------------------
*/

export const checkout = async (data) => {

    const response = await api.post(
        "/orders/checkout",
        data
    );

    return response.data;
};

/*
|--------------------------------------------------------------------------
| USER - CANCEL ORDER
|--------------------------------------------------------------------------
*/

export const cancelOrder = async (orderId) => {

    const response = await api.put(
        `/orders/${orderId}/cancel`
    );

    return response.data;
};

export const requestReturnOrder = async (
    orderId,
    note
) => {

    const response = await api.put(
        `/orders/${orderId}/return`,
        {
            note
        }
    );

    return response.data;
};

/*
|--------------------------------------------------------------------------
| USER - GET MY ORDERS
|--------------------------------------------------------------------------
*/

export const getMyOrders = async () => {

    const response = await api.get(
        "/orders"
    );

    return response.data;
};

/*
|--------------------------------------------------------------------------
| USER - GET ORDER DETAIL
|--------------------------------------------------------------------------
*/

export const getOrderDetail = async (orderId) => {

    const response = await api.get(
        `/orders/${orderId}`
    );

    return response.data;
};

/*
|--------------------------------------------------------------------------
| ADMIN - GET ALL ORDERS
|--------------------------------------------------------------------------
*/

export const getAllOrders = async () => {

    const response = await api.get(
        "/orders/admin/all"
    );

    return response.data;
};

/*
|--------------------------------------------------------------------------
| ADMIN - GET ORDER DETAIL
|--------------------------------------------------------------------------
*/

export const getAdminOrderDetail = async (
    orderId
) => {

    const response = await api.get(
        `/orders/admin/${orderId}`
    );

    return response.data;
};

/*
|--------------------------------------------------------------------------
| ADMIN - UPDATE ORDER STATUS
|--------------------------------------------------------------------------
*/

export const updateOrderStatus = async (
    orderId,
    data
) => {

    const response = await api.put(
        `/orders/admin/${orderId}/status`,
        data
    );

    return response.data;
};

/*
|--------------------------------------------------------------------------
| ADMIN - CANCEL ORDER
|--------------------------------------------------------------------------
*/

export const adminCancelOrder = async (
    orderId,
    admin_note
) => {

    const response = await api.put(
        `/orders/admin/${orderId}/cancel`,
        {
            admin_note
        }
    );

    return response.data;
};

/*
|--------------------------------------------------------------------------
| ADMIN - RETURN ORDER (THÊM MỚI)
|--------------------------------------------------------------------------
*/

export const adminReturnOrder = async (
    orderId,
    admin_note
) => {

    const response = await api.put(
        `/orders/admin/${orderId}/return`,
        {
            admin_note
        }
    );

    return response.data;
};

/*
|--------------------------------------------------------------------------
| ADMIN - UPDATE PAYMENT STATUS
|--------------------------------------------------------------------------
*/

export const updatePaymentStatus = async (
    orderId,
    payment_status
) => {

    const response = await api.put(
        `/orders/admin/${orderId}/payment-status`,
        {
            payment_status
        }
    );

    return response.data;
};

/*
|--------------------------------------------------------------------------
| ADMIN - DELETE ORDER
|--------------------------------------------------------------------------
*/

export const deleteOrder = async (
    orderId
) => {

    const response = await api.delete(
        `/orders/admin/${orderId}`
    );

    return response.data;
};