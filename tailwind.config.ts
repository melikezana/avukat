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
        "accent-2": "#B8965A",
        "text-muted": "#5C5854",
        muted: "#5C5854",
        navy: {
          950: "#07111F",
          900: "#0A1628",
          800: "#14243A"
        },
        gold: {
          500: "#B8965A",
          600: "#9B7D47"
        },
        cream: {
          50: "#FAF7F1",
          100: "#EFE6D8"
        },
        burgundy: "#7A1F2B",
        ink: "#0A1628"
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        serif: ["var(--font-display)"]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(10, 22, 40, 0.08)",
        brand: "0 18px 50px rgba(122, 31, 43, 0.15)",
        gold: "0 16px 36px rgba(184, 150, 90, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
