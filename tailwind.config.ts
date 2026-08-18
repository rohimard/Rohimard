import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Marca principal: azul profundo y confiable (profesionalidad + tecnología)
        brand: {
          50: "#eff5ff",
          100: "#dbe8fe",
          200: "#bfd7fe",
          300: "#93bbfd",
          400: "#6096fa",
          500: "#3b73f6",
          600: "#2456eb",
          700: "#1c43d8",
          800: "#1d38af",
          900: "#1d338a",
          950: "#152154",
        },
        // Acento: verde para señales de éxito (cotización aceptada / rapidez)
        accent: {
          50: "#ecfdf5",
          100: "#d1fae5",
          200: "#a7f3d0",
          400: "#34d399",
          500: "#10b981",
          600: "#059669",
          700: "#047857",
        },
        ink: {
          50: "#f6f7f9",
          100: "#eceef2",
          200: "#d5dae2",
          300: "#b0b9c8",
          400: "#8593a8",
          500: "#65748c",
          600: "#505c72",
          700: "#414a5c",
          800: "#38404e",
          900: "#0f141c",
          950: "#080b11",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        soft: "0 1px 2px 0 rgba(15,20,28,0.04), 0 8px 24px -8px rgba(15,20,28,0.10)",
        card: "0 1px 3px rgba(15,20,28,0.06), 0 12px 32px -12px rgba(15,20,28,0.14)",
        glow: "0 20px 60px -20px rgba(36,86,235,0.45)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%,100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
