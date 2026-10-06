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
      fontFamily: {
        display: ["var(--font-display)", "ui-sans-serif", "sans-serif"],
      },
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
        // Premium Nyakizu Brand — radiant and legible on dark backgrounds
        brand: {
          gold: "#F59E0B",
          "gold-dark": "#D97706",
          "gold-light": "#FBBF24",
          "gold-subtle": "rgba(245, 158, 11, 0.15)",
        },
        // Semantic Canvas and Surfaces — Dynamic via CSS variables (Light & Dark)
        dark: {
          deepest: "rgb(var(--canvas-deepest) / <alpha-value>)",
          primary: "rgb(var(--canvas-primary) / <alpha-value>)",
          secondary: "rgb(var(--canvas-secondary) / <alpha-value>)",
          tertiary: "rgb(var(--canvas-tertiary) / <alpha-value>)",
          accent: "rgb(var(--border-accent) / <alpha-value>)",
          card: "rgb(var(--canvas-card) / <alpha-value>)",
        },
        'dark-primary': 'rgb(var(--canvas-primary) / <alpha-value>)',
        'dark-secondary': 'rgb(var(--canvas-secondary) / <alpha-value>)',
        'dark-tertiary': 'rgb(var(--canvas-tertiary) / <alpha-value>)',
        'dark-card': 'rgb(var(--canvas-card) / <alpha-value>)',
        'dark-accent': 'rgb(var(--border-accent) / <alpha-value>)',
        'dark-deepest': 'rgb(var(--canvas-deepest) / <alpha-value>)',
        success: "#10B981",
        warning: "#F59E0B",
        error: "#EF4444",
        info: "#3B82F6",
        // Semantic text tokens — Dynamic via CSS variables (Light & Dark)
        'text-primary': "rgb(var(--text-primary-color) / <alpha-value>)",
        'text-secondary': "rgb(var(--text-secondary-color) / <alpha-value>)",
        'text-muted': "rgb(var(--text-muted-color) / <alpha-value>)",
        ink: {
          bg: "rgb(var(--canvas-primary) / <alpha-value>)",
          card: "rgb(var(--canvas-card) / <alpha-value>)",
          border: "rgb(var(--border-accent) / <alpha-value>)",
        },
        // Elevated surface for public cards / store previews
        surface: {
          DEFAULT: "hsl(var(--surface, 215 21% 11%))",
          foreground: "hsl(var(--surface-foreground, 213 100% 96%))",
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
        'gradient-dark': 'linear-gradient(180deg, #0D1117 0%, #161B22 100%)',
        'gradient-cta': 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
        'gradient-hero': 'radial-gradient(ellipse at top right, rgba(245, 158, 11, 0.12), transparent 50%), radial-gradient(ellipse at bottom left, rgba(217, 119, 6, 0.08), transparent 50%)',
        'gradient-card': 'linear-gradient(180deg, rgba(33, 38, 45, 0.8) 0%, rgba(22, 27, 34, 0.9) 100%)',
        'gradient-glow': 'radial-gradient(50% 50% at 50% 50%, rgba(245, 158, 11, 0.15) 0%, transparent 100%)',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.3)',
        DEFAULT: '0 1px 2px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.3)',
        md: '0 4px 8px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.4)',
        lg: '0 4px 8px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.4)',
        xl: '0 8px 16px rgba(0,0,0,0.4), 0 24px 64px rgba(0,0,0,0.5)',
        '2xl': '0 8px 16px rgba(0,0,0,0.4), 0 24px 64px rgba(0,0,0,0.5)',
        inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.3)',
        brand: '0 15px 40px rgba(245, 158, 11, 0.25)',
        'brand-lg': '0 20px 60px rgba(245, 158, 11, 0.2)',
        card: '0 1px 2px rgba(0,0,0,0.25), 0 4px 12px rgba(0,0,0,0.3)',
        'card-hover': '0 4px 8px rgba(0,0,0,0.3), 0 12px 32px rgba(0,0,0,0.4)',
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
