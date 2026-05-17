import { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateCardThunk, archiveCardThunk, unarchiveCardThunk, deleteCardThunk } from "../../store/slices/boardSlice";
import { cardApi } from "../../api/cardApi";
import { commentApi, labelApi } from "../../api/serviceApis";
import Spinner from "../common/Spinner";
import { PriorityBadge, StatusBadge } from "../common/Badges";
import Avatar from "../common/Avatar";
import { formatDate, timeAgo, PRIORITY_META, STATUS_META, LABEL_COLORS } from "../../utils/helpers";
import toast from "react-hot-toast";

const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
const PRIORITY_LABELS = { LOW: "Low", MEDIUM: "Medium", HIGH: "High", CRITICAL: "Critical" };
const STATUSES = ["TO_DO", "IN_PROGRESS", "IN_REVIEW", "DONE"];
const STATUS_LABELS = { TO_DO: "To Do", IN_PROGRESS: "In Progress", IN_REVIEW: "In Review", DONE: "Done" };

export default function CardDetailModal({ cardId, boardId, onClose }) {
    const dispatch = useDispatch();
    const { user } = useSelector(s => s.auth);
    const [card, setCard] = useState(null);
    const [comments, setComments] = useState([]);
    const [checklists, setChecklists] = useState([]);
    const [labels, setLabels] = useState([]);
    const [boardLabels, setBoardLabels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [editingTitle, setEditingTitle] = useState(false);
    const [titleVal, setTitleVal] = useState("");
    const [editingDesc, setEditingDesc] = useState(false);
    const [descVal, setDescVal] = useState("");
    const [showLabelPicker, setShowLabelPicker] = useState(false);
    const [newChecklistTitle, setNewChecklistTitle] = useState("");
    const [addingChecklist, setAddingChecklist] = useState(false);
    const [isCreatingChecklist, setIsCreatingChecklist] = useState(false);
    const [newItemTexts, setNewItemTexts] = useState({});
    const [isAddingItem, setIsAddingItem] = useState({});
    const [creatingLabel, setCreatingLabel] = useState(false);
    const [newLabelName, setNewLabelName] = useState("");
    const [newLabelColor, setNewLabelColor] = useState(LABEL_COLORS[0]);

    const load = useCallback(async () => {
        try {
            setLoading(true);
            const [cardRes, commentsRes, checklistsRes, labelsRes, boardLabelsRes] = await Promise.all([
                cardApi.getById(cardId),
                commentApi.getByCard(cardId),
                labelApi.getChecklists(cardId),
                labelApi.getForCard(cardId),
                labelApi.getByBoard(boardId),
            ]);
            setCard(cardRes.data);
            setTitleVal(cardRes.data.title);
            setDescVal(cardRes.data.description || "");
            setComments(commentsRes.data || []);
            setChecklists(checklistsRes.data || []);
            setLabels(labelsRes.data || []);
            setBoardLabels(boardLabelsRes.data || []);
        } catch { toast.error("Failed to load card"); }
        finally { setLoading(false); }
    }, [cardId, boardId]);

    useEffect(() => { load(); }, [load]);

    // Close on Escape
    useEffect(() => {
        const handler = (e) => { if (e.key === "Escape") onClose(); };
        document.addEventListener("keydown", handler);
        return () => document.removeEventListener("keydown", handler);
    }, [onClose]);

    const updateField = async (field, value) => {
        try {
            const result = await dispatch(updateCardThunk({ id: cardId, data: { [field]: value } }));
            if (!result.error) setCard(c => ({ ...c, [field]: value }));
            else toast.error(result.payload || "Update failed");
        } catch { toast.error("Update failed"); }
    };

    const handleSaveTitle = async () => {
        if (titleVal.trim() && titleVal.trim() !== card.title) {
            await updateField("title", titleVal.trim());
        }
        setEditingTitle(false);
    };

    const handleSaveDesc = async () => {
        await updateField("description", descVal);
        setEditingDesc(false);
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!commentText.trim()) return;
        try {
            const { data } = await commentApi.addComment({ cardId, content: commentText.trim() });
            setComments(c => [data, ...c]);
            setCommentText("");
        } catch { toast.error("Failed to add comment"); }
    };

    const handleDeleteComment = async (commentId) => {
        try {
            await commentApi.delete(commentId);
            setComments(c => c.filter(x => x.commentId !== commentId));
        } catch { toast.error("Failed to delete comment"); }
    };

    const handleToggleLabel = async (label) => {
        const attached = labels.some(l => l.labelId === label.labelId);
        try {
            if (attached) {
                await labelApi.removeFromCard(cardId, label.labelId);
                setLabels(l => l.filter(x => x.labelId !== label.labelId));
            } else {
                await labelApi.addToCard(cardId, label.labelId);
                setLabels(l => [...l, label]);
            }
        } catch { toast.error("Failed to update label"); }
    };

    const handleCreateChecklist = async (e) => {
        e.preventDefault();
        if (!newChecklistTitle.trim() || isCreatingChecklist) return;
        try {
            setIsCreatingChecklist(true);
            const { data } = await labelApi.createChecklist({ cardId, title: newChecklistTitle.trim() });
            setChecklists(c => [...c, { ...data, items: [] }]);
            setNewChecklistTitle("");
            setAddingChecklist(false);
        } catch { toast.error("Failed to create checklist"); }
        finally { setIsCreatingChecklist(false); }
    };

    const handleDeleteChecklist = async (checklistId) => {
        try {
            await labelApi.deleteChecklist(checklistId);
            setChecklists(c => c.filter(x => x.checklistId !== checklistId));
            toast.success("Checklist deleted");
        } catch { toast.error("Failed to delete checklist"); }
    };

    const handleAddItem = async (e, checklistId) => {
        e.preventDefault();
        const text = newItemTexts[checklistId];
        if (!text?.trim() || isAddingItem[checklistId]) return;
        try {
            setIsAddingItem(v => ({ ...v, [checklistId]: true }));
            const { data } = await labelApi.addItem(checklistId, { text: text.trim() });
            setChecklists(c => c.map(cl => cl.checklistId === checklistId
                ? { ...cl, items: [...(cl.items || []), data] } : cl));
            setNewItemTexts(t => ({ ...t, [checklistId]: "" }));
        } catch { toast.error("Failed to add item"); }
        finally { setIsAddingItem(v => ({ ...v, [checklistId]: false })); }
    };

    const handleDeleteItem = async (checklistId, itemId) => {
        try {
            await labelApi.deleteItem(itemId);
            setChecklists(c => c.map(cl => cl.checklistId === checklistId
                ? { ...cl, items: cl.items.filter(i => i.itemId !== itemId) }
                : cl));
        } catch { toast.error("Failed to delete item"); }
    };

    const handleToggleItem = async (checklistId, itemId, current) => {
        try {
            // Optimistic update
            setChecklists(c => c.map(cl => cl.checklistId === checklistId
                ? { ...cl, items: cl.items.map(i => i.itemId === itemId ? { ...i, isCompleted: !current } : i) }
                : cl));
            
            await labelApi.toggleItem(itemId, { isCompleted: !current });
        } catch { 
            toast.error("Failed to toggle item");
            // Rollback
            setChecklists(c => c.map(cl => cl.checklistId === checklistId
                ? { ...cl, items: cl.items.map(i => i.itemId === itemId ? { ...i, isCompleted: current } : i) }
                : cl));
        }
    };

    const handleCreateLabel = async (e) => {
        e.preventDefault();
        if (!newLabelName.trim()) return;
        try {
            const { data } = await labelApi.create({
                boardId,
                name: newLabelName.trim(),
                color: newLabelColor
            });
            setBoardLabels(l => [...l, data]);
            setNewLabelName("");
            setCreatingLabel(false);
            toast.success("Label created");
        } catch { toast.error("Failed to create label"); }
    };

    const handleArchive = async () => {
        try {
            await dispatch(archiveCardThunk(cardId)).unwrap();
            toast.success("Card archived");
            onClose();
        } catch (e) { toast.error(e || "Failed to archive card"); }
    };

    const handleUnarchive = async () => {
        try {
            await dispatch(unarchiveCardThunk(cardId)).unwrap();
            toast.success("Card restored");
            setCard(c => ({ ...c, isArchived: false }));
        } catch (e) { toast.error(e || "Failed to restore card"); }
    };

    const handleDelete = async () => {
        if (!window.confirm("Are you sure you want to permanently delete this card? This action cannot be undone.")) return;
        try {
            await dispatch(deleteCardThunk(cardId)).unwrap();
            toast.success("Card deleted");
            onClose();
        } catch (e) { toast.error(e || "Failed to delete card"); }
    };

    if (loading) return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/50" onClick={onClose} />
            <Spinner size="lg" className="text-white relative z-10" />
        </div>
    );

    if (!card) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 pb-8">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-3xl bg-surface rounded-2xl shadow-overlay animate-slide-up max-h-[90vh] overflow-hidden flex flex-col">
                {/* Cover */}
                {card.coverColor && (
                    <div className="h-10 flex-shrink-0 rounded-t-2xl" style={{ backgroundColor: card.coverColor }} />
                )}

                <div className="flex-1 overflow-y-auto p-6">
                    <div className="flex gap-6">
                        {/* Main content */}
                        <div className="flex-1 min-w-0">

                            {/* Labels */}
                            {labels.length > 0 && (
                                <div className="flex flex-wrap gap-1.5 mb-3">
                                    {labels.map(l => (
                                        <span key={l.labelId} className="px-2.5 py-1 rounded-full text-xs font-semibold text-white"
                                            style={{ backgroundColor: l.color }}>{l.name}</span>
                                    ))}
                                </div>
                            )}

                            {/* Title */}
                            {editingTitle ? (
                                <textarea
                                    autoFocus
                                    className="w-full text-xl font-bold text-text bg-surface-2 border border-primary rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 mb-1"
                                    value={titleVal}
                                    rows={2}
                                    onChange={e => setTitleVal(e.target.value)}
                                    onBlur={handleSaveTitle}
                                    onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSaveTitle(); } }}
                                />
                            ) : (
                                <h2 className="text-xl font-bold text-text mb-1 cursor-pointer hover:bg-surface-2 rounded px-2 py-1 -ml-2 transition-colors"
                                    onClick={() => setEditingTitle(true)}>
                                    {card.title}
                                </h2>
                            )}

                            <p className="text-xs text-text-muted mb-6">
                                In list <span className="font-medium">{card.listName || "..."}</span>
                            </p>

                            {/* Description */}
                            <div className="mb-6">
                                <div className="flex items-center gap-2 mb-2">
                                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" /></svg>
                                    <span className="text-sm font-semibold text-text">Description</span>
                                </div>
                                {editingDesc ? (
                                    <div>
                                        <textarea
                                            autoFocus
                                            className="w-full input resize-none text-sm"
                                            rows={4}
                                            value={descVal}
                                            onChange={e => setDescVal(e.target.value)}
                                            placeholder="Add a more detailed description..."
                                        />
                                        <div className="flex gap-2 mt-2">
                                            <button className="btn-primary text-xs" onClick={handleSaveDesc}>Save</button>
                                            <button className="btn-ghost text-xs" onClick={() => { setEditingDesc(false); setDescVal(card.description || ""); }}>Cancel</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div
                                        className="min-h-[60px] text-sm text-text bg-surface-2 hover:bg-surface-3 rounded-lg p-3 cursor-pointer transition-colors"
                                        onClick={() => setEditingDesc(true)}
                                    >
                                        {card.description || <span className="text-text-subtle">Add a description...</span>}
                                    </div>
                                )}
                            </div>

                            {/* Checklists */}
                            {checklists.map(cl => {
                                const total = cl.items?.length || 0;
                                const completed = cl.items?.filter(i => i.isCompleted).length || 0;
                                const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
                                return (
                                    <div key={cl.checklistId} className="mb-6 group/cl">
                                        <div className="flex items-center gap-2 mb-2">
                                            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                            <span className="text-sm font-semibold text-text flex-1">{cl.title}</span>
                                            <span className="text-xs text-text-muted mr-2">{completed}/{total}</span>
                                            <button onClick={() => handleDeleteChecklist(cl.checklistId)} 
                                                className="p-1.5 text-text-subtle hover:text-danger opacity-0 group-hover/cl:opacity-100 transition-all rounded-lg hover:bg-red-50">
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                        <div className="w-full bg-surface-3 rounded-full h-1.5 mb-3 overflow-hidden">
                                            <div className="bg-success h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                                        </div>
                                        <div className="space-y-1">
                                            {(cl.items || []).map(item => (
                                                <div key={item.itemId} className="flex items-center gap-2 group/item py-1 px-2 rounded-lg hover:bg-surface-2 transition-colors">
                                                    <label className="flex items-center gap-3 flex-1 cursor-pointer min-w-0">
                                                        <div className="relative flex items-center">
                                                            <input type="checkbox" checked={item.isCompleted} className="sr-only"
                                                                onChange={() => handleToggleItem(cl.checklistId, item.itemId, item.isCompleted)} />
                                                            <div className={`w-4 h-4 rounded border-2 transition-all flex items-center justify-center ${item.isCompleted ? "bg-primary border-primary" : "border-surface-3 bg-surface"}`}>
                                                                {item.isCompleted && <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                                                            </div>
                                                        </div>
                                                        <span className={`text-sm truncate transition-all ${item.isCompleted ? "line-through text-text-subtle" : "text-text"}`}>
                                                            {item.text}
                                                        </span>
                                                    </label>
                                                    <button onClick={() => handleDeleteItem(cl.checklistId, item.itemId)}
                                                        className="p-1 text-text-subtle hover:text-danger opacity-0 group-hover/item:opacity-100 transition-all">
                                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                        <form onSubmit={e => handleAddItem(e, cl.checklistId)} className="mt-2 flex gap-2">
                                            <input className="input text-sm flex-1" placeholder="Add an item..." value={newItemTexts[cl.checklistId] || ""}
                                                disabled={isAddingItem[cl.checklistId]}
                                                onChange={e => setNewItemTexts(t => ({ ...t, [cl.checklistId]: e.target.value }))} />
                                            <button type="submit" disabled={isAddingItem[cl.checklistId] || !newItemTexts[cl.checklistId]?.trim()} 
                                                className="btn-primary text-xs px-4">
                                                {isAddingItem[cl.checklistId] ? "..." : "Add"}
                                            </button>
                                        </form>
                                    </div>
                                );
                            })}

                            {/* Add checklist form */}
                            {addingChecklist && (
                                <form onSubmit={handleCreateChecklist} className="mb-6 flex gap-2">
                                    <input className="input text-sm flex-1" autoFocus placeholder="Checklist title..."
                                        value={newChecklistTitle} onChange={e => setNewChecklistTitle(e.target.value)} />
                                    <button type="submit" className="btn-primary text-xs">Add</button>
                                    <button type="button" className="btn-ghost text-xs" onClick={() => setAddingChecklist(false)}>Cancel</button>
                                </form>
                            )}

                            {/* Comments */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
                                    <span className="text-sm font-semibold text-text">Comments</span>
                                </div>
                                <form onSubmit={handleAddComment} className="flex gap-2 mb-4">
                                    <Avatar name={user?.fullName || user?.username || "U"} size="sm" className="flex-shrink-0" />
                                    <div className="flex-1">
                                        <textarea
                                            className="input text-sm resize-none w-full"
                                            rows={2}
                                            placeholder="Write a comment..."
                                            value={commentText}
                                            onChange={e => setCommentText(e.target.value)}
                                        />
                                        {commentText && (
                                            <button type="submit" className="btn-primary text-xs mt-1.5">Save</button>
                                        )}
                                    </div>
                                </form>
                                <div className="space-y-3">
                                    {comments.map(c => (
                                        <div key={c.commentId} className="flex gap-2.5 group">
                                            <Avatar name={c.authorName || "U"} size="sm" className="flex-shrink-0" />
                                            <div className="flex-1">
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-xs font-semibold text-text">{c.authorName || "User"}</span>
                                                    <span className="text-[10px] text-text-subtle">{timeAgo(c.createdAt)}</span>
                                                </div>
                                                <p className="text-sm text-text mt-0.5 bg-surface-2 rounded-lg px-3 py-2">{c.content}</p>
                                                {c.authorId === user?.userId && (
                                                    <button onClick={() => handleDeleteComment(c.commentId)}
                                                        className="text-[10px] text-text-subtle hover:text-danger opacity-0 group-hover:opacity-100 transition-all mt-1">
                                                        Delete
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="w-44 flex-shrink-0 space-y-1">
                            <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-3 text-text-muted transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>

                            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">Add to card</p>

                            {/* Labels */}
                            <div className="relative">
                                <button onClick={() => setShowLabelPicker(v => !v)}
                                    className="w-full btn-ghost text-xs justify-start gap-2 border border-surface-3">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
                                    Labels
                                </button>
                                {showLabelPicker && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setShowLabelPicker(false)} />
                                        <div className="absolute left-0 top-9 w-52 bg-surface rounded-xl shadow-overlay z-20 p-3 animate-slide-down">
                                            <div className="flex items-center justify-between mb-2">
                                                <p className="text-xs font-semibold text-text-muted">Labels</p>
                                                <button onClick={() => setShowLabelPicker(false)} className="text-text-subtle hover:text-text">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                </button>
                                            </div>

                                            {!creatingLabel ? (
                                                <>
                                                    <div className="max-h-48 overflow-y-auto space-y-1 pr-1 custom-scrollbar">
                                                        {boardLabels.length === 0 ? (
                                                            <p className="text-[10px] text-text-subtle text-center py-4">No labels for this board</p>
                                                        ) : (
                                                            boardLabels.map(l => {
                                                                const attached = labels.some(x => x.labelId === l.labelId);
                                                                return (
                                                                    <button key={l.labelId} onClick={() => handleToggleLabel(l)}
                                                                        className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors text-left ${attached ? "bg-primary/10" : "hover:bg-surface-2"}`}>
                                                                        <span className="w-8 h-4 rounded flex-shrink-0" style={{ backgroundColor: l.color }} />
                                                                        <span className="text-xs text-text flex-1 truncate">{l.name}</span>
                                                                        {attached && <svg className="w-3.5 h-3.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>}
                                                                    </button>
                                                                );
                                                            })
                                                        )}
                                                    </div>
                                                    <button onClick={() => setCreatingLabel(true)}
                                                        className="w-full mt-2 py-1.5 text-[11px] font-medium text-text-muted hover:text-text hover:bg-surface-2 rounded-lg transition-colors border border-dashed border-surface-3">
                                                        Create new label
                                                    </button>
                                                </>
                                            ) : (
                                                <form onSubmit={handleCreateLabel} className="space-y-3 animate-fade-in">
                                                    <div>
                                                        <p className="text-[10px] text-text-subtle mb-1">Name</p>
                                                        <input autoFocus className="input text-xs py-1" value={newLabelName}
                                                            onChange={e => setNewLabelName(e.target.value)} placeholder="Label name..." />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] text-text-subtle mb-1">Color</p>
                                                        <div className="grid grid-cols-5 gap-1.5">
                                                            {LABEL_COLORS.map(c => (
                                                                <button key={c} type="button" onClick={() => setNewLabelColor(c)}
                                                                    className={`w-full aspect-square rounded transition-transform ${newLabelColor === c ? "ring-2 ring-primary ring-offset-1 scale-110" : "hover:scale-105"}`}
                                                                    style={{ backgroundColor: c }} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 pt-1">
                                                        <button type="submit" className="btn-primary text-[11px] flex-1 py-1">Create</button>
                                                        <button type="button" className="btn-ghost text-[11px] flex-1 py-1" onClick={() => setCreatingLabel(false)}>Back</button>
                                                    </div>
                                                </form>
                                            )}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Checklist */}
                            <button onClick={() => setAddingChecklist(true)}
                                className="w-full btn-ghost text-xs justify-start gap-2 border border-surface-3">
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                                Checklist
                            </button>

                            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mt-4 mb-2 pt-2">Details</p>

                            {/* Priority */}
                            <div>
                                <p className="text-[10px] text-text-subtle mb-1">Priority</p>
                                <select className="input text-xs py-1"
                                    value={card.priority}
                                    onChange={e => { updateField("priority", e.target.value); setCard(c => ({ ...c, priority: e.target.value })); }}>
                                    {PRIORITIES.map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
                                </select>
                            </div>

                            {/* Status */}
                            <div>
                                <p className="text-[10px] text-text-subtle mb-1">Status</p>
                                <select className="input text-xs py-1"
                                    value={card.status}
                                    onChange={e => { updateField("status", e.target.value); setCard(c => ({ ...c, status: e.target.value })); }}>
                                    {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                                </select>
                            </div>

                            {/* Due date */}
                            <div>
                                <p className="text-[10px] text-text-subtle mb-1">Due date</p>
                                <input type="date" className="input text-xs py-1"
                                    value={card.dueDate ? card.dueDate.split("T")[0] : ""}
                                    onChange={e => {
                                        const val = e.target.value || null;
                                        updateField("dueDate", val);
                                        setCard(c => ({ ...c, dueDate: val }));
                                    }} />
                            </div>

                            {/* Start date */}
                            <div>
                                <p className="text-[10px] text-text-subtle mb-1">Start date</p>
                                <input type="date" className="input text-xs py-1"
                                    value={card.startDate ? card.startDate.split("T")[0] : ""}
                                    onChange={e => {
                                        const val = e.target.value || null;
                                        updateField("startDate", val);
                                        setCard(c => ({ ...c, startDate: val }));
                                    }} />
                            </div>


                            <p className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mt-4 mb-2 pt-2">Actions</p>
                            {card.isArchived ? (
                                <div className="space-y-2">
                                    <button onClick={handleUnarchive} className="w-full btn-ghost text-xs justify-start gap-2 border border-surface-3 text-success hover:bg-green-50">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                                        Send to Board
                                    </button>
                                    <button onClick={handleDelete} className="w-full btn-ghost text-xs justify-start gap-2 border border-surface-3 text-danger hover:bg-red-50">
                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                        Delete Forever
                                    </button>
                                </div>
                            ) : (
                                <button onClick={handleArchive} className="w-full btn-ghost text-xs justify-start gap-2 border border-surface-3 text-text-subtle hover:bg-red-50 hover:text-danger">
                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                                    Archive
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}