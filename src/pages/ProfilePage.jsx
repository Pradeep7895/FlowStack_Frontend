import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { getProfileThunk } from "../store/slices/authSlice";
import { authApi } from "../api/authApi";
import Avatar from "../components/common/Avatar";
import Spinner from "../components/common/Spinner";
import toast from "react-hot-toast";

export default function ProfilePage() {
    const dispatch = useDispatch();
    const { profile } = useSelector(s => s.auth);
    const [tab, setTab] = useState("profile");
    const [form, setForm] = useState({ fullName: profile?.fullName || "", username: profile?.username || "", bio: profile?.bio || "", avatarUrl: profile?.avatarUrl || "" });
    const [pwForm, setPwForm] = useState({ currentPassword: "", newPassword: "", confirm: "" });
    const [saving, setSaving] = useState(false);

    const handleSaveProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await authApi.updateProfile({ fullName: form.fullName, username: form.username, bio: form.bio, avatarUrl: form.avatarUrl });
            await dispatch(getProfileThunk());
            toast.success("Profile updated!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally { setSaving(false); }
    };

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirm) { toast.error("Passwords do not match"); return; }
        setSaving(true);
        try {
            await authApi.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
            toast.success("Password changed!");
            setPwForm({ currentPassword: "", newPassword: "", confirm: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password");
        } finally { setSaving(false); }
    };

    return (
        <div className="p-8 max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold text-text mb-6">Profile Settings</h1>

            {/* Avatar + name header */}
            <div className="bg-surface rounded-xl shadow-card p-6 mb-6 flex items-center gap-4">
                <Avatar name={profile?.fullName || profile?.username || "U"} src={profile?.avatarUrl} size="xl" />
                <div>
                    <h2 className="text-lg font-bold text-text">{profile?.fullName}</h2>
                    <p className="text-text-muted text-sm">@{profile?.username}</p>
                    <p className="text-xs text-text-subtle mt-1">{profile?.email}</p>
                    <span className="mt-1 inline-block badge bg-primary/10 text-primary text-xs">{profile?.role}</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-0 border-b border-surface-3 mb-6">
                {["profile", "password"].map(t => (
                    <button key={t} onClick={() => setTab(t)}
                        className={`px-4 py-2 text-sm font-medium transition-colors capitalize border-b-2 -mb-px ${tab === t ? "border-primary text-primary" : "border-transparent text-text-muted hover:text-text"}`}>
                        {t === "profile" ? "Profile" : "Password"}
                    </button>
                ))}
            </div>

            {tab === "profile" && (
                <form onSubmit={handleSaveProfile} className="bg-surface rounded-xl shadow-card p-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Full Name</label>
                            <input className="input" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Username</label>
                            <input className="input" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Avatar URL</label>
                        <input className="input" placeholder="https://..." value={form.avatarUrl} onChange={e => setForm(f => ({ ...f, avatarUrl: e.target.value }))} />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Bio</label>
                        <textarea className="input resize-none" rows={3} value={form.bio} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? <Spinner size="sm" className="text-white" /> : "Save Changes"}
                        </button>
                    </div>
                </form>
            )}

            {tab === "password" && (
                <form onSubmit={handleChangePassword} className="bg-surface rounded-xl shadow-card p-6 space-y-4">
                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Current Password</label>
                        <input className="input" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">New Password</label>
                        <input className="input" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-text-muted uppercase tracking-wide mb-1.5">Confirm New Password</label>
                        <input className="input" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="btn-primary" disabled={saving}>
                            {saving ? <Spinner size="sm" className="text-white" /> : "Change Password"}
                        </button>
                    </div>
                </form>
            )}
        </div>
    );
}