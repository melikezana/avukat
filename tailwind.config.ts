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
        navy: {
          950: "#07172B",
          900: "#0B1F3A",
          800: "#123154"
        },
        gold: {
          500: "#C9A24B",
          600: "#A9842F"
        },
        cream: {
          50: "#FAF7F2",
          100: "#F1E8DA"
        },
        ink: "#1D2430"
      },
      fontFamily: {
        sans: ["var(--font-body)"],
        serif: ["var(--font-display)"]
      },
      boxShadow: {
        soft: "0 18px 60px rgba(11, 31, 58, 0.08)",
        gold: "0 16px 36px rgba(201, 162, 75, 0.16)"
      }
    }
  },
  plugins: []
};

export default config;
