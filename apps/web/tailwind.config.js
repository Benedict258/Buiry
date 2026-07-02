/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: "var(--color-background)",
        surface: {
          DEFAULT: "var(--color-surface)",
          card: "var(--color-surface-card)",
          elevated: "var(--color-surface-elevated)",
          container: "var(--color-surface-container)",
          "container-low": "var(--color-surface-container-low)",
          "container-high": "var(--color-surface-container-high)",
          "container-highest": "var(--color-surface-container-highest)",
          variant: "var(--color-surface-variant)",
        },
        border: {
          subtle: "var(--color-border-subtle)",
        },
        outline: "var(--color-outline)",
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
        },
        primary: {
          DEFAULT: "var(--color-primary)",
          container: "var(--color-primary-container)",
        },
        "on-primary": "var(--color-on-primary)",
        "on-secondary-container": "var(--color-on-secondary-container)",
        "on-surface-variant": "var(--color-on-surface-variant)",
        secondary: {
          DEFAULT: "var(--color-secondary)",
          container: "var(--color-secondary-container)",
        },
        tertiary: "var(--color-tertiary)",
        status: {
          success: "var(--color-status-success)",
          warning: "var(--color-status-warning)",
          error: "var(--color-status-error)",
        },
      },
      fontFamily: {
        "headline-lg": ["Inter", "sans-serif"],
        "headline-md": ["Inter", "sans-serif"],
        "section-header": ["Inter", "sans-serif"],
        "body-base": ["Inter", "sans-serif"],
        "nav-link": ["Inter", "sans-serif"],
        "meta-mono": ["JetBrains Mono", "monospace"],
        "technical-id": ["JetBrains Mono", "monospace"],
        "code-sm": ["JetBrains Mono", "monospace"],
      },
      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
      },
    },
  },
  plugins: [],
};
