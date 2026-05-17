import api from "./axios";

export const authApi = {
    register: (data) => api.post("/api/auth/register", data),
    login: (data) => api.post("/api/auth/login", data),
    logout: () => api.post("/api/auth/logout"),
    refresh: (refreshToken) => api.post("/api/auth/refresh", { refreshToken }),
    getProfile: () => api.get("/api/auth/profile"),
    updateProfile: (data) => api.put("/api/auth/profile", data),
    changePassword: (data) => api.put("/api/auth/password", data),
    searchUsers: (q) => api.get(`/api/auth/search?q=${encodeURIComponent(q)}`),
    getUserById: (id) => api.get(`/api/auth/users/${id}`),
};