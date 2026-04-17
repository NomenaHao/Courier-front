import axios from "axios";

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const publicRoutes = ["auth/login", "auth/register"];
    const isPublicRoute = publicRoutes.some((route) => config.url?.includes(route));
    const token = localStorage.getItem("access");

    if (token && !isPublicRoute) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;