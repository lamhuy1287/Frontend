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
    status
) => {

    const response = await api.put(
        `/orders/admin/${orderId}/status`,
        {
            status
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




