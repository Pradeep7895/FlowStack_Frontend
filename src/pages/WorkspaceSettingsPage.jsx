import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { workspaceApi } from "../api/workspaceApi";
import { fetchWorkspaces } from "../store/slices/workspaceSlice";
import Spinner from "../components/common/Spinner";
import ConfirmDialog from "../components/common/ConfirmDialog";
import toast from "react-hot-toast";

export default function WorkspaceSettingsPage() {
    const { workspaceId } = useParams();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [form, setForm] = useState({ name: "", description: "", visibility: 0, logoUrl: "" });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [showDelete, setShowDelete] = useState(false);
    const [deleting, setDeleting] = useState(false);

    useEffect(() => {
        workspaceApi.getById(workspaceId).then(({ data }) => {
            setForm({ name: data.name, description: data.description || "", visibility: data.visibility === "Private" ? 1 : 0, logoUrl: data.logoUrl || "" });
            setLoading(false);
        }).catch(() => { toast.error("Failed to load workspace"); setLoading(false); });
    }, [workspaceId]);

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await workspaceApi.update(workspaceId, form);
            await dispatch(fetchWorkspaces());
            toast.success("Workspace updated!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update");
        } finally { setSaving(false); }
    };

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await workspaceApi.delete(workspaceId);
            await dispatch(fetchWorkspaces());
            toast.success("Workspace deleted");
            navigate("/home");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to delete");
            setDeleting(false);
        }
    };

    if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" className="text-primary" /></div>;

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-text mb-6">Workspace Settings</h1>

            <form onSubmit={handleSave} className="bg-surface rounded-xl shadow-card p-6 space-y-4 mb-6">
                <h2 className="text-sm font-semibold text-text">General</h2>
                <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Workspace Name</label>
                    <input className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Description</label>
                    <textarea className="input resize-none" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Logo URL</label>
                    <input className="input" placeholder="https://..." value={form.logoUrl} onChange={e => setForm(f => ({ ...f, logoUrl: e.target.value }))} />
                </div>
                <div>
                    <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Visibility</label>
                    <select className="input" value={form.visibility} onChange={e => setForm(f => ({ ...f, visibility: Number(e.target.value) }))}>
                        <option value={0}>Public</option>
                        <option value={1}>Private</option>
                    </select>
                </div>
                <div className="flex justify-end">
                    <button type="submit" className="btn-primary" disabled={saving}>
                        {saving ? <Spinner size="sm" className="text-white" /> : "Save Changes"}
                    </button>
                </div>
            </form>

            {/* Danger Zone */}
            <div className="bg-surface rounded-xl shadow-card p-6 border border-red-200">
                <h2 className="text-sm font-semibold text-danger mb-3">Danger Zone</h2>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-text">Delete this workspace</p>
                        <p className="text-xs text-text-muted mt-0.5">This will permanently delete the workspace and all its boards.</p>
                    </div>
                    <button onClick={() => setShowDelete(true)} className="btn-danger text-xs ml-4">Delete Workspace</button>
                </div>
            </div>

            <ConfirmDialog
                open={showDelete}
                onClose={() => setShowDelete(false)}
                onConfirm={handleDelete}
                title="Delete Workspace"
                message="Are you sure? This will permanently delete the workspace and all its boards. This action cannot be undone."
                confirmLabel="Delete Forever"
                loading={deleting}
            />
        </div>
    );
}