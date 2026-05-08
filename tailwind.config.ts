import type { Config } from "tailwindcss";

export default {
  content: ["./app/index.html", "./app/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#172026",
        paper: "#f7f3ea",
        panel: "#fffdf8",
        teal: "#005f73",
        coral: "#d95f43",
        moss: "#5c7c46",
        plum: "#6f4e7c",
        gold: "#c49a32"
      },
      boxShadow: {
        soft: "0 20px 60px rgb(23 32 38 / 0.12)"
      }
    }
  },
  plugins: []
} satisfies Config;
