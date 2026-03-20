import axios from "axios";

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:3000",
    timeout: 10000,
});
api.interceptors.request.use(config => {
    const user = localStorage.getItem("conformite_user");
    if (user) {
        const p = JSON.parse(user);
        if (p?.token) config.headers.Authorization = "Bearer " + p.token;
    }
    return config;
});
// api.interceptors.response.use(res => res, err => {
//   if (err.response?.status === 401) {
//     localStorage.removeItem("conformite_user");
//     window.location.href = "/login";
//   }
//   return Promise.reject(err);
// });

// Auth endpoints
export const authAPI = {
    signIn: (email, password) => api.post("/auth/sign-in", {email, password}),
    signUp: (data) => api.post("/auth/sign-up", data),
    getMe: () => api.get("/auth/me"),
};

// User endpoints
export const userAPI = {
    getProfile: () => api.get("/users/me/profile"),
    updateProfile: (data) => api.put("/users/me/profile", data),
    changePassword: (oldPassword, newPassword) => api.put("/users/me/password", {oldPassword, newPassword}),
    getAllUsers: () => api.get("/users"),
    getUserById: (id) => api.get(`/users/${id}`),
    searchUsers: (query) => api.get("/users/search", {params: {q: query}}),
};

// Company endpoints
export const companyAPI = {
    createCompany: (data) => api.post("/companies", data),
    getAllCompanies: () => api.get("/companies"),
    getCompanyById: (id) => api.get(`/companies/${id}`),
    updateCompany: (id, data) => api.put(`/companies/${id}`, data),
    deleteCompany: (id) => api.delete(`/companies/${id}`),
};

// Document endpoints
export const documentAPI = {
    getMyDocuments: () => api.get("/documents/me"),
    getAllDocuments: () => api.get("/documents"),
    getDocumentById: (id) => api.get(`/documents/${id}`),
    uploadDocument: (formData) => api.post("/documents/upload", formData, {
        headers: {"Content-Type": "multipart/form-data"},
    }),
    deleteDocument: (id) => api.delete(`/documents/${id}`),
    getAnomalies: () => api.get("/documents/anomalies"),
    updateCuratedStatus: (curatedId, status) =>
        api.patch(`/documents/curated/${curatedId}/status`, {status}),
};

export default api;
