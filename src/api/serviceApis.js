import api from "./axios";

export const commentApi = {
    addComment: (data) => api.post("/api/comments", data),
    getByCard: (cardId) => api.get(`/api/cards/${cardId}/comments`),
    getReplies: (id) => api.get(`/api/comments/${id}/replies`),
    update: (id, data) => api.put(`/api/comments/${id}`, data),
    delete: (id) => api.delete(`/api/comments/${id}`),
    getCount: (cardId) => api.get(`/api/cards/${cardId}/comments/count`),
    addAttachment: (data) => api.post("/api/attachments", data),
    getAttachments: (cardId) => api.get(`/api/cards/${cardId}/attachments`),
    deleteAttachment: (id) => api.delete(`/api/attachments/${id}`),
};

export const labelApi = {
    create: (data) => api.post("/api/labels", data),
    getByBoard: (boardId) => api.get(`/api/boards/${boardId}/labels`),
    update: (id, data) => api.put(`/api/labels/${id}`, data),
    delete: (id) => api.delete(`/api/labels/${id}`),
    getForCard: (cardId) => api.get(`/api/cards/${cardId}/labels`),
    addToCard: (cardId, labelId) => api.post(`/api/cards/${cardId}/labels/${labelId}`),
    removeFromCard: (cardId, labelId) => api.delete(`/api/cards/${cardId}/labels/${labelId}`),
    createChecklist: (data) => api.post("/api/checklists", data),
    getChecklists: (cardId) => api.get(`/api/cards/${cardId}/checklists`),
    deleteChecklist: (id) => api.delete(`/api/checklists/${id}`),
    addItem: (checklistId, data) => api.post(`/api/checklists/${checklistId}/items`, data),
    toggleItem: (itemId, data) => api.put(`/api/items/${itemId}/toggle`, data),
    deleteItem: (itemId) => api.delete(`/api/items/${itemId}`),
    getProgress: (cardId) => api.get(`/api/cards/${cardId}/progress`),
};

export const notificationApi = {
    getAll: () => api.get("/api/notifications"),
    getUnreadCount: () => api.get("/api/notifications/unread-count"),
    markRead: (id) => api.put(`/api/notifications/${id}/read`),
    markAllRead: () => api.put("/api/notifications/read-all"),
    delete: (id) => api.delete(`/api/notifications/${id}`),
    deleteRead: () => api.delete("/api/notifications/read"),
};