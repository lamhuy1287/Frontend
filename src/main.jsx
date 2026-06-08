import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Toaster } from "react-hot-toast";

import App from "./App.jsx";

import "./index.css";

// CART CONTEXT
import {
    CartProvider
} from "./context/CartContext";

createRoot(
    document.getElementById("root")
).render(

    <StrictMode>

        <CartProvider>

<>
    <App />

    <Toaster
        position="top-right"
        reverseOrder={false}
    />
</>

        </CartProvider>

    </StrictMode>

);