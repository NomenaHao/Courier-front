import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:8000/api",});

api.interceptors.request.use(config => {
  // Routes publiques : ne pas ajouter le token
  const publicRoutes = ["auth/login", "auth/register"];
  const isPublicRoute = publicRoutes.some(route => config.url?.includes(route));

  const token = localStorage.getItem("access");
  
  if (token && !isPublicRoute) {
    config.headers.Authorization = `Bearer ${token}`;
  } else {
    delete config.headers.Authorization;
  }

  return config;
}, (error) => {
  console.error(error);
  return Promise.reject(error);
});

export default api;