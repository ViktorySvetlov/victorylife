import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "-apple-system",
          "BlinkMacSystemFont",
          "SF Pro Display",
          "SF Pro Text",
          "Inter",
          "Segoe UI",
          "sans-serif",
        ],
      },
      colors: {
        victory: {
          black: "#0B0B0F",
          soft: "#15161A",
          blue: "#0A84FF",
          deepblue: "#0057D9",
          gray: "#F5F5F7",
        },
      },
      boxShadow: {
        soft: "0 24px 80px rgba(11,11,15,.10)",
        blue: "0 18px 60px rgba(10,132,255,.22)",
      },
    },
  },
  plugins: [],
};
export default config;
