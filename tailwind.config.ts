import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "Cambria", "Times New Roman", "serif"],
        sans: ["var(--font-sans)", "-apple-system", "Helvetica", "Arial", "sans-serif"],
      },
      colors: {
        ink: "#16181c",
        "ink-soft": "#5b5f66",
        paper: "#fafaf8",
        "paper-raised": "#ffffff",
        rule: "#e5e3dd",
        accent: {
          DEFAULT: "#d97706",
          soft: "#fef3e2",
        },
      },
      boxShadow: {
        card: "0 1px 2px rgba(22,24,28,0.04), 0 1px 1px rgba(22,24,28,0.03)",
        "card-hover": "0 8px 24px rgba(22,24,28,0.08), 0 2px 6px rgba(22,24,28,0.05)",
      },
    },
  },
  plugins: [],
};

export default config;
