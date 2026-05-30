import api from "./api";

export const checkout = (data) => {
    return api.post(
        "/orders/checkout",
        data,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
};

export const getOrderDetail = (orderId) => {
    return api.get(`/orders/${orderId}`);
};
