import axiosClient from "./axiosClient";

export const getDashboard = async () => {
    const res = await axiosClient.get("/admin/dashboard");
    return res.data.data;
};

