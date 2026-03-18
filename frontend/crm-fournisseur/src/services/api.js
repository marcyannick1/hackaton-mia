import axios from "axios";
const api = axios.create({ baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api", timeout: 10000 });
api.interceptors.request.use(config => {
  const user = localStorage.getItem("crm_user");
  if (user) { const p = JSON.parse(user); if (p?.token) config.headers.Authorization = "Bearer " + p.token; }
  return config;
});
api.interceptors.response.use(res => res, err => {
  if (err.response?.status === 401) { localStorage.removeItem("crm_user"); window.location.href = "/login"; }
  return Promise.reject(err);
});
export default api;
