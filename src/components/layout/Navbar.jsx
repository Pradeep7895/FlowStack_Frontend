import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../../store/slices/authSlice";
import { fetchNotifications, markAllReadThunk } from "../../store/slices/notificationSlice";
import Avatar from "../common/Avatar";
import { timeAgo } from "../../utils/helpers";

export default function Navbar() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { user } = useSelector(s => s.auth);
    const { list: notifs, unreadCount } = useSelector(s => s.notifications);
    const [showNotif, setShowNotif] = useState(false);
    const [showUser, setShowUser] = useState(false);

    const openNotif = () => {
        setShowNotif(v => !v);
        setShowUser(false);
        dispatch(fetchNotifications());
    };

    const handleLogout = async () => {
        await dispatch(logoutThunk());
        navigate("/login");
    };

    return (
        <nav className="h-12 bg-primary flex items-center justify-between px-4 flex-shrink-0 z-40 relative">
            {/* Logo */}
            <Link to="/home" className="flex items-center gap-2 text-white font-bold text-lg hover:opacity-90 transition-opacity">
                <svg className="w-7 h-7" viewBox="0 0 32 32" fill="none">
                    <rect width="32" height="32" rx="6" fill="white" fillOpacity="0.2" />
                    <rect x="6" y="8" width="8" height="16" rx="2" fill="white" />
                    <rect x="18" y="8" width="8" height="10" rx="2" fill="white" fillOpacity="0.7" />
                </svg>
                FlowStack
            </Link>

            <div className="flex items-center gap-1">
                {/* Notifications */}
                <div className="relative">
                    <button onClick={openNotif} className="relative w-8 h-8 flex items-center justify-center rounded text-white hover:bg-white/20 transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        {unreadCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                {unreadCount > 9 ? "9+" : unreadCount}
                            </span>
                        )}
                    </button>

                    {showNotif && (
                        <div className="absolute right-0 top-10 w-80 bg-surface rounded-xl shadow-overlay z-50 animate-slide-down overflow-hidden">
                            <div className="flex items-center justify-between px-4 py-3 border-b border-surface-3">
                                <span className="font-semibold text-sm text-text">Notifications</span>
                                {unreadCount > 0 && (
                                    <button onClick={() => dispatch(markAllReadThunk())} className="text-xs text-primary hover:underline">
                                        Mark all read
                                    </button>
                                )}
                            </div>
                            <div className="max-h-80 overflow-y-auto">
                                {notifs.length === 0 ? (
                                    <p className="text-center text-text-muted text-sm py-8">No notifications</p>
                                ) : notifs.slice(0, 20).map(n => (
                                    <div key={n.notificationId} className={`px-4 py-3 border-b border-surface-3 hover:bg-surface-2 transition-colors ${!n.isRead ? "bg-blue-50/50" : ""}`}>
                                        <p className="text-sm text-text font-medium">{n.title}</p>
                                        <p className="text-xs text-text-muted mt-0.5">{n.message}</p>
                                        <p className="text-[10px] text-text-subtle mt-1">{timeAgo(n.createdAt)}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* User menu */}
                <div className="relative">
                    <button onClick={() => { setShowUser(v => !v); setShowNotif(false); }} className="w-8 h-8 rounded-full overflow-hidden hover:ring-2 hover:ring-white/50 transition-all">
                        <Avatar name={user?.fullName || user?.username || "U"} size="sm" />
                    </button>

                    {showUser && (
                        <div className="absolute right-0 top-10 w-56 bg-surface rounded-xl shadow-overlay z-50 animate-slide-down overflow-hidden">
                            <div className="px-4 py-3 border-b border-surface-3">
                                <p className="font-semibold text-sm text-text">{user?.fullName || user?.username}</p>
                                <p className="text-xs text-text-muted">{user?.email}</p>
                            </div>
                            <div className="py-1">
                                <Link to="/profile" onClick={() => setShowUser(false)} className="flex items-center gap-2 px-4 py-2 text-sm text-text hover:bg-surface-2 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                                    Profile
                                </Link>
                                <button onClick={handleLogout} className="w-full flex items-center gap-2 px-4 py-2 text-sm text-danger hover:bg-surface-2 transition-colors">
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
                                    Log out
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Close dropdowns on outside click */}
            {(showNotif || showUser) && (
                <div className="fixed inset-0 z-40" onClick={() => { setShowNotif(false); setShowUser(false); }} />
            )}
        </nav>
    );
}