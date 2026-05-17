import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authApi } from "../../api/authApi";

export const loginThunk = createAsyncThunk("auth/login", async (creds, { rejectWithValue }) => {
    try {
        const { data } = await authApi.login(creds);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Login failed");
    }
});

export const registerThunk = createAsyncThunk("auth/register", async (payload, { rejectWithValue }) => {
    try {
        const { data } = await authApi.register(payload);
        localStorage.setItem("accessToken", data.accessToken);
        localStorage.setItem("refreshToken", data.refreshToken);
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Registration failed");
    }
});

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
    try { await authApi.logout(); } catch { }
    localStorage.clear();
});

export const getProfileThunk = createAsyncThunk("auth/profile", async (_, { rejectWithValue }) => {
    try {
        const { data } = await authApi.getProfile();
        return data;
    } catch (err) {
        return rejectWithValue(err.response?.data?.message || "Failed to get profile");
    }
});

// Parse user from JWT stored in localStorage
function getUserFromToken() {
    const token = localStorage.getItem("accessToken");
    if (!token) return null;
    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        return { userId: payload.sub, email: payload.email, username: payload.username, role: payload.role };
    } catch { return null; }
}

const authSlice = createSlice({
    name: "auth",
    initialState: {
        user: getUserFromToken(),
        profile: null,
        loading: false,
        error: null,
        isAuthenticated: !!localStorage.getItem("accessToken"),
    },
    reducers: {
        clearError: (state) => { state.error = null; },
        setCredentials: (state, action) => {
            const { accessToken, refreshToken, user } = action.payload;
            state.user = user;
            state.profile = user;
            state.isAuthenticated = true;
            localStorage.setItem("accessToken", accessToken);
            localStorage.setItem("refreshToken", refreshToken);
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(loginThunk.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(loginThunk.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.profile = a.payload.user; s.isAuthenticated = true; })
            .addCase(loginThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(registerThunk.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(registerThunk.fulfilled, (s, a) => { s.loading = false; s.user = a.payload.user; s.profile = a.payload.user; s.isAuthenticated = true; })
            .addCase(registerThunk.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(logoutThunk.fulfilled, (s) => { s.user = null; s.profile = null; s.isAuthenticated = false; })
            .addCase(getProfileThunk.fulfilled, (s, a) => { s.profile = a.payload; s.user = a.payload; });
    },
});

export const { clearError, setCredentials } = authSlice.actions;
export default authSlice.reducer;