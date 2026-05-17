import { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { fetchWorkspaces } from "../../store/slices/workspaceSlice";
import { fetchUnreadCount } from "../../store/slices/notificationSlice";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppLayout() {
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(fetchWorkspaces());
        dispatch(fetchUnreadCount());
        const interval = setInterval(() => dispatch(fetchUnreadCount()), 30000);
        return () => clearInterval(interval);
    }, [dispatch]);

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                <Sidebar />
                <main className="flex-1 overflow-auto bg-surface-2">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}