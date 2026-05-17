import api from "./axios";

export const workspaceApi = {
    create: (data) => api.post("/api/workspaces", data),
    getById: (id) => api.get(`/api/workspaces/${id}`),
    getMyWorkspaces: () => api.get("/api/workspaces/my"),
    getMemberOf: () => api.get("/api/workspaces/member"),
    getPublic: () => api.get("/api/workspaces/public"),
    update: (id, data) => api.put(`/api/workspaces/${id}`, data),
    delete: (id) => api.delete(`/api/workspaces/${id}`),
    getMembers: (id) => api.get(`/api/workspaces/${id}/members`),
    addMember: (id, data) => api.post(`/api/workspaces/${id}/members`, data),
    removeMember: (id, userId) => api.delete(`/api/workspaces/${id}/members/${userId}`),
    updateMemberRole: (id, userId, data) => api.put(`/api/workspaces/${id}/members/${userId}/role`, data),
};