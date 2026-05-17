import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setCredentials } from "../../store/slices/authSlice";
import { toast } from "react-hot-toast";

// Handle successful OAuth login redirection from backend.
// Expects 'token', 'refreshToken', and user data as URL parameters.

export default function OAuthSuccess() {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
        const token = searchParams.get("token");
        const refreshToken = searchParams.get("refreshToken");
        const userId = searchParams.get("userId");
        const email = searchParams.get("email");
        const fullName = searchParams.get("fullName");
        const username = searchParams.get("username");
        const role = searchParams.get("role");
        const avatarUrl = searchParams.get("avatarUrl");

        if (token && userId) {
            // Save to Redux and LocalStorage
            dispatch(setCredentials({
                accessToken: token,
                refreshToken: refreshToken,
                user: {
                    userId,
                    email,
                    fullName,
                    username,
                    role,
                    avatarUrl
                }
            }));

            toast.success("Welcome back! Signed in with Google.");
            navigate("/home", { replace: true });
        } else {
            toast.error("Social login failed. Please try again.");
            navigate("/login", { replace: true });
        }
    }, [searchParams, navigate, dispatch]);

    return (
        <div className="min-h-screen bg-[#091e42] flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <h2 className="text-white text-xl font-medium">Completing Sign-in...</h2>
                <p className="text-gray-400 mt-2">Almost there!</p>
            </div>
        </div>
    );
}
