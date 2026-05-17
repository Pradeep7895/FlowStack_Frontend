import Modal from "./Modal";

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = "Delete",
    loading,
}) {
    return (
        <Modal open={open} onClose={onClose} title={title} size="sm">
            <p className="text-sm text-text-muted mb-6">{message}</p>
            <div className="flex gap-2 justify-end">
                <button className="btn-ghost" onClick={onClose} disabled={loading}>
                    Cancel
                </button>
                <button className="btn-danger" onClick={onConfirm} disabled={loading}>
                    {loading ? "..." : confirmLabel}
                </button>
            </div>
        </Modal>
    );
}