import API from "./api";

// ==============================
// GET CART
// ==============================

export const getCart = async () => {

    return API.get("/cart");
};

// ==============================
// ADD TO CART
// ==============================

export const addToCart = async (data) => {

    return API.post(
        "/cart/items",
        data,
        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
};

// ==============================
// UPDATE CART ITEM
// ==============================

export const updateCartItem = async (
    itemId,
    quantity
) => {

    return API.put(

        `/cart/items/${itemId}`,

        {
            quantity: quantity
        },

        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
};

// ==============================
// REMOVE CART ITEM
// ==============================

export const removeCartItem = async (
    itemId
) => {

    return API.delete(

        `/cart/items/${itemId}`,

        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
};

// ==============================
// CLEAR CART
// ==============================

export const clearCart = async () => {

    return API.delete(

        "/cart/clear",

        {
            headers: {
                "Content-Type": "application/json"
            }
        }
    );
};