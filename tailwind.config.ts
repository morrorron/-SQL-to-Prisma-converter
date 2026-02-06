import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/app/**/*.{ts,tsx}",
    "./src/components/**/*.{ts,tsx}",
    "./src/lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(214 32% 22%)",
        input: "hsl(214 32% 22%)",
        ring: "hsl(212 96% 78%)",
        background: "hsl(222 47% 11%)",
        foreground: "hsl(210 40% 98%)",
        primary: {
          DEFAULT: "hsl(212 96% 78%)",
          foreground: "hsl(222 47% 11%)"
        },
        secondary: {
          DEFAULT: "hsl(217 33% 17%)",
          foreground: "hsl(210 40% 98%)"
        },
        muted: {
          DEFAULT: "hsl(217 33% 17%)",
          foreground: "hsl(215 20% 65%)"
        },
        accent: {
          DEFAULT: "hsl(217 33% 17%)",
          foreground: "hsl(210 40% 98%)"
        },
        card: {
          DEFAULT: "hsl(222 47% 13%)",
          foreground: "hsl(210 40% 98%)"
        }
      },
      borderRadius: {
        lg: "0.5rem",
        md: "0.375rem",
        sm: "0.25rem"
      },
      boxShadow: {
        "soft-elevated":
          "0 18px 60px rgba(15, 23, 42, 0.7), 0 0 0 1px rgba(148, 163, 184, 0.2)"
      }
    }
  },
  plugins: []
};

export default config;
