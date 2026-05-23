import axios from "axios";

const API_URL =
    "http://127.0.0.1:5555/api/brands";

const getToken = () => {

    return localStorage.getItem("token");
};

// =========================
// GET ALL
// =========================

export const getBrands =
async () => {

    const response =
        await axios.get(API_URL);

    return response.data;
};

// =========================
// CREATE
// =========================

export const createBrand = async (data) => {

    return axios.post(
        API_URL,
        data,
        {
            headers: {
                Authorization:
                    `Bearer ${getToken()}`
            }
        }
    );
};

// =========================
// UPDATE
// =========================

export const updateBrand = async (
    id,
    data
) => {

    return axios.put(
        `${API_URL}/${id}`,
        data,
        {
            headers: {
                Authorization:
                    `Bearer ${getToken()}`
            }
        }
    );
};

// =========================
// DELETE
// =========================

export const deleteBrand = async (id) => {

    return axios.delete(
        `${API_URL}/${id}`,
        {
            headers: {
                Authorization:
                    `Bearer ${getToken()}`
            }
        }
    );
};