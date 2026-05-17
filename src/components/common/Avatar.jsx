import { getInitials, getAvatarColor } from "../../utils/helpers";

export default function Avatar({ name = "", src, size = "md", className = "" }) {
    const sizes = { xs: "w-5 h-5 text-[9px]", sm: "w-7 h-7 text-xs", md: "w-8 h-8 text-sm", lg: "w-10 h-10 text-base", xl: "w-14 h-14 text-xl" };
    const cls = `${sizes[size]} rounded-full flex items-center justify-center font-semibold flex-shrink-0 ${className}`;
    if (src) return <img src={src} alt={name} className={`${cls} object-cover`} />;
    return (
        <div className={cls} style={{ backgroundColor: getAvatarColor(name), color: "#fff" }}>
            {getInitials(name)}
        </div>
    );
}