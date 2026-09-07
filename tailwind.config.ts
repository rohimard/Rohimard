import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Paleta de marca Momentia (ver moodboard):
        // vino profundo, rosa, blush, crema y dorado.
        maroon: {
          50: "#fbeef0",
          100: "#f3d6da",
          200: "#e3a9b1",
          300: "#cf7885",
          400: "#a9445a",
          500: "#8a2438",
          600: "#6b0f1a", // color de marca principal
          700: "#560d16",
          800: "#420a11",
          900: "#2e070c",
          950: "#1c0407",
        },
        rose: {
          50: "#fdf1f3",
          100: "#fbe0e5",
          200: "#f5bfc9",
          300: "#eb95a6",
          400: "#d8657e",
          500: "#b93a5a", // color de marca acento
          600: "#9c2c48",
          700: "#7d233a",
          800: "#611c2e",
          900: "#4a1524",
        },
        blush: {
          50: "#fdf7f6",
          100: "#f7e7db", // crema de fondo
          200: "#e7b1b8", // blush de marca
          300: "#dc98a2",
        },
        gold: {
          300: "#e2c9a0",
          400: "#cba57a", // dorado de marca
          500: "#b78d5f",
          600: "#96703f",
        },
        cream: {
          DEFAULT: "#f7e7db",
          50: "#fffdfb",
          100: "#faf1e8",
        },
        ink: {
          50: "#f7f4f3",
          100: "#ece4e3",
          200: "#d8c9c7",
          300: "#b7a1a0",
          400: "#8f7473",
          500: "#6f5453",
          600: "#584140",
          700: "#463534",
          800: "#382b2a",
          900: "#241a19",
          950: "#150f0e",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "serif"],
        script: ["var(--font-script)", "cursive"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(46,7,12,0.06), 0 8px 24px -8px rgba(46,7,12,0.14)",
        card: "0 1px 3px rgba(46,7,12,0.08), 0 16px 40px -16px rgba(46,7,12,0.22)",
        glow: "0 20px 60px -20px rgba(107,15,26,0.55)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
        "3xl": "1.75rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "envelope-open": {
          "0%": { transform: "rotateX(0deg)" },
          "100%": { transform: "rotateX(-180deg)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 6s ease-in-out infinite",
      },
      backgroundImage: {
        "damask":
          "radial-gradient(circle at 1px 1px, rgba(107,15,26,0.08) 1px, transparent 0)",
      },
    },
  },
  plugins: [],
};

export default config;
