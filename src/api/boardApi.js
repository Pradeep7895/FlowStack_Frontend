import api from "./axios";

export const boardApi = {
    create: (data) => api.post("/api/boards", data),
    getById: (id) => api.get(`/api/boards/${id}`),
    getByWorkspace: (workspaceId) => api.get(`/api/boards/workspace/${workspaceId}`),
    getMyBoards: () => api.get("/api/boards/my"),
    update: (id, data) => api.put(`/api/boards/${id}`, data),
    close: (id) => api.put(`/api/boards/${id}/close`),
    reopen: (id) => api.put(`/api/boards/${id}/reopen`),
    delete: (id) => api.delete(`/api/boards/${id}`),
    getMembers: (id) => api.get(`/api/boards/${id}/members`),
    addMember: (id, data) => api.post(`/api/boards/${id}/members`, data),
    removeMember: (id, userId) => api.delete(`/api/boards/${id}/members/${userId}`),
    updateMemberRole: (id, userId, data) => api.put(`/api/boards/${id}/members/${userId}/role`, data),
};