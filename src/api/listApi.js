import api from "./axios";

export const listApi = {
    create: (data) => api.post("/api/lists", data),
    getById: (id) => api.get(`/api/lists/${id}`),
    getByBoard: (boardId) => api.get(`/api/lists/board/${boardId}`),
    getArchived: (boardId) => api.get(`/api/lists/board/${boardId}/archived`),
    update: (id, data) => api.put(`/api/lists/${id}`, data),
    reorder: (data) => api.put("/api/lists/reorder", data),
    move: (id, data) => api.put(`/api/lists/${id}/move`, data),
    archive: (id) => api.post(`/api/lists/${id}/archive`),
    unarchive: (id) => api.post(`/api/lists/${id}/unarchive`),
    delete: (id) => api.delete(`/api/lists/${id}`),
};