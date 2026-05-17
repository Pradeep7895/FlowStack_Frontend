import { useEffect } from "react";

export default function Modal({ open, onClose, title, children, size = "md" }) {
    const sizes = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl", xl: "max-w-4xl" };
    useEffect(() => {
        if (open) document.body.style.overflow = "hidden";
        else document.body.style.overflow = "";
        return () => { document.body.style.overflow = ""; };
    }, [open]);
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fade-in" onClick={onClose} />
            <div className={`relative w-full ${sizes[size]} bg-surface rounded-xl shadow-overlay animate-slide-up max-h-[90vh] flex flex-col`}>
                {title && (
                    <div className="flex items-center justify-between px-6 py-4 border-b border-surface-3">
                        <h2 className="text-base font-semibold text-text">{title}</h2>
                        <button onClick={onClose} className="text-text-muted hover:text-text rounded p-1 hover:bg-surface-3 transition-colors">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                )}
                <div className="overflow-y-auto flex-1 p-6">{children}</div>
            </div>
        </div>
    );
}