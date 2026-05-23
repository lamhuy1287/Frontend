import axios from "axios";

const API_URL = "http://127.0.0.1:5555/api/categories";

const getToken = () => {

    const token =
        localStorage.getItem("token");

    console.log("TOKEN:", token);

    return token;
};

export const getCategories =
async () => {

    const response =
        await axios.get(API_URL);

    return response.data;
};

export const createCategory = async (data) => {

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

export const updateCategory = async (
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

export const deleteCategory = async (id) => {

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