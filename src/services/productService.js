import axios from "axios";

const API_URL = "http://127.0.0.1:5555/api";

const getToken = () => {
    return localStorage.getItem("token");
};

// =========================
// GET ALL
// =========================
export const getProducts = async (params) => {

    return axios.get(
        `${API_URL}/products`,
        {
            params
        }
    );
};

// =========================
// GET DETAIL
// =========================
export const getProductDetail = async (id) => {

    if (!id) {
        throw new Error(
            "ID sản phẩm không hợp lệ"
        );
    }

    return axios.get(
        `${API_URL}/products/${id}`
    );
};

// =========================
// CREATE
// =========================
export const createProduct = async (
    productData
) => {

    const token = getToken();

    if (!token) {
        throw new Error("Chưa đăng nhập!");
    }

    const formData = new FormData();

    // =====================
    // BASIC INFO
    // =====================

    formData.append(
        "name",
        productData.name
    );

    formData.append(
        "product_code",
        productData.product_code
    );

    formData.append(
        "category_id",
        productData.category_id
    );

    formData.append(
        "brand_id",
        productData.brand_id
    );

    formData.append(
        "description",
        productData.description || ""
    );

    // =====================
    // VARIANTS
    // =====================

    formData.append(
        "variants",
        JSON.stringify(
            productData.variants
        )
    );

    // =====================
    // IMAGES
    // =====================

    if (productData.images) {

        productData.images.forEach(
            (file) => {

                formData.append(
                    "images",
                    file
                );
            }
        );
    }

    return axios.post(
        `${API_URL}/products`,
        formData,
        {
            headers: {
                "Authorization":
                    `Bearer ${token}`
            }
        }
    );
};

// =========================
// UPDATE
// =========================
export const updateProduct = async (
    id,
    productData
) => {

    const token = getToken();

    const formData = new FormData();

    // =====================
    // BASIC INFO
    // =====================

    formData.append(
        "name",
        productData.name
    );

    formData.append(
        "product_code",
        productData.product_code
    );

    formData.append(
        "category_id",
        productData.category_id
    );

    formData.append(
        "brand_id",
        productData.brand_id
    );

    formData.append(
        "description",
        productData.description || ""
    );

    // =====================
    // VARIANTS
    // =====================

    formData.append(
        "variants",
        JSON.stringify(
            productData.variants
        )
    );

    // =====================
    // IMAGES
    // =====================

    if (productData.images) {

        productData.images.forEach(
            (file) => {

                formData.append(
                    "images",
                    file
                );
            }
        );
    }

    return axios.put(
        `${API_URL}/products/${id}`,
        formData,
        {
            headers: {
                "Authorization":
                    `Bearer ${token}`
            }
        }
    );
};

// =========================
// DELETE
// =========================
export const deleteProduct = async (
    id
) => {

    const token = getToken();

    return axios.delete(
        `${API_URL}/products/${id}`,
        {
            headers: {
                "Authorization":
                    `Bearer ${token}`
            }
        }
    );
};