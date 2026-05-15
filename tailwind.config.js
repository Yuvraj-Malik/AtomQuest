/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
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
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace'],
      },
      colors: {
        background: "var(--bg-base)",
        foreground: "var(--text-primary)",
        surface: "var(--bg-surface)",
        elevated: "var(--bg-elevated)",
        subtle: "var(--bg-subtle)",
        border: "var(--border)",
        "border-strong": "var(--border-strong)",
        primary: "var(--text-primary)",
        secondary: "var(--text-secondary)",
        tertiary: "var(--text-tertiary)",
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          soft: "var(--accent-soft)",
          border: "var(--accent-border)",
        },
        green: {
          DEFAULT: "var(--green)",
          soft: "var(--green-soft)",
        },
        red: {
          DEFAULT: "var(--red)",
          soft: "var(--red-soft)",
        },
        amber: {
          DEFAULT: "var(--amber)",
          soft: "var(--amber-soft)",
        },
        "gray-muted": "var(--gray-muted)",
        "gray-soft": "var(--gray-soft)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
