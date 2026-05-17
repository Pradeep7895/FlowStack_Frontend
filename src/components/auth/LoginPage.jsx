import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Spinner from "../common/Spinner";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5009";

export default function LoginPage() {
    const navigate = useNavigate();
    const { login, loading, error, isAuthenticated, clearError } = useAuth();
    const [form, setForm] = useState({ email: "", password: "" });

    useEffect(() => {
        if (isAuthenticated) navigate("/home");
    }, [isAuthenticated, navigate]);
    useEffect(() => {
        return () => clearError();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const result = await login(form);
        if (!result.error) navigate("/home");
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-raised mb-4">
                        <svg className="w-10 h-10" viewBox="0 0 32 32" fill="none">
                            <rect x="2" y="4" width="10" height="20" rx="2" fill="#0052cc" />
                            <rect
                                x="16"
                                y="4"
                                width="10"
                                height="12"
                                rx="2"
                                fill="#0052cc"
                                fillOpacity="0.6"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-white">FlowStack</h1>
                    <p className="text-white/70 mt-1 text-sm">
                        Organise Work. Deliver Faster.
                    </p>
                </div>

                <div className="bg-surface rounded-2xl shadow-overlay p-8">
                    <h2 className="text-xl font-semibold text-text mb-6">
                        Log in to your account
                    </h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-danger animate-fade-in">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
                                Email
                            </label>
                            <input
                                className="input"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, email: e.target.value }))
                                }
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
                                Password
                            </label>
                            <input
                                className="input"
                                type="password"
                                placeholder="••••••••"
                                value={form.password}
                                onChange={(e) =>
                                    setForm((f) => ({ ...f, password: e.target.value }))
                                }
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn-primary w-full justify-center py-2.5 mt-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <Spinner size="sm" className="text-white" />
                            ) : (
                                "Log in"
                            )}
                        </button>
                    </form>

                    <div className="relative my-5">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-surface-3" />
                        </div>
                        <div className="relative text-center">
                            <span className="bg-surface px-3 text-xs text-text-muted">
                                or continue with
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <a
                            href={`${API_BASE}/api/oauth/google/login`}
                            className="btn-ghost border border-surface-3 justify-center py-2.5 text-sm gap-2"
                        >
                            <svg className="w-4 h-4" viewBox="0 0 24 24">
                                <path
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                    fill="#4285F4"
                                />
                                <path
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                    fill="#34A853"
                                />
                                <path
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                    fill="#FBBC05"
                                />
                                <path
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                    fill="#EA4335"
                                />
                            </svg>
                            Google
                        </a>
                        <a
                            href={`${API_BASE}/api/oauth/github/login`}
                            className="btn-ghost border border-surface-3 justify-center py-2.5 text-sm gap-2"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z" />
                            </svg>
                            GitHub
                        </a>
                    </div>

                    <p className="text-center text-sm text-text-muted mt-6">
                        Don't have an account?{" "}
                        <Link
                            to="/register"
                            className="text-primary font-medium hover:underline"
                        >
                            Sign up
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
