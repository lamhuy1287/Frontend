import {
    createContext,
    useContext,
    useEffect,
    useState
} from "react";

import {
    getCart
} from "../services/cartService";

// =========================
// CREATE CONTEXT
// =========================

const CartContext =
    createContext();

// =========================
// PROVIDER
// =========================

export const CartProvider =
    ({ children }) => {

        // =========================
        // STATE
        // =========================

        const [cartCount,
            setCartCount] =
            useState(0);

        const [cartItems,
            setCartItems] =
            useState([]);

        // =========================
        // LOAD CART
        // =========================

        const loadCart =
            async () => {

                try {

                    const token =
                        localStorage.getItem(
                            "token"
                        );

                    // NO LOGIN
                    if (!token) {

                        setCartCount(0);

                        setCartItems([]);

                        return;
                    }

                    // API
                    const res =
                        await getCart();

                    console.log(
                        "CART RESPONSE:",
                        res.data
                    );

                    // ITEMS
                    const items =
                        res?.data?.data
                            ?.items || [];

                    // TOTAL
                    const total =
                        res?.data?.data
                            ?.total_quantity || 0;

                    // SET STATE
                    setCartItems(
                        items
                    );

                    setCartCount(
                        total
                    );

                } catch (error) {

                    console.log(
                        "LOAD CART ERROR:",
                        error
                    );

                    setCartCount(0);

                    setCartItems([]);
                }

            };

        // =========================
        // INCREASE
        // =========================

        const increaseCartCount =
            (quantity = 1) => {

                setCartCount(
                    (prev) =>
                        prev + quantity
                );

            };

        // =========================
        // DECREASE
        // =========================

        const decreaseCartCount =
            (quantity = 1) => {

                setCartCount(
                    (prev) =>
                        Math.max(
                            prev - quantity,
                            0
                        )
                );

            };

        // =========================
        // REMOVE ITEM
        // =========================

        const removeCartItem =
            (
                cartItemId
            ) => {

                // UPDATE UI NGAY
                setCartItems(
                    (prev) => {

                        const itemToRemove =
                            prev.find(
                                (item) =>
                                    item.id ===
                                    cartItemId
                            );

                        // GIẢM COUNT
                        if (
                            itemToRemove
                        ) {

                            setCartCount(
                                (
                                    prevCount
                                ) =>
                                    Math.max(
                                        prevCount -
                                        itemToRemove.quantity,
                                        0
                                    )
                            );

                        }

                        // REMOVE ITEM
                        return prev.filter(
                            (item) =>
                                item.id !==
                                cartItemId
                        );

                    }
                );

            };

        // =========================
        // RESET
        // =========================

        const resetCartCount =
            () => {

                setCartCount(0);

                setCartItems([]);

            };

        // =========================
        // EFFECT
        // =========================

        useEffect(() => {

            loadCart();

        }, []);

        // =========================
        // PROVIDER
        // =========================

        return (

            <CartContext.Provider
                value={{

                    // STATE
                    cartCount,

                    cartItems,

                    // SETTERS
                    setCartCount,

                    setCartItems,

                    // FUNCTIONS
                    loadCart,

                    increaseCartCount,

                    decreaseCartCount,

                    removeCartItem,

                    resetCartCount

                }}
            >

                {children}

            </CartContext.Provider>

        );

    };

// =========================
// USE CART
// =========================

export const useCart =
    () => useContext(
        CartContext
    );