import { useSelector, useDispatch } from "react-redux";
import { loginThunk, registerThunk, logoutThunk, clearError } from "../store/slices/authSlice";

export function useAuth() {
    const dispatch = useDispatch();
    const { user, profile, loading, error, isAuthenticated } = useSelector(s => s.auth);
    return {
        user, profile, loading, error, isAuthenticated,
        login: (creds) => dispatch(loginThunk(creds)),
        register: (payload) => dispatch(registerThunk(payload)),
        logout: () => dispatch(logoutThunk()),
        clearError: () => dispatch(clearError()),
    };
}