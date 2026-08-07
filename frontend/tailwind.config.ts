import type { Config } from "tailwindcss"

const config = {
  darkMode: "class",
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
	],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Premium Nyakizu Brand — gold is the one hero accent (the ledger +
        // the market building story). Kept as "brand.gold" for the hundreds
        // of existing call sites.
        brand: {
          gold: "#C8860A",
          "gold-dark": "#A97706",
          "gold-light": "#E8B234",
          "gold-subtle": "rgba(200, 134, 10, 0.1)",
        },
        // Foundation surfaces — warm paper, not cool slate. "dark.*" names are
        // kept (hundreds of call sites reference them) but hold LIGHT, warm
        // values; the app is a light theme. Elevation increases toward white:
        // deepest/tertiary/card (floating headers, cards) are pure white,
        // primary/secondary (ambient page background) are warm off-whites.
        dark: {
          deepest: "#FFFFFF",
          primary: "#FAF9F6",   // bg.app — warm paper
          secondary: "#F4F1EA", // bg.muted
          tertiary: "#FFFFFF",
          accent: "#E6E1D7",    // border
          card: "#FFFFFF",      // bg.surface
        },
        'dark-primary': '#FAF9F6', // Compatibility alias
        success: "#15803D",  // money-cleared, darkened from #16A34A for 4.5:1 text contrast on white
        warning: "#B45309",  // money-owed
        error: "#DC2626",
        info: "#2563EB",
        // Semantic text tokens — warm ink, not cool slate
        'text-primary': "#14120E",
        'text-secondary': "#4A4438",
        'text-muted': "#6B6459",  // ~5:1 on paper/white — passes WCAG AA for normal text
        // Literal dark-navy palette for marketing/auth pages (the "dark.*" tokens
        // above now hold LIGHT values for the in-app theme, so marketing pages
        // that need an actual dark background use these instead).
        ink: {
          bg: "#0B0F1A",
          card: "#111827",
          border: "#1E293B",
        },
        // Light "paper" surface for print/public-facing pages (receipts, store preview)
        surface: {
          DEFAULT: "hsl(var(--surface, 48 20% 97%))",
          foreground: "hsl(var(--surface-foreground, 30 15% 6%))",
        },
      },
      borderRadius: {
        // 3-step scale per the design-system spec: sm/md/lg are the only
        // real steps. xl/2xl/3xl collapse into "lg" so every page's radius
        // — regardless of which Tailwind class it happens to use — lands on
        // one of 3 real values instead of 5+ divergent ones.
        sm: "0.5rem",   // 8px
        md: "0.75rem",  // 12px
        lg: "1rem",     // 16px
        xl: "1rem",
        '2xl': "1rem",
        '3xl': "1rem",
      },
      backgroundImage: {
        'gradient-dark': 'linear-gradient(180deg, #0F172A 0%, #111827 100%)',
        'gradient-cta': 'linear-gradient(135deg, #C8860A 0%, #A97706 100%)',
        'gradient-hero': 'radial-gradient(ellipse at top right, rgba(200, 134, 10, 0.10), transparent 50%), radial-gradient(ellipse at bottom left, rgba(217, 119, 6, 0.08), transparent 50%)',
        'gradient-card': 'linear-gradient(180deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.9) 100%)',
        'gradient-glow': 'radial-gradient(50% 50% at 50% 50%, rgba(200, 134, 10, 0.12) 0%, transparent 100%)',
      },
      boxShadow: {
        // 3-step, soft, warm-tinted shadows (rgba against #14120E ink, not
        // pure black) — collapsed the same way as radius so shadow-sm through
        // shadow-2xl all resolve to one of 3 real elevation steps.
        sm: '0 1px 2px rgba(20,18,14,0.04), 0 4px 12px rgba(20,18,14,0.05)',
        DEFAULT: '0 1px 2px rgba(20,18,14,0.04), 0 4px 12px rgba(20,18,14,0.05)',
        md: '0 4px 8px rgba(20,18,14,0.06), 0 12px 32px rgba(20,18,14,0.10)',
        lg: '0 4px 8px rgba(20,18,14,0.06), 0 12px 32px rgba(20,18,14,0.10)',
        xl: '0 8px 16px rgba(20,18,14,0.08), 0 24px 64px rgba(20,18,14,0.14)',
        '2xl': '0 8px 16px rgba(20,18,14,0.08), 0 24px 64px rgba(20,18,14,0.14)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.06)',
        brand: '0 15px 40px rgba(200, 134, 10, 0.2)',
        'brand-lg': '0 20px 60px rgba(200, 134, 10, 0.15)',
        card: '0 1px 2px rgba(20,18,14,0.04), 0 4px 12px rgba(20,18,14,0.05)',
        'card-hover': '0 4px 8px rgba(20,18,14,0.06), 0 12px 32px rgba(20,18,14,0.10)',
      },
      spacing: {
        '18': '4.5rem',
        '22': '5.5rem',
        '30': '7.5rem',
      },
      fontSize: {
        // Semantic 7-step type scale with a 12px caption / 14px body floor —
        // the single rule that fixes the biggest mobile + accessibility
        // failure (9–11px text throughout). Nothing in the app should render
        // smaller than `caption`.
        caption: ['0.75rem', { lineHeight: '1rem' }],        // 12/16
        body: ['0.875rem', { lineHeight: '1.25rem' }],       // 14/20
        'body-lg': ['1rem', { lineHeight: '1.5rem' }],       // 16/24
        title: ['1.125rem', { lineHeight: '1.625rem' }],     // 18/26
        'title-lg': ['1.375rem', { lineHeight: '1.875rem' }], // 22/30
        display: ['1.75rem', { lineHeight: '2.125rem' }],    // 28/34
        hero: ['2.5rem', { lineHeight: '2.75rem' }],         // 40/44
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in-up": {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "scale-in": {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(100%)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "toast-in": {
          from: { opacity: "0", transform: "translateY(-12px) scale(0.96)" },
          to: { opacity: "1", transform: "translateY(0) scale(1)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in": "fade-in 0.5s ease-out",
        "fade-in-up": "fade-in-up 0.6s ease-out",
        "scale-in": "scale-in 0.18s ease-out",
        "slide-up": "slide-up 0.25s ease-out",
        "toast-in": "toast-in 0.2s ease-out",
      },
      transitionTimingFunction: {
        spring: "var(--ease-spring)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config
