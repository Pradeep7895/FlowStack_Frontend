import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { notificationApi } from "../../api/serviceApis";

export const fetchNotifications = createAsyncThunk("notifications/fetchAll", async (_, { rejectWithValue }) => {
    try { const { data } = await notificationApi.getAll(); return data; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchUnreadCount = createAsyncThunk("notifications/unreadCount", async (_, { rejectWithValue }) => {
    try { const { data } = await notificationApi.getUnreadCount(); return data.unreadCount; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markReadThunk = createAsyncThunk("notifications/markRead", async (id, { rejectWithValue }) => {
    try { await notificationApi.markRead(id); return id; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const markAllReadThunk = createAsyncThunk("notifications/markAllRead", async (_, { rejectWithValue }) => {
    try { await notificationApi.markAllRead(); }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteNotifThunk = createAsyncThunk("notifications/delete", async (id, { rejectWithValue }) => {
    try { await notificationApi.delete(id); return id; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const notificationSlice = createSlice({
    name: "notifications",
    initialState: { list: [], unreadCount: 0, loading: false },
    reducers: {
        addRealtime: (state, action) => {
            state.list.unshift(action.payload);
            state.unreadCount += 1;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchNotifications.fulfilled, (s, a) => { s.list = a.payload; })
            .addCase(fetchUnreadCount.fulfilled, (s, a) => { s.unreadCount = a.payload; })
            .addCase(markReadThunk.fulfilled, (s, a) => {
                const n = s.list.find(x => x.notificationId === a.payload);
                if (n && !n.isRead) { n.isRead = true; s.unreadCount = Math.max(0, s.unreadCount - 1); }
            })
            .addCase(markAllReadThunk.fulfilled, (s) => {
                s.list.forEach(n => { n.isRead = true; });
                s.unreadCount = 0;
            })
            .addCase(deleteNotifThunk.fulfilled, (s, a) => {
                const n = s.list.find(x => x.notificationId === a.payload);
                if (n && !n.isRead) s.unreadCount = Math.max(0, s.unreadCount - 1);
                s.list = s.list.filter(x => x.notificationId !== a.payload);
            });
    },
});

export const { addRealtime } = notificationSlice.actions;
export default notificationSlice.reducer;