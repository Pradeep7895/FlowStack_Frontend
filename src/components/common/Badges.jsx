export function PriorityBadge({ priority }) {
    const map = {
        Low: "bg-blue-50 text-blue-600 border border-blue-200",
        Medium: "bg-amber-50 text-amber-600 border border-amber-200",
        High: "bg-orange-50 text-orange-600 border border-orange-200",
        Critical: "bg-red-50 text-red-600 border border-red-200",
        LOW: "bg-blue-50 text-blue-600 border border-blue-200",
        MEDIUM: "bg-amber-50 text-amber-600 border border-amber-200",
        HIGH: "bg-orange-50 text-orange-600 border border-orange-200",
        CRITICAL: "bg-red-50 text-red-600 border border-red-200",
    };
    const labels = {
        Low: "Low", Medium: "Medium", High: "High", Critical: "Critical",
        LOW: "Low", MEDIUM: "Medium", HIGH: "High", CRITICAL: "Critical",
    };
    return (
        <span className={`badge text-[10px] font-semibold uppercase tracking-wide ${map[priority] || "bg-surface-3 text-text-muted"}`}>
            {labels[priority] || priority}
        </span>
    );
}

export function StatusBadge({ status }) {
    const map = {
        ToDo: "bg-surface-3 text-text-muted",
        InProgress: "bg-blue-50 text-blue-600",
        InReview: "bg-purple-50 text-purple-600",
        Done: "bg-green-50 text-green-600",
        TO_DO: "bg-surface-3 text-text-muted",
        IN_PROGRESS: "bg-blue-50 text-blue-600",
        IN_REVIEW: "bg-purple-50 text-purple-600",
        DONE: "bg-green-50 text-green-600",
    };
    const labels = {
        ToDo: "To Do", InProgress: "In Progress", InReview: "In Review", Done: "Done",
        TO_DO: "To Do", IN_PROGRESS: "In Progress", IN_REVIEW: "In Review", DONE: "Done",
    };
    return (
        <span className={`badge text-[10px] font-semibold ${map[status] || "bg-surface-3 text-text-muted"}`}>
            {labels[status] || status}
        </span>
    );
}