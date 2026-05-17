import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import { createWorkspace, fetchWorkspaces } from "../store/slices/workspaceSlice";
import Modal from "../components/common/Modal";
import Spinner from "../components/common/Spinner";
import { getAvatarColor, getInitials, BOARD_BACKGROUNDS } from "../utils/helpers";
import toast from "react-hot-toast";

export default function HomePage() {
    const dispatch = useDispatch();
    const workspaces = useSelector(s => s.workspaces.list);
    const { user } = useSelector(s => s.auth);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: "", description: "", visibility: 0 });
    const [loading, setLoading] = useState(false);

    const handleCreate = async (e) => {
        e.preventDefault();
        setLoading(true);
        const result = await dispatch(createWorkspace(form));
        setLoading(false);
        if (!result.error) {
            toast.success("Workspace created!");
            setShowCreate(false);
            setForm({ name: "", description: "", visibility: 0 });
        } else {
            toast.error(result.payload || "Failed to create workspace");
        }
    };

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Welcome */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-text">
                    Welcome back, {user?.fullName?.split(" ")[0] || user?.username}! 👋
                </h1>
                <p className="text-text-muted mt-1">Here's an overview of your workspaces.</p>
            </div>

            {/* Workspaces */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Your Workspaces</h2>
                <button onClick={() => setShowCreate(true)} className="btn-primary text-xs gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    New Workspace
                </button>
            </div>

            {workspaces.length === 0 ? (
                <div className="text-center py-20 bg-surface rounded-xl border-2 border-dashed border-surface-3">
                    <svg className="w-12 h-12 mx-auto text-surface-3 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" /></svg>
                    <p className="text-text-muted font-medium mb-2">No workspaces yet</p>
                    <p className="text-text-subtle text-sm mb-4">Create your first workspace to start organising work</p>
                    <button onClick={() => setShowCreate(true)} className="btn-primary">Create Workspace</button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workspaces.map(ws => (
                        <Link key={ws.workspaceId} to={`/workspace/${ws.workspaceId}`} className="group block">
                            <div className="bg-surface rounded-xl shadow-card hover:shadow-raised transition-all duration-200 overflow-hidden">
                                <div className="h-16 flex items-center px-4" style={{ backgroundColor: getAvatarColor(ws.name) }}>
                                    <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                                        {getInitials(ws.name)}
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h3 className="font-semibold text-text group-hover:text-primary transition-colors truncate">{ws.name}</h3>
                                    {ws.description && <p className="text-xs text-text-muted mt-1 truncate">{ws.description}</p>}
                                    <div className="flex items-center gap-3 mt-3 text-xs text-text-subtle">
                                        <span className="flex items-center gap-1">
                                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                                            {ws.memberCount || 0} members
                                        </span>
                                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${ws.visibility === "Public" || ws.visibility === 0 ? "bg-green-50 text-green-600" : "bg-surface-3 text-text-muted"}`}>
                                            {ws.visibility === "Private" || ws.visibility === 1 ? "Private" : "Public"}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}

                    <button onClick={() => setShowCreate(true)} className="flex flex-col items-center justify-center bg-surface rounded-xl border-2 border-dashed border-surface-3 hover:border-primary hover:bg-primary/5 transition-all duration-200 p-8 text-text-muted hover:text-primary min-h-[140px]">
                        <svg className="w-8 h-8 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                        <span className="text-sm font-medium">New Workspace</span>
                    </button>
                </div>
            )}

            {/* Create Workspace Modal */}
            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Workspace" size="sm">
                <form onSubmit={handleCreate} className="space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Workspace Name *</label>
                        <input className="input" placeholder="My Team Workspace" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Description</label>
                        <textarea className="input resize-none" rows={2} placeholder="What's this workspace for?"
                            value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Visibility</label>
                        <select className="input" value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: Number(e.target.value) }))}>
                            <option value={0}>Public — anyone can see</option>
                            <option value={1}>Private — members only</option>
                        </select>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                        <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <Spinner size="sm" className="text-white" /> : "Create"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}