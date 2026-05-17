import api from "./axios";

export const cardApi = {
    create: (data) => api.post("/api/cards", data),
    getById: (id) => api.get(`/api/cards/${id}`),
    getByList: (listId) => api.get(`/api/cards/list/${listId}`),
    getByBoard: (boardId) => api.get(`/api/cards/board/${boardId}`),
    getArchivedByBoard: (boardId) => api.get(`/api/cards/board/${boardId}/archived`),
    getOverdue: () => api.get("/api/cards/overdue"),
    update: (id, data) => api.put(`/api/cards/${id}`, data),
    move: (id, data) => api.put(`/api/cards/${id}/move`, data),
    reorder: (data) => api.put("/api/cards/reorder", data),
    setAssignee: (id, data) => api.put(`/api/cards/${id}/assignee`, data),
    setPriority: (id, data) => api.put(`/api/cards/${id}/priority`, data),
    archive: (id) => api.post(`/api/cards/${id}/archive`),
    unarchive: (id) => api.post(`/api/cards/${id}/unarchive`),
    delete: (id) => api.delete(`/api/cards/${id}`),
};