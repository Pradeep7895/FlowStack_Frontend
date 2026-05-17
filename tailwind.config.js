/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/**/*.{js,jsx,ts,tsx}"],
    theme: {
        extend: {
            colors: {
                primary: { DEFAULT: "#0052cc", light: "#4c9aff", dark: "#003884" },
                surface: { DEFAULT: "#ffffff", 2: "#f4f5f7", 3: "#ebecf0" },
                text: { DEFAULT: "#172b4d", muted: "#5e6c84", subtle: "#97a0af" },
                success: "#00875a",
                warning: "#ff991f",
                danger: "#de350b",
                info: "#0065ff",
            },
            fontFamily: {
                sans: ["'DM Sans'", "system-ui", "sans-serif"],
                mono: ["'DM Mono'", "monospace"],
            },
            boxShadow: {
                card: "0 1px 0 rgba(9,30,66,0.25)",
                raised: "0 4px 8px -2px rgba(9,30,66,0.25), 0 0 0 1px rgba(9,30,66,0.08)",
                overlay: "0 8px 16px -4px rgba(9,30,66,0.25), 0 0 0 1px rgba(9,30,66,0.08)",
            },
            borderRadius: { DEFAULT: "3px", lg: "8px", xl: "12px" },
            animation: {
                "fade-in": "fadeIn 0.15s ease-out",
                "slide-up": "slideUp 0.2s ease-out",
                "slide-down": "slideDown 0.2s ease-out",
                "slide-left": "slideLeft 0.3s ease-out",
            },
            keyframes: {
                fadeIn: { from: { opacity: 0 }, to: { opacity: 1 } },
                slideUp: { from: { opacity: 0, transform: "translateY(8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
                slideDown: { from: { opacity: 0, transform: "translateY(-8px)" }, to: { opacity: 1, transform: "translateY(0)" } },
                slideLeft: { from: { transform: "translateX(100%)" }, to: { transform: "translateX(0)" } },
            },
        },
    },
    plugins: [],
};