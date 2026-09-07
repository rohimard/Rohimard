import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "1.25rem",
      screens: { "2xl": "1240px" },
    },
    extend: {
      colors: {
        // Identidad MOMENTIA
        borgona: {
          DEFAULT: "#6B0F1A",
          50: "#FBEEEF",
          100: "#F2D4D7",
          200: "#E0A6AC",
          300: "#CD7981",
          400: "#B44B56",
          500: "#93202D",
          600: "#6B0F1A",
          700: "#560C15",
          800: "#420910",
          900: "#2D060B",
        },
        rubi: {
          DEFAULT: "#B93A5A",
          50: "#FBEFF2",
          100: "#F4D3DC",
          200: "#E6A6B7",
          300: "#D77A93",
          400: "#C95770",
          500: "#B93A5A",
          600: "#96263F",
          700: "#701D2E",
        },
        rosa: {
          DEFAULT: "#E7B1B8",
          50: "#FBF2F3",
          100: "#F6E1E4",
          200: "#E7B1B8",
          300: "#DB919A",
        },
        crema: {
          DEFAULT: "#F7E7DB",
          50: "#FFFBF8",
          100: "#F7E7DB",
          200: "#EFD4BF",
        },
        dorado: {
          DEFAULT: "#C8A57A",
          50: "#F4EDE3",
          100: "#E6D3B8",
          200: "#D6BB93",
          300: "#C8A57A",
          400: "#B58C58",
          500: "#8F6B3E",
        },
        blanco: {
          DEFAULT: "#FFF9F5",
        },
        ink: "#2B1B1D",
      },
      fontFamily: {
        serif: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        script: ["var(--font-script)", "cursive"],
      },
      boxShadow: {
        soft: "0 2px 8px -2px rgba(107,15,26,0.08), 0 12px 32px -12px rgba(107,15,26,0.14)",
        card: "0 1px 2px rgba(107,15,26,0.06), 0 20px 48px -18px rgba(107,15,26,0.22)",
        gold: "0 0 0 1px rgba(200,165,122,0.35)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%,100%": { opacity: "1" },
          "50%": { opacity: "0.6" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
        "fade-in": "fade-in 0.8s ease both",
        float: "float 7s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "pulse-soft": "pulse-soft 2.4s ease-in-out infinite",
      },
      backgroundImage: {
        "gold-line": "linear-gradient(90deg, transparent, #C8A57A, transparent)",
      },
    },
  },
  plugins: [],
};

export default config;
