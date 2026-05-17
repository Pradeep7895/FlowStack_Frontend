import { useState } from "react";
import { Link, useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { getInitials, getAvatarColor } from "../../utils/helpers";

export default function Sidebar() {
    const { workspaceId } = useParams();
    const location = useLocation();
    const workspaces = useSelector(s => s.workspaces.list);
    const [collapsed, setCollapsed] = useState(false);

    const isActive = (path) => location.pathname.startsWith(path);

    return (
        <aside className={`${collapsed ? "w-12" : "w-60"} bg-surface border-r border-surface-3 flex flex-col flex-shrink-0 transition-all duration-200 overflow-hidden`}>
            <div className="flex items-center justify-between p-3 border-b border-surface-3">
                {!collapsed && <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Workspaces</span>}
                <button onClick={() => setCollapsed(v => !v)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-surface-3 text-text-muted transition-colors ml-auto">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={collapsed ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                    </svg>
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2">
                {workspaces.map(ws => (
                    <WorkspaceItem key={ws.workspaceId} workspace={ws} collapsed={collapsed} isActive={isActive} currentId={workspaceId} />
                ))}
            </div>

            {!collapsed && (
                <div className="p-3 border-t border-surface-3">
                    <Link to="/home" className="flex items-center gap-2 text-xs text-text-muted hover:text-text transition-colors p-2 rounded hover:bg-surface-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                        Home
                    </Link>
                </div>
            )}
        </aside>
    );
}

function WorkspaceItem({ workspace: ws, collapsed, isActive, currentId }) {
    const [open, setOpen] = useState(ws.workspaceId === currentId);
    const bgColor = getAvatarColor(ws.name);

    return (
        <div>
            <button
                onClick={() => setOpen(v => !v)}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-surface-2 transition-colors ${currentId === ws.workspaceId ? "text-primary font-medium" : "text-text"}`}
            >
                <div className="w-6 h-6 rounded flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: bgColor }}>
                    {getInitials(ws.name)}
                </div>
                {!collapsed && (
                    <>
                        <span className="flex-1 text-left truncate text-sm">{ws.name}</span>
                        <svg className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${open ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </>
                )}
            </button>

            {open && !collapsed && (
                <div className="pl-8 pb-1">
                    <Link to={`/workspace/${ws.workspaceId}`} className={`flex items-center gap-1.5 px-2 py-1.5 text-xs rounded transition-colors ${isActive(`/workspace/${ws.workspaceId}`) ? "bg-primary/10 text-primary" : "text-text-muted hover:text-text hover:bg-surface-2"}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                        Boards
                    </Link>
                    <Link to={`/workspace/${ws.workspaceId}/members`} className={`flex items-center gap-1.5 px-2 py-1.5 text-xs rounded transition-colors ${isActive(`/workspace/${ws.workspaceId}/members`) ? "bg-primary/10 text-primary" : "text-text-muted hover:text-text hover:bg-surface-2"}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        Members
                    </Link>
                    <Link to={`/workspace/${ws.workspaceId}/settings`} className={`flex items-center gap-1.5 px-2 py-1.5 text-xs rounded transition-colors ${isActive(`/workspace/${ws.workspaceId}/settings`) ? "bg-primary/10 text-primary" : "text-text-muted hover:text-text hover:bg-surface-2"}`}>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        Settings
                    </Link>
                </div>
            )}
        </div>
    );
}