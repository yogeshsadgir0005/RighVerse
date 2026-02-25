import axios from "axios";

export const BASE_URL="https://righverse.onrender.com";

const axiosInstance = axios.create({
    baseURL : `${BASE_URL}/api`,
    withCredentials : true,
});

export default axiosInstance;