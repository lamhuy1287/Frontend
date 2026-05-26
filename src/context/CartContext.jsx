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

        const [cartCount,
            setCartCount] =
            useState(0);

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

                    if (!token) {

                        setCartCount(0);

                        return;

                    }

                    const res =
                        await getCart();

                    const total =
                        res?.data?.data
                            ?.total_quantity || 0;

                    console.log(
                        "LOAD CART:",
                        total
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

                }

            };

        // =========================
        // INCREASE
        // =========================

        const increaseCartCount =
            (quantity = 1) => {

                console.log(
                    "INCREASE:",
                    quantity
                );

                setCartCount(
                    (prev) => {

                        const next =
                            prev + quantity;

                        console.log(
                            "NEW COUNT:",
                            next
                        );

                        return next;

                    }
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
        // RESET
        // =========================

        const resetCartCount =
            () => {

                setCartCount(0);

            };

        // =========================
        // EFFECT
        // =========================

        useEffect(() => {

            loadCart();

        }, []);

        return (

            <CartContext.Provider
                value={{

                    cartCount,

                    setCartCount,

                    loadCart,

                    increaseCartCount,

                    decreaseCartCount,

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