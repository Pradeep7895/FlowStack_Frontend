import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { workspaceApi } from "../api/workspaceApi";
import { authApi } from "../api/authApi";
import Avatar from "../components/common/Avatar";
import Spinner from "../components/common/Spinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import Modal from "../components/common/Modal";
import toast from "react-hot-toast";

export default function WorkspaceMembersPage() {
    const { workspaceId } = useParams();
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showInvite, setShowInvite] = useState(false);
    const [query, setQuery] = useState("");
    const [searchResults, setSearchResults] = useState([]);
    const [searching, setSearching] = useState(false);
    const [confirmRemove, setConfirmRemove] = useState(null);
    const [removing, setRemoving] = useState(false);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const { data } = await workspaceApi.getMembers(workspaceId);
            setMembers(data || []);
        } catch { toast.error("Failed to load members"); }
        finally { setLoading(false); }
    }, [workspaceId]);

    useEffect(() => { load(); }, [load]);

    const handleSearch = async (e) => {
        const q = e.target.value;
        setQuery(q);
        if (q.length < 2) { setSearchResults([]); return; }
        setSearching(true);
        try {
            const { data } = await authApi.searchUsers(q);
            setSearchResults(data || []);
        } catch { } finally { setSearching(false); }
    };

    const handleInvite = async (userId) => {
        try {
            const { data } = await workspaceApi.addMember(workspaceId, { userId, role: "Member" });
            setMembers(m => [...m, data]);
            toast.success("Member invited!");
            setShowInvite(false);
            setQuery(""); setSearchResults([]);
        } catch (err) { toast.error(err.response?.data?.message || "Failed to invite"); }
    };

    const handleRemove = async () => {
        if (!confirmRemove) return;
        setRemoving(true);
        try {
            await workspaceApi.removeMember(workspaceId, confirmRemove.userId);
            setMembers(m => m.filter(x => x.userId !== confirmRemove.userId));
            toast.success("Member removed");
            setConfirmRemove(null);
        } catch (err) { toast.error(err.response?.data?.message || "Failed to remove"); }
        finally { setRemoving(false); }
    };

    const handleRoleChange = async (userId, role) => {
        try {
            await workspaceApi.updateMemberRole(workspaceId, userId, { role });
            setMembers(m => m.map(x => x.userId === userId ? { ...x, role } : x));
            toast.success("Role updated");
        } catch (err) { toast.error(err.response?.data?.message || "Failed to update role"); }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" className="text-primary" /></div>;

    return (
        <div className="p-8 max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-text">Members</h1>
                <button onClick={() => setShowInvite(true)} className="btn-primary gap-1.5">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
                    Invite Member
                </button>
            </div>

            <div className="bg-surface rounded-xl shadow-card overflow-hidden">
                {members.length === 0 ? (
                    <p className="text-center text-text-muted py-12">No members yet</p>
                ) : (
                    <div className="divide-y divide-surface-3">
                        {members.map(m => (
                            <div key={m.memberId} className="flex items-center gap-3 px-6 py-4">
                                <Avatar name={m.userName || m.userId} size="md" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-text truncate">{m.userName || m.userId}</p>
                                    <p className="text-xs text-text-muted">Joined {new Date(m.joinedAt).toLocaleDateString()}</p>
                                </div>
                                <select
                                    value={m.role}
                                    onChange={e => handleRoleChange(m.userId, e.target.value)}
                                    className="input text-xs py-1 w-28"
                                >
                                    <option value="Member">Member</option>
                                    <option value="Admin">Admin</option>
                                </select>
                                <button onClick={() => setConfirmRemove(m)} className="btn-ghost text-xs text-danger hover:bg-red-50 ml-2">
                                    Remove
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Invite Modal */}
            <Modal open={showInvite} onClose={() => { setShowInvite(false); setQuery(""); setSearchResults([]); }} title="Invite Member" size="sm">
                <div>
                    <input className="input" placeholder="Search by name or username..." value={query} onChange={handleSearch} autoFocus />
                    {searching && <div className="flex justify-center py-4"><Spinner size="sm" className="text-primary" /></div>}
                    {searchResults.length > 0 && (
                        <div className="mt-3 space-y-1 max-h-60 overflow-y-auto">
                            {searchResults.map(u => (
                                <div key={u.userId} className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-2 transition-colors">
                                    <Avatar name={u.fullName || u.username} size="sm" />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-text truncate">{u.fullName}</p>
                                        <p className="text-xs text-text-muted">@{u.username}</p>
                                    </div>
                                    <button onClick={() => handleInvite(u.userId)} className="btn-primary text-xs">Add</button>
                                </div>
                            ))}
                        </div>
                    )}
                    {query.length >= 2 && !searching && searchResults.length === 0 && (
                        <p className="text-center text-text-muted text-sm py-4">No users found</p>
                    )}
                </div>
            </Modal>

            <ConfirmDialog
                open={!!confirmRemove}
                onClose={() => setConfirmRemove(null)}
                onConfirm={handleRemove}
                title="Remove Member"
                message={`Remove this member from the workspace?`}
                confirmLabel="Remove"
                loading={removing}
            />
        </div>
    );
}