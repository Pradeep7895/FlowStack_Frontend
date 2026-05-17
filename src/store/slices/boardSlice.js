import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { boardApi } from "../../api/boardApi";
import { listApi } from "../../api/listApi";
import { cardApi } from "../../api/cardApi";

// ── Thunks 

export const fetchBoardFull = createAsyncThunk("board/fetchFull", async (boardId, { rejectWithValue }) => {
    try {
        const [boardRes, listsRes, cardsRes] = await Promise.all([
            boardApi.getById(boardId),
            listApi.getByBoard(boardId),
            cardApi.getByBoard(boardId),
        ]);
        return { board: boardRes.data, lists: listsRes.data, cards: cardsRes.data };
    } catch (err) { return rejectWithValue(err.response?.data?.message || "Failed to load board"); }
});

export const createListThunk = createAsyncThunk("board/createList", async (data, { rejectWithValue }) => {
    try { const { data: list } = await listApi.create(data); return list; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateListThunk = createAsyncThunk("board/updateList", async ({ id, data }, { rejectWithValue }) => {
    try { const { data: list } = await listApi.update(id, data); return list; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const archiveListThunk = createAsyncThunk("board/archiveList", async (id, { rejectWithValue }) => {
    try { const { data: list } = await listApi.archive(id); return list.listId; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchArchivedListsThunk = createAsyncThunk("board/fetchArchivedLists", async (boardId, { rejectWithValue }) => {
    try { const { data: lists } = await listApi.getArchivedByBoard(boardId); return lists; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const fetchArchivedCardsThunk = createAsyncThunk("board/fetchArchivedCards", async (boardId, { rejectWithValue }) => {
    try { const { data: cards } = await cardApi.getArchivedByBoard(boardId); return cards; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const unarchiveListThunk = createAsyncThunk("board/unarchiveList", async (id, { rejectWithValue }) => {
    try { const { data: list } = await listApi.unarchive(id); return list; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteListThunk = createAsyncThunk("board/deleteList", async (id, { rejectWithValue }) => {
    try { await listApi.delete(id); return id; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const createCardThunk = createAsyncThunk("board/createCard", async (data, { rejectWithValue }) => {
    try { const { data: card } = await cardApi.create(data); return card; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const updateCardThunk = createAsyncThunk("board/updateCard", async ({ id, data }, { rejectWithValue }) => {
    try { const { data: card } = await cardApi.update(id, data); return card; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const archiveCardThunk = createAsyncThunk("board/archiveCard", async (id, { rejectWithValue }) => {
    try { const { data: card } = await cardApi.archive(id); return card.cardId; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const unarchiveCardThunk = createAsyncThunk("board/unarchiveCard", async (id, { rejectWithValue }) => {
    try { const { data: card } = await cardApi.unarchive(id); return card; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const deleteCardThunk = createAsyncThunk("board/deleteCard", async (id, { rejectWithValue }) => {
    try { await cardApi.delete(id); return id; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const moveCardThunk = createAsyncThunk("board/moveCard", async ({ id, data }, { rejectWithValue }) => {
    try { const { data: card } = await cardApi.move(id, data); return card; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const reorderCardsThunk = createAsyncThunk("board/reorderCards", async (data, { rejectWithValue }) => {
    try { const { data: cards } = await cardApi.reorder(data); return cards; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

export const reorderListsThunk = createAsyncThunk("board/reorderLists", async (data, { rejectWithValue }) => {
    try { const { data: lists } = await listApi.reorder(data); return lists; }
    catch (err) { return rejectWithValue(err.response?.data?.message); }
});

// ── Slice 

const boardSlice = createSlice({
    name: "board",
    initialState: {
        current: null,
        lists: [],
        archivedLists: [],
        archivedCards: [],
        cards: {},     // { [listId]: Card[] }
        loading: false,
        error: null,
    },
    reducers: {
        // Optimistic update for drag-and-drop
        moveCardOptimistic: (state, action) => {
            const { cardId, sourceListId, destListId, sourceIndex, destIndex } = action.payload;

            const sourceCards = [...(state.cards[sourceListId] || [])];
            const [moved] = sourceCards.splice(sourceIndex, 1);
            if (!moved) return;

            if (sourceListId === destListId) {
                sourceCards.splice(destIndex, 0, moved);
                state.cards[sourceListId] = sourceCards;
            } else {
                const destCards = [...(state.cards[destListId] || [])];
                moved.listId = destListId;
                destCards.splice(destIndex, 0, moved);
                state.cards[sourceListId] = sourceCards;
                state.cards[destListId] = destCards;
            }
        },
        reorderListsOptimistic: (state, action) => {
            state.lists = action.payload;
        },
        clearBoard: (state) => {
            state.current = null; state.lists = []; state.archivedLists = []; state.cards = {};
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchBoardFull.pending, (s) => { s.loading = true; s.error = null; })
            .addCase(fetchBoardFull.rejected, (s, a) => { s.loading = false; s.error = a.payload; })
            .addCase(fetchBoardFull.fulfilled, (s, a) => {
                s.loading = false;
                s.current = a.payload.board;
                s.lists = [...a.payload.lists].sort((a, b) => a.position - b.position);
                // Group cards by listId
                const groups = {};
                a.payload.lists.forEach(l => { groups[l.listId] = []; });
                a.payload.cards.forEach(c => {
                    if (!groups[c.listId]) groups[c.listId] = [];
                    groups[c.listId].push(c);
                });
                Object.keys(groups).forEach(lid => {
                    groups[lid].sort((a, b) => a.position - b.position);
                });
                s.cards = groups;
            })
            .addCase(createListThunk.fulfilled, (s, a) => {
                s.lists.push(a.payload);
                s.cards[a.payload.listId] = [];
            })
            .addCase(updateListThunk.fulfilled, (s, a) => {
                const i = s.lists.findIndex(l => l.listId === a.payload.listId);
                if (i !== -1) s.lists[i] = a.payload;
            })
            .addCase(archiveListThunk.fulfilled, (s, a) => {
                const archivedList = s.lists.find(l => l.listId === a.payload);
                if (archivedList) {
                    s.archivedLists.push(archivedList);
                }
                s.lists = s.lists.filter(l => l.listId !== a.payload);
                delete s.cards[a.payload];
            })
            .addCase(fetchArchivedListsThunk.fulfilled, (s, a) => { s.archivedLists = a.payload; })
            .addCase(fetchArchivedCardsThunk.fulfilled, (s, a) => { s.archivedCards = a.payload; })
            .addCase(unarchiveListThunk.fulfilled, (s, a) => {
                s.archivedLists = s.archivedLists.filter(l => l.listId !== a.payload.listId);
                // Prevent duplication by filtering out existing list with same ID if any
                s.lists = s.lists.filter(l => l.listId !== a.payload.listId);
                s.lists.push(a.payload);
                s.lists.sort((a, b) => a.position - b.position);
                // Initialize cards for the list if not present
                if (!s.cards[a.payload.listId]) {
                    s.cards[a.payload.listId] = [];
                }
            })
            .addCase(deleteListThunk.fulfilled, (s, a) => {
                s.archivedLists = s.archivedLists.filter(l => l.listId !== a.payload);
            })
            .addCase(createCardThunk.fulfilled, (s, a) => {
                const c = a.payload;
                if (!s.cards[c.listId]) s.cards[c.listId] = [];
                s.cards[c.listId].push(c);
            })
            .addCase(updateCardThunk.fulfilled, (s, a) => {
                const c = a.payload;
                if (s.cards[c.listId]) {
                    const i = s.cards[c.listId].findIndex(x => x.cardId === c.cardId);
                    if (i !== -1) s.cards[c.listId][i] = c;
                }
            })
            .addCase(archiveCardThunk.fulfilled, (s, a) => {
                for (const lid of Object.keys(s.cards))
                    s.cards[lid] = s.cards[lid].filter(c => c.cardId !== a.payload);
            })
            .addCase(unarchiveCardThunk.fulfilled, (s, a) => {
                s.archivedCards = s.archivedCards.filter(c => c.cardId !== a.payload.cardId);
                const c = a.payload;
                if (!s.cards[c.listId]) s.cards[c.listId] = [];
                s.cards[c.listId].push(c);
            })
            .addCase(deleteCardThunk.fulfilled, (s, a) => {
                s.archivedCards = s.archivedCards.filter(c => c.cardId !== a.payload);
                for (const lid of Object.keys(s.cards))
                    s.cards[lid] = s.cards[lid].filter(c => c.cardId !== a.payload);
            })
            .addCase(moveCardThunk.fulfilled, (s, a) => {
                const c = a.payload;
                for (const lid of Object.keys(s.cards))
                    s.cards[lid] = s.cards[lid].filter(x => x.cardId !== c.cardId);
                if (!s.cards[c.listId]) s.cards[c.listId] = [];
                s.cards[c.listId].push(c);
                s.cards[c.listId].sort((a, b) => a.position - b.position);
            })
            .addCase(reorderCardsThunk.fulfilled, (s, a) => {
                if (a.payload.length > 0) {
                    const lid = a.payload[0].listId;
                    s.cards[lid] = [...a.payload].sort((a, b) => a.position - b.position);
                }
            })
            .addCase(reorderListsThunk.fulfilled, (s, a) => {
                s.lists = [...a.payload].sort((a, b) => a.position - b.position);
            });
    },
});

export const { moveCardOptimistic, reorderListsOptimistic, clearBoard } = boardSlice.actions;
export default boardSlice.reducer;