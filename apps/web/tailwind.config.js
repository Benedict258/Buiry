/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./pages/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#10141a",
        surface: {
          DEFAULT: "#10141a",
          card: "#161B22",
          elevated: "#1C2128",
          container: "#1c2026",
          "container-low": "#181c22",
          "container-high": "#262a31",
          "container-highest": "#31353c",
          variant: "#31353c",
        },
        border: {
          subtle: "#30363D",
        },
        outline: "#8b919d",
        text: {
          primary: "#E6EDF3",
          secondary: "#8B949E",
        },
        primary: {
          DEFAULT: "#a2c9ff",
          container: "#58a6ff",
        },
        "on-primary": "#00315c",
        "on-secondary-container": "#e8d5ff",
        "on-surface-variant": "#8b919d",
        secondary: {
          DEFAULT: "#d8baff",
          container: "#5d2d9c",
        },
        tertiary: "#47dcca",
        status: {
          success: "#3FB950",
          warning: "#D29922",
          error: "#F85149",
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
