/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        espresso: "#1A120B",
        charcoal: "#2D3436",
        cream: "#FDFDFF",
        luntian: "#4A8E5D",
        dilaw: "#F9A826",
        pula: "#AE433A",
        ginto: "#C9A84C",
      },
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
      animation: {
        "badge-glow": "badgeGlow 2s ease-in-out infinite",
        "fade-in": "fadeIn 0.3s ease-out",
        "slide-up": "slideUp 0.4s cubic-bezier(0.16,1,0.3,1)",
      },
      keyframes: {
        badgeGlow: {
          "0%,100%": { filter: "drop-shadow(0 0 4px currentColor)" },
          "50%": { filter: "drop-shadow(0 0 12px currentColor)" },
        },
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};
