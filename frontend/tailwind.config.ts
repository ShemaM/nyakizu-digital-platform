import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        brand: {
          gold: "#C8860A",
          "gold-dark": "#9A6A08",
          "gold-light": "#E8B234",
        },
        // Dark mode background (forest green)
        dark: {
          primary: "#0a1f10",      // Main dark background
          secondary: "#060f07",    // Near-black sections
          tertiary: "#0c1f0e",     // Slightly lighter
          accent: "#0d1c09",       // Gradient accent
        },
        // Semantic colors
        success: "#4ade80",
        warning: "#fbbf24",
        error: "#f87171",
        info: "#3b82f6",
        // Grayscale (muted text layers)
        slate: {
          "950": "#0f172a",
          "900": "#0f172a",
          "800": "#1e293b",
          "700": "#334155",
          "600": "#475569",
          "500": "#64748b",
          "400": "#94a3b8",
          "300": "#cbd5e1",
          "200": "#e2e8f0",
          "100": "#f1f5f9",
          "50": "#f8fafc",
        },
      },
      spacing: {
        xs: "0.375rem",    // 6px
        sm: "0.5rem",      // 8px
        md: "1rem",        // 16px
        lg: "1.5rem",      // 24px
        xl: "2rem",        // 32px
        "2xl": "3rem",     // 48px
        "3xl": "4rem",     // 64px
        "4xl": "6rem",     // 96px
      },
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],      // 12px
        sm: ["0.875rem", { lineHeight: "1.25rem" }],  // 14px
        base: ["1rem", { lineHeight: "1.5rem" }],     // 16px
        lg: ["1.125rem", { lineHeight: "1.75rem" }],  // 18px
        xl: ["1.25rem", { lineHeight: "1.75rem" }],   // 20px
        "2xl": ["1.5rem", { lineHeight: "2rem" }],    // 24px
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }], // 30px
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }], // 36px
        "5xl": ["3rem", { lineHeight: "3.5rem" }],    // 48px
      },
      fontWeight: {
        light: "300",
        normal: "400",
        medium: "500",
        semibold: "600",
        bold: "700",
        extrabold: "800",
        black: "900",
      },
      borderRadius: {
        none: "0",
        sm: "0.375rem",     // 6px
        md: "0.5rem",       // 8px
        lg: "0.75rem",      // 12px
        xl: "1rem",         // 16px
        "2xl": "1.5rem",    // 24px
        full: "9999px",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgba(15, 23, 42, 0.05)",
        sm: "0 1px 3px 0 rgba(15, 23, 42, 0.1), 0 1px 2px -1px rgba(15, 23, 42, 0.1)",
        md: "0 4px 6px -1px rgba(15, 23, 42, 0.1), 0 2px 4px -2px rgba(15, 23, 42, 0.1)",
        lg: "0 10px 15px -3px rgba(15, 23, 42, 0.1), 0 4px 6px -4px rgba(15, 23, 42, 0.1)",
        xl: "0 20px 25px -5px rgba(15, 23, 42, 0.1), 0 8px 10px -6px rgba(15, 23, 42, 0.1)",
        none: "none",
      },
      opacity: {
        5: "0.05",
        10: "0.1",
        12: "0.12",
        18: "0.18",
        25: "0.25",
        50: "0.5",
        75: "0.75",
      },
      backgroundImage: {
        "gradient-dark": "linear-gradient(180deg, #0d1c09 0%, #0a1810 100%)",
        "gradient-cta": "linear-gradient(160deg, #0f3318 0%, #061508 60%, #0a1f10 100%)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "fade-in-up": "fade-in-up 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "slide-up": "slide-up 0.5s ease-out",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

export default config;