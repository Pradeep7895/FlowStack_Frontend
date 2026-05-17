import { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { boardApi } from "../api/boardApi";
import { workspaceApi } from "../api/workspaceApi";
import Modal from "../components/common/Modal";
import Spinner from "../components/common/Spinner";
import { getAvatarColor, getInitials, BOARD_BACKGROUNDS } from "../utils/helpers";
import toast from "react-hot-toast";

export default function WorkspacePage() {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const [workspace, setWorkspace] = useState(null);
    const [boards, setBoards] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState({ name: "", description: "", background: "#0052cc", visibility: 0 });
    const [saving, setSaving] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [wsRes, boardsRes] = await Promise.all([
                workspaceApi.getById(workspaceId),
                boardApi.getByWorkspace(workspaceId),
            ]);
            setWorkspace(wsRes.data);
            setBoards(boardsRes.data || []);
        } catch (err) {
            toast.error("Failed to load workspace");
        } finally { setLoading(false); }
    }, [workspaceId]);

    useEffect(() => { load(); }, [load]);

    const handleCreateBoard = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const { data } = await boardApi.create({ ...form, workspaceId });
            setBoards(b => [...b, data]);
            toast.success("Board created!");
            setShowCreate(false);
            setForm({ name: "", description: "", background: "#0052cc", visibility: 0 });
            navigate(`/board/${data.boardId}`);
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create board");
        } finally { setSaving(false); }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" className="text-primary" /></div>;

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header */}
            {workspace && (
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
                        style={{ backgroundColor: getAvatarColor(workspace.name) }}>
                        {getInitials(workspace.name)}
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-text">{workspace.name}</h1>
                        {workspace.description && <p className="text-text-muted text-sm mt-0.5">{workspace.description}</p>}
                    </div>
                    <div className="ml-auto flex gap-2">
                        <Link to={`/workspace/${workspaceId}/members`} className="btn-ghost text-xs">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                            Members
                        </Link>
                        <Link to={`/workspace/${workspaceId}/settings`} className="btn-ghost text-xs">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                            Settings
                        </Link>
                    </div>
                </div>
            )}

            {/* Boards Grid */}
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-text-muted uppercase tracking-wider">Boards</h2>
                <button onClick={() => setShowCreate(true)} className="btn-primary text-xs gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
                    New Board
                </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {boards.map(board => (
                    <Link key={board.boardId} to={`/board/${board.boardId}`} className="group">
                        <div className="rounded-xl overflow-hidden shadow-card hover:shadow-raised transition-all duration-200 h-24 flex items-end p-3 relative"
                            style={{ background: board.background?.startsWith("#") ? board.background : `linear-gradient(135deg, ${board.background || "#0052cc"}, #003884)` }}>
                            <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
                            <div className="relative">
                                <h3 className="text-white font-semibold text-sm leading-tight">{board.name}</h3>
                                {board.isClosed && <span className="text-white/70 text-[10px]">Closed</span>}
                            </div>
                        </div>
                    </Link>
                ))}

                <button onClick={() => setShowCreate(true)}
                    className="h-24 rounded-xl border-2 border-dashed border-surface-3 flex flex-col items-center justify-center gap-1 text-text-muted hover:text-primary hover:border-primary hover:bg-primary/5 transition-all duration-200">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" /></svg>
                    <span className="text-xs font-medium">New Board</span>
                </button>
            </div>

            {/* Create Board Modal */}
            <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Board" size="sm">
                <form onSubmit={handleCreateBoard} className="space-y-4">
                    {/* Background preview */}
                    <div className="h-20 rounded-lg flex items-center justify-center text-white font-semibold transition-all"
                        style={{ background: form.background }}>
                        {form.name || "Board Name"}
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-2">Background</label>
                        <div className="flex flex-wrap gap-2">
                            {BOARD_BACKGROUNDS.map(bg => (
                                <button key={bg.id} type="button"
                                    onClick={() => setForm(f => ({ ...f, background: bg.value }))}
                                    className={`w-8 h-8 rounded-lg transition-all ${form.background === bg.value ? "ring-2 ring-offset-1 ring-primary scale-110" : "hover:scale-105"}`}
                                    style={{ backgroundColor: bg.value }} title={bg.label} />
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Board Name *</label>
                        <input className="input" placeholder="e.g. Product Roadmap" value={form.name}
                            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Visibility</label>
                        <select className="input" value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: Number(e.target.value) }))}>
                            <option value={0}>Public</option>
                            <option value={1}>Private</option>
                        </select>
                    </div>
                    <div className="flex gap-2 justify-end pt-2">
                        <button type="button" className="btn-ghost" onClick={() => setShowCreate(false)}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? <Spinner size="sm" className="text-white" /> : "Create Board"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}