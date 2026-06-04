
import axios from "axios";

const API_URL =
    "http://127.0.0.1:5555/api/users";

const getToken = () => {

    return localStorage.getItem(
        "token"
    );

};

// =========================
// UPDATE PROFILE
// =========================

export const updateProfile =
    async (data) => {

        const response =
            await axios.put(

                `${API_URL}/profile`,

                data,

                {
                    headers: {
                        Authorization:
                            `Bearer ${getToken()}`
                    }
                }

            );

        return response.data;

    };

