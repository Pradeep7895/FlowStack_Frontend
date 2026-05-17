import { PriorityBadge, StatusBadge } from "../common/Badges";
import { formatDate } from "../../utils/helpers";

export default function CardItem({ card }) {
    const isOverdue = card.dueDate &&
        card.status !== "Done" && card.status !== "DONE" &&
        new Date(card.dueDate) < new Date();

    return (
        <div className="bg-surface rounded-lg shadow-card hover:shadow-raised transition-all duration-150 cursor-pointer group">
            {/* Cover color */}
            {card.coverColor && (
                <div className="h-2 rounded-t-lg" style={{ backgroundColor: card.coverColor }} />
            )}

            <div className="p-3">
                {/* Labels */}
                {card.labels?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-2">
                        {card.labels.map(l => (
                            <span key={l.labelId} className="h-2 w-10 rounded-full" style={{ backgroundColor: l.color }} title={l.name} />
                        ))}
                    </div>
                )}

                <p className="text-sm text-text font-medium leading-snug group-hover:text-primary transition-colors">
                    {card.title}
                </p>

                {/* Metadata row */}
                <div className="flex items-center flex-wrap gap-1.5 mt-2">
                    <PriorityBadge priority={card.priority} />
                    <StatusBadge status={card.status} />
                </div>

                {/* Due date + assignee row */}
                <div className="flex items-center justify-between mt-2">
                    {card.dueDate && (
                        <span className={`flex items-center gap-1 text-[10px] font-medium rounded px-1.5 py-0.5 ${isOverdue ? "bg-red-50 text-danger" : "bg-surface-3 text-text-muted"}`}>
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {formatDate(card.dueDate)}
                        </span>
                    )}

                    <div className="flex items-center gap-1 ml-auto">
                        {card.commentCount > 0 && (
                            <span className="flex items-center gap-0.5 text-[10px] text-text-subtle">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                                {card.commentCount}
                            </span>
                        )}
                        {card.isOverdue && (
                            <svg className="w-3.5 h-3.5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}