import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: { DEFAULT: "#2563EB", foreground: "#FFFFFF" },
        secondary: { DEFAULT: "#60A5FA", foreground: "#0F172A" },
        success: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B",
        background: "#F8FAFC",
        card: "#FFFFFF",
        foreground: "#0F172A",
        muted: { DEFAULT: "#64748B", foreground: "#64748B" },
        border: "hsl(214 32% 91%)",
      },
      borderRadius: {
        lg: "20px",
        md: "16px",
        sm: "12px",
      },
      boxShadow: {
        subtle: "0 1px 2px 0 rgba(15, 23, 42, 0.04), 0 1px 3px 0 rgba(15, 23, 42, 0.06)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
