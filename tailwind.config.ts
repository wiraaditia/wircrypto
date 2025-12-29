import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#000000",
        foreground: "#ffffff",
        terminal: {
          black: "#000000",
          charcoal: "#121212",
          gray: "#1e1e1e",
          mint: "#00ff9f",
          red: "#ff4d4d",
          border: "#2a2a2a",
        },
      },
    },
  },
  plugins: [],
};
export default config;
