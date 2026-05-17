import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { workspaceApi } from "../../api/workspaceApi";

export const fetchWorkspaces = createAsyncThunk("workspaces/fetchAll", async (_, { rejectWithValue }) => {
    try {
        const [myRes, memberRes] = await Promise.all([
            workspaceApi.getMyWorkspaces(),
            workspaceApi.getMemberOf(),
        ]);
        const all = [...myRes.data, ...memberRes.data];
        const unique = Array.from(new Map(all.map(w => [w.workspaceId, w])).values());
        return unique;
    } catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createWorkspace = createAsyncThunk("workspaces/create", async (data, { rejectWithValue }) => {
    try { const { data: ws } = await workspaceApi.create(data); return ws; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteWorkspace = createAsyncThunk("workspaces/delete", async (id, { rejectWithValue }) => {
    try { await workspaceApi.delete(id); return id; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

const workspaceSlice = createSlice({
    name: "workspaces",
    initialState: { list: [], loading: false, error: null },
    reducers: {},
    extraReducers: (builder) => {
        builder
            .addCase(fetchWorkspaces.pending, (s) => { s.loading = true; })
            .addCase(fetchWorkspaces.fulfilled, (s, a) => { s.loading = false; s.list = a.payload; })
            .addCase(fetchWorkspaces.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(createWorkspace.fulfilled, (s, a) => { s.list.push(a.payload); })
            .addCase(deleteWorkspace.fulfilled, (s, a) => { s.list = s.list.filter(w => w.workspaceId !== a.payload); });
    },
});

export default workspaceSlice.reducer;