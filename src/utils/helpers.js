import { format, formatDistanceToNow, isPast, parseISO } from "date-fns";

export const formatDate = (d) => {
    if (!d) return null;
    try { return format(typeof d === "string" ? parseISO(d) : d, "MMM d, yyyy"); }
    catch { return null; }
};

export const timeAgo = (d) => {
    if (!d) return "";
    try { return formatDistanceToNow(typeof d === "string" ? parseISO(d) : d, { addSuffix: true }); }
    catch { return ""; }
};

export const isOverdue = (dueDate, status) => {
    if (!dueDate || status === "Done" || status === "DONE") return false;
    try { return isPast(typeof dueDate === "string" ? parseISO(dueDate) : dueDate); }
    catch { return false; }
};

export const PRIORITY_META = {
    Low: { label: "Low", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
    Medium: { label: "Medium", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
    High: { label: "High", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
    Critical: { label: "Critical", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
    MEDIUM: { label: "Medium", color: "bg-yellow-100 text-yellow-700", dot: "bg-yellow-500" },
    HIGH: { label: "High", color: "bg-orange-100 text-orange-700", dot: "bg-orange-500" },
    LOW: { label: "Low", color: "bg-blue-100 text-blue-700", dot: "bg-blue-500" },
    CRITICAL: { label: "Critical", color: "bg-red-100 text-red-700", dot: "bg-red-500" },
};

export const STATUS_META = {
    ToDo: { label: "To Do", color: "bg-surface-3 text-text-muted" },
    InProgress: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
    InReview: { label: "In Review", color: "bg-purple-100 text-purple-700" },
    Done: { label: "Done", color: "bg-green-100 text-green-700" },
    TO_DO: { label: "To Do", color: "bg-surface-3 text-text-muted" },
    IN_PROGRESS: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
    IN_REVIEW: { label: "In Review", color: "bg-purple-100 text-purple-700" },
    DONE: { label: "Done", color: "bg-green-100 text-green-700" },
};

export const BOARD_BACKGROUNDS = [
    { id: "bg1", value: "#0052cc", label: "Ocean Blue" },
    { id: "bg2", value: "#00875a", label: "Forest Green" },
    { id: "bg3", value: "#6554c0", label: "Violet" },
    { id: "bg4", value: "#de350b", label: "Flame Red" },
    { id: "bg5", value: "#ff991f", label: "Sunset Orange" },
    { id: "bg6", value: "#172b4d", label: "Midnight" },
    { id: "bg7", value: "#008da6", label: "Teal" },
    { id: "bg8", value: "#403294", label: "Deep Purple" },
];

export const LABEL_COLORS = [
    "#61bd4f", "#f2d600", "#ff9f1a", "#eb5a46",
    "#c377e0", "#0079bf", "#00c2e0", "#51e898",
    "#ff78cb", "#344563",
];

export function getInitials(name = "") {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
}

export function getAvatarColor(str = "") {
    const colors = ["#0052cc", "#00875a", "#6554c0", "#de350b", "#ff991f", "#008da6"];
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
}