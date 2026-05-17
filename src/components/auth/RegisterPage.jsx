import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Spinner from "../common/Spinner";

export default function RegisterPage() {
    const navigate = useNavigate();
    const { register, loading, error, isAuthenticated, clearError } = useAuth();
    const [form, setForm] = useState({
        fullName: "",
        email: "",
        username: "",
        password: "",
        confirm: "",
    });
    const [validErr, setValidErr] = useState("");

    useEffect(() => {
        if (isAuthenticated) navigate("/home");
    }, [isAuthenticated, navigate]);
    useEffect(() => {
        return () => clearError();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (form.password !== form.confirm) {
            setValidErr("Passwords do not match");
            return;
        }
        if (form.password.length < 8) {
            setValidErr("Password must be at least 8 characters");
            return;
        }
        setValidErr("");
        const result = await register({
            fullName: form.fullName,
            email: form.email,
            username: form.username,
            password: form.password,
        });
        if (!result.error) navigate("/home");
    };

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center p-4">
            <div className="w-full max-w-md">
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
                        Start organising your work today
                    </p>
                </div>

                <div className="bg-surface rounded-2xl shadow-overlay p-8">
                    <h2 className="text-xl font-semibold text-text mb-6">
                        Create your account
                    </h2>

                    {(error || validErr) && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-danger animate-fade-in">
                            {error || validErr}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
                                    Full Name
                                </label>
                                <input
                                    className="input"
                                    placeholder="John Doe"
                                    value={form.fullName}
                                    onChange={set("fullName")}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
                                    Username
                                </label>
                                <input
                                    className="input"
                                    placeholder="johndoe"
                                    value={form.username}
                                    onChange={set("username")}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
                                Email
                            </label>
                            <input
                                className="input"
                                type="email"
                                placeholder="you@example.com"
                                value={form.email}
                                onChange={set("email")}
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
                                placeholder="Min 8 characters"
                                value={form.password}
                                onChange={set("password")}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-muted mb-1.5 uppercase tracking-wide">
                                Confirm Password
                            </label>
                            <input
                                className="input"
                                type="password"
                                placeholder="Repeat password"
                                value={form.confirm}
                                onChange={set("confirm")}
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
                                "Create account"
                            )}
                        </button>
                    </form>

                    <p className="text-center text-sm text-text-muted mt-6">
                        Already have an account?{" "}
                        <Link
                            to="/login"
                            className="text-primary font-medium hover:underline"
                        >
                            Log in
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
