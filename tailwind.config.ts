import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{md,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        background: "#FAF7F1",
        primary: "#0A1628",
        "accent-1": "#7A1F2B",
        "accent-2": "#8B6A2F",
        "text-muted": "#5C5854",
        muted: "#5C5854",
        navy: {
          950: "#07111F",
          900: "#0A1628",
          800: "#14243A"
        },
        gold: {
          400: "#CFAE77",
          500: "#8B6A2F",
          600: "#6D5125"
        },
        cream: {
          50: "#FAF7F1",
          100: "#EFE6D8"
        },
        ink: "#0A1628"
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        serif: ["var(--font-display)"]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(10, 22, 40, 0.08)",
        brand: "0 18px 50px rgba(128, 99, 51, 0.18)",
        gold: "0 16px 36px rgba(184, 150, 90, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
