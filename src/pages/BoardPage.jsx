import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import {
    fetchBoardFull, createListThunk, updateListThunk, archiveListThunk,
    fetchArchivedListsThunk, fetchArchivedCardsThunk, unarchiveListThunk, deleteListThunk,
    unarchiveCardThunk, deleteCardThunk,
    createCardThunk, moveCardOptimistic, moveCardThunk, reorderCardsThunk,
    reorderListsThunk, reorderListsOptimistic, clearBoard,
} from "../store/slices/boardSlice";
import CardItem from "../components/board/CardItem";
import CardDetailModal from "../components/card/CardDetailModal";
import Spinner from "../components/common/Spinner";
import toast from "react-hot-toast";

export default function BoardPage() {
    const { boardId } = useParams();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { current: board, lists, archivedLists, cards, loading, error } = useSelector(s => s.board);

    const [selectedCardId, setSelectedCardId] = useState(null);
    const [addingList, setAddingList] = useState(false);
    const [newListName, setNewListName] = useState("");
    const [addingCardId, setAddingCardId] = useState(null);
    const [newCardTitle, setNewCardTitle] = useState("");
    const [showArchived, setShowArchived] = useState(false);

    useEffect(() => {
        dispatch(fetchBoardFull(boardId));
        return () => dispatch(clearBoard());
    }, [boardId, dispatch]);

    // ── Drag and Drop 
    const onDragEnd = useCallback(async (result) => {
        const { source, destination, type } = result;
        if (!destination) return;
        if (source.droppableId === destination.droppableId && source.index === destination.index) return;

        // ── Reorder lists 
        if (type === "LIST") {
            const newLists = Array.from(lists);
            const [moved] = newLists.splice(source.index, 1);
            newLists.splice(destination.index, 0, moved);
            dispatch(reorderListsOptimistic(newLists));
            dispatch(reorderListsThunk({
                boardId,
                orderedListIds: newLists.map(l => l.listId),
            }));
            return;
        }

        // ── Move / reorder cards 
        const srcListId = source.droppableId;
        const destListId = destination.droppableId;
        const destList = lists.find(l => l.listId === destListId);

        // Optimistic UI update first
        dispatch(moveCardOptimistic({
            cardId: result.draggableId,
            sourceListId: srcListId,
            destListId,
            sourceIndex: source.index,
            destIndex: destination.index,
        }));

        if (srcListId === destListId) {
            // Same list reorder
            const listCards = [...(cards[srcListId] || [])];
            const [movedCard] = listCards.splice(source.index, 1);
            listCards.splice(destination.index, 0, movedCard);
            dispatch(reorderCardsThunk({
                listId: srcListId,
                orderedCardIds: listCards.map(c => c.cardId),
            }));
        } else {
            // Cross-list move
            const destCards = [...(cards[destListId] || [])];
            dispatch(moveCardThunk({
                id: result.draggableId,
                data: {
                    targetListId: destListId,
                    targetBoardId: board?.boardId || boardId,
                    newPosition: destination.index + 1,
                },
            }));
        }
    }, [lists, cards, board, boardId, dispatch]);

    // ── Add list 
    const handleAddList = async (e) => {
        e.preventDefault();
        if (!newListName.trim()) return;
        const result = await dispatch(createListThunk({ boardId, name: newListName.trim() }));
        if (!result.error) { setNewListName(""); setAddingList(false); }
        else toast.error(result.payload || "Failed to create list");
    };

    // ── Add card 
    const handleAddCard = async (e, listId) => {
        e.preventDefault();
        if (!newCardTitle.trim()) return;
        const result = await dispatch(createCardThunk({ listId, boardId, title: newCardTitle.trim() }));
        if (!result.error) { setNewCardTitle(""); setAddingCardId(null); }
        else toast.error(result.payload || "Failed to create card");
    };

    if (loading) return (
        <div className="flex items-center justify-center h-full">
            <Spinner size="lg" className="text-primary" />
        </div>
    );

    if (error) return (
        <div className="flex flex-col items-center justify-center h-full gap-3">
            <p className="text-danger font-medium">{error}</p>
            <button className="btn-ghost" onClick={() => navigate(-1)}>Go back</button>
        </div>
    );

    const bgStyle = board?.background?.startsWith("#")
        ? { backgroundColor: board.background }
        : { background: `linear-gradient(135deg, ${board?.background || "#0052cc"} 0%, #003884 100%)` };

    return (
        <div className="h-full flex flex-col" style={bgStyle}>
            {/* Board Header */}
            <div className="px-4 py-3 bg-black/20 backdrop-blur-sm flex items-center gap-3">
                <h1 className="text-white font-bold text-lg">{board?.name}</h1>
                {board?.isClosed && (
                    <span className="px-2 py-0.5 bg-white/20 text-white text-xs rounded font-medium">Closed</span>
                )}
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-white/70 text-xs">{lists.length} lists</span>
                    <button 
                        onClick={() => {
                            setShowArchived(true);
                            dispatch(fetchArchivedListsThunk(boardId));
                            dispatch(fetchArchivedCardsThunk(boardId));
                        }}
                        className="px-2 py-1 bg-white/10 hover:bg-white/20 text-white text-xs rounded transition-colors"
                    >
                        View Archived
                    </button>
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex-1 overflow-x-auto overflow-y-hidden">
                <DragDropContext onDragEnd={onDragEnd}>
                    <Droppable droppableId="board" type="LIST" direction="horizontal">
                        {(provided) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className="flex gap-3 p-4 h-full items-start"
                                style={{ minHeight: "calc(100vh - 112px)" }}
                            >
                                {lists.map((list, index) => (
                                    <Draggable key={list.listId} draggableId={list.listId} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                className={`w-72 flex-shrink-0 flex flex-col rounded-xl bg-[#ebecf0] max-h-full transition-shadow ${snapshot.isDragging ? "shadow-overlay rotate-1" : ""}`}
                                            >
                                                {/* List Header */}
                                                <ListHeader
                                                    list={list}
                                                    dragHandleProps={provided.dragHandleProps}
                                                    onArchive={() => dispatch(archiveListThunk(list.listId))}
                                                    onRename={(name) => dispatch(updateListThunk({ id: list.listId, data: { name } }))}
                                                />

                                                {/* Cards */}
                                                <Droppable droppableId={list.listId} type="CARD">
                                                    {(provided, snapshot) => (
                                                        <div
                                                            ref={provided.innerRef}
                                                            {...provided.droppableProps}
                                                            className={`flex-1 overflow-y-auto px-2 pb-2 space-y-2 min-h-[8px] transition-colors ${snapshot.isDraggingOver ? "bg-blue-50/30" : ""}`}
                                                        >
                                                            {(cards[list.listId] || []).map((card, idx) => (
                                                                <Draggable key={card.cardId} draggableId={card.cardId} index={idx}>
                                                                    {(provided, snapshot) => (
                                                                        <div
                                                                            ref={provided.innerRef}
                                                                            {...provided.draggableProps}
                                                                            {...provided.dragHandleProps}
                                                                            className={snapshot.isDragging ? "dnd-ghost" : ""}
                                                                            onClick={() => setSelectedCardId(card.cardId)}
                                                                        >
                                                                            <CardItem card={card} />
                                                                        </div>
                                                                    )}
                                                                </Draggable>
                                                            ))}
                                                            {provided.placeholder}
                                                        </div>
                                                    )}
                                                </Droppable>

                                                {/* Add Card */}
                                                <div className="px-2 pb-2">
                                                    {addingCardId === list.listId ? (
                                                        <form onSubmit={(e) => handleAddCard(e, list.listId)} className="space-y-1.5">
                                                            <textarea
                                                                autoFocus
                                                                className="w-full text-sm rounded-lg border border-primary bg-surface px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 shadow-card"
                                                                rows={2}
                                                                placeholder="Enter card title..."
                                                                value={newCardTitle}
                                                                onChange={e => setNewCardTitle(e.target.value)}
                                                                onKeyDown={e => { if (e.key === "Escape") { setAddingCardId(null); setNewCardTitle(""); } }}
                                                            />
                                                            <div className="flex gap-1.5">
                                                                <button type="submit" className="btn-primary text-xs py-1.5">Add card</button>
                                                                <button type="button" className="btn-ghost text-xs py-1.5" onClick={() => { setAddingCardId(null); setNewCardTitle(""); }}>
                                                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                                </button>
                                                            </div>
                                                        </form>
                                                    ) : (
                                                        <button
                                                            onClick={() => { setAddingCardId(list.listId); setNewCardTitle(""); }}
                                                            className="w-full flex items-center gap-1.5 px-2 py-1.5 text-sm text-text-muted hover:text-text hover:bg-black/10 rounded-lg transition-colors"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                                            Add a card
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}

                                {/* Add List */}
                                <div className="w-72 flex-shrink-0">
                                    {addingList ? (
                                        <div className="bg-[#ebecf0] rounded-xl p-3 space-y-2">
                                            <form onSubmit={handleAddList}>
                                                <input
                                                    autoFocus
                                                    className="input text-sm"
                                                    placeholder="Enter list name..."
                                                    value={newListName}
                                                    onChange={e => setNewListName(e.target.value)}
                                                    onKeyDown={e => { if (e.key === "Escape") { setAddingList(false); setNewListName(""); } }}
                                                />
                                                <div className="flex gap-1.5 mt-2">
                                                    <button type="submit" className="btn-primary text-xs py-1.5">Add list</button>
                                                    <button type="button" className="btn-ghost text-xs py-1.5" onClick={() => { setAddingList(false); setNewListName(""); }}>
                                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setAddingList(true)}
                                            className="w-full flex items-center gap-2 px-4 py-3 bg-white/20 hover:bg-white/30 text-white font-medium text-sm rounded-xl transition-colors backdrop-blur-sm"
                                        >
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                                            Add another list
                                        </button>
                                    )}
                                </div>
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>

            {/* Card Detail Modal */}
            {selectedCardId && (
                <CardDetailModal
                    cardId={selectedCardId}
                    boardId={boardId}
                    onClose={() => setSelectedCardId(null)}
                />
            )}

            {/* Archived Lists Panel */}
            {showArchived && (
                <ArchivedListsPanel 
                    archivedLists={archivedLists}
                    onClose={() => setShowArchived(false)}
                    onRestore={(id) => {
                        dispatch(unarchiveListThunk(id)).then(() => {
                            dispatch(fetchBoardFull(boardId));
                        });
                    }}
                    onDelete={(id) => dispatch(deleteListThunk(id))}
                />
            )}
        </div>
    );
}


// ── Archived Items Panel Component 
function ArchivedListsPanel({ archivedLists, onClose, onRestore, onDelete }) {
    const { archivedCards } = useSelector(s => s.board);
    const dispatch = useDispatch();
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);
    const [mode, setMode] = useState("cards"); // "cards" or "lists"

    return (
        <div className="fixed inset-y-0 right-0 w-80 bg-[#f4f5f7] shadow-overlay z-50 flex flex-col animate-slide-left">
            <div className="px-4 py-3 border-b border-black/10 flex flex-col gap-3 bg-white/50 backdrop-blur-md">
                <div className="flex items-center justify-between">
                    <h2 className="font-semibold text-text">Archived Items</h2>
                    <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/5 text-text-muted transition-colors">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                
                {/* Mode Toggle */}
                <div className="flex p-1 bg-black/5 rounded-lg">
                    <button 
                        onClick={() => setMode("cards")}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${mode === "cards" ? "bg-white shadow-sm text-primary" : "text-text-muted hover:text-text"}`}
                    >
                        Cards
                    </button>
                    <button 
                        onClick={() => setMode("lists")}
                        className={`flex-1 py-1 text-[11px] font-bold rounded-md transition-all ${mode === "lists" ? "bg-white shadow-sm text-primary" : "text-text-muted hover:text-text"}`}
                    >
                        Lists
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {mode === "lists" ? (
                    archivedLists.length === 0 ? (
                        <EmptyState icon="list" text="No archived lists" />
                    ) : (
                        archivedLists.map(list => (
                            <ArchivedItem 
                                key={list.listId}
                                title={list.name}
                                confirmDelete={confirmDeleteId === list.listId}
                                setConfirmDelete={(v) => setConfirmDeleteId(v ? list.listId : null)}
                                onRestore={() => onRestore(list.listId)}
                                onDelete={() => onDelete(list.listId)}
                                warning="Are you sure? This will permanently delete the list and all its cards."
                            />
                        ))
                    )
                ) : (
                    archivedCards.length === 0 ? (
                        <EmptyState icon="card" text="No archived cards" />
                    ) : (
                        archivedCards.map(card => (
                            <ArchivedItem 
                                key={card.cardId}
                                title={card.title}
                                subtitle={`In list: ${card.listId}`} // In a real app, we'd lookup the list name
                                confirmDelete={confirmDeleteId === card.cardId}
                                setConfirmDelete={(v) => setConfirmDeleteId(v ? card.cardId : null)}
                                onRestore={() => dispatch(unarchiveCardThunk(card.cardId))}
                                onDelete={() => dispatch(deleteCardThunk(card.cardId))}
                                warning="Are you sure? This will permanently delete the card."
                            />
                        ))
                    )
                )}
            </div>
            
            <div className="p-4 bg-white/30 border-t border-black/5">
                <p className="text-[10px] text-text-muted text-center leading-relaxed">
                    Archived items are hidden from the board but preserved. Permanent deletion cannot be undone.
                </p>
            </div>
        </div>
    );
}

function EmptyState({ icon, text }) {
    return (
        <div className="flex flex-col items-center justify-center h-40 text-text-muted opacity-60">
            {icon === "list" ? (
                <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
            ) : (
                <svg className="w-10 h-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
            )}
            <p className="text-sm">{text}</p>
        </div>
    );
}

function ArchivedItem({ title, subtitle, confirmDelete, setConfirmDelete, onRestore, onDelete, warning }) {
    return (
        <div className="bg-white rounded-xl p-4 shadow-sm border border-black/5 group animate-fade-in">
            <div className="flex items-center gap-2 mb-1">
                <div className="w-1 h-4 bg-primary/30 rounded-full" />
                <p className="font-semibold text-sm text-text truncate">{title}</p>
            </div>
            {subtitle && <p className="text-[10px] text-text-muted mb-3 ml-3">{subtitle}</p>}

            {confirmDelete ? (
                <div className="bg-danger/5 rounded-lg p-3 border border-danger/10 animate-slide-down">
                    <p className="text-[11px] text-danger font-medium mb-2 leading-tight">{warning}</p>
                    <div className="flex gap-2">
                        <button 
                            onClick={onDelete}
                            className="flex-1 bg-danger text-white text-[11px] font-bold py-1.5 rounded hover:bg-red-700 transition-colors"
                        >
                            Delete Forever
                        </button>
                        <button 
                            onClick={() => setConfirmDelete(false)}
                            className="px-3 bg-surface-2 text-text text-[11px] font-bold py-1.5 rounded hover:bg-surface-3 transition-colors"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            ) : (
                <div className="flex gap-4">
                    <button 
                        onClick={onRestore}
                        className="text-[11px] text-primary hover:text-primary-dark font-bold flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 10h10a8 8 0 018 8v2M3 10l5 5m-5-5l5-5" /></svg>
                        Restore
                    </button>
                    <button 
                        onClick={() => setConfirmDelete(true)}
                        className="text-[11px] text-text-muted hover:text-danger font-bold flex items-center gap-1 transition-colors"
                    >
                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}

// ── List Header Component 
function ListHeader({ list, dragHandleProps, onArchive, onRename }) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(list.name);
    const [showMenu, setShowMenu] = useState(false);

    const save = () => {
        if (name.trim() && name.trim() !== list.name) onRename(name.trim());
        setEditing(false);
    };

    return (
        <div {...dragHandleProps} className="flex items-center justify-between px-3 py-2.5 cursor-grab active:cursor-grabbing">
            {editing ? (
                <input
                    autoFocus
                    className="flex-1 text-sm font-semibold bg-surface rounded px-2 py-1 border border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    onBlur={save}
                    onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") { setName(list.name); setEditing(false); } }}
                />
            ) : (
                <span className="flex-1 text-sm font-semibold text-text cursor-pointer hover:text-primary truncate px-1"
                    onClick={() => setEditing(true)}>
                    {list.name}
                </span>
            )}

            <span className="text-xs text-text-muted mx-1 font-medium">{0}</span>

            <div className="relative">
                <button onClick={() => setShowMenu(v => !v)} className="w-6 h-6 flex items-center justify-center rounded hover:bg-black/10 text-text-muted transition-colors">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01" /></svg>
                </button>
                {showMenu && (
                    <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                        <div className="absolute right-0 top-7 w-40 bg-surface rounded-xl shadow-overlay z-20 py-1 animate-slide-down">
                            <button onClick={() => { setEditing(true); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-text hover:bg-surface-2 transition-colors">Rename list</button>
                            <button onClick={() => { onArchive(); setShowMenu(false); }} className="w-full text-left px-3 py-2 text-sm text-danger hover:bg-surface-2 transition-colors">Archive list</button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}