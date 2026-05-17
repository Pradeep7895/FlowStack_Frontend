import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";
import LoginPage from "./components/auth/LoginPage";
import RegisterPage from "./components/auth/RegisterPage";
import OAuthSuccess from "./components/auth/OAuthSuccess";
import HomePage from "./pages/HomePage";
import WorkspacePage from "./pages/WorkspacePage";
import WorkspaceMembersPage from "./pages/WorkspaceMembersPage";
import WorkspaceSettingsPage from "./pages/WorkspaceSettingsPage";
import BoardPage from "./pages/BoardPage";
import ProfilePage from "./pages/ProfilePage";

export default function App() {
    return (
        <BrowserRouter>
            <Toaster
                position="bottom-right"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: "#172b4d",
                        color: "#fff",
                        borderRadius: "8px",
                        fontSize: "13px",
                        fontFamily: "'DM Sans', sans-serif",
                    },
                    success: { iconTheme: { primary: "#00875a", secondary: "#fff" } },
                    error: { iconTheme: { primary: "#de350b", secondary: "#fff" } },
                }}
            />

            <Routes>
                {/* Public */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/oauth-success" element={<OAuthSuccess />} />

                {/* Protected */}
                <Route
                    element={
                        <ProtectedRoute>
                            <AppLayout />
                        </ProtectedRoute>
                    }
                >
                    <Route path="/home" element={<HomePage />} />
                    <Route path="/profile" element={<ProfilePage />} />

                    {/* Workspace routes */}
                    <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
                    <Route
                        path="/workspace/:workspaceId/members"
                        element={<WorkspaceMembersPage />}
                    />
                    <Route
                        path="/workspace/:workspaceId/settings"
                        element={<WorkspaceSettingsPage />}
                    />

                    {/* Board route - full screen Kanban */}
                    <Route path="/board/:boardId" element={<BoardPage />} />
                </Route>

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
        </BrowserRouter>
    );
}
