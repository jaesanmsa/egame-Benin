import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        background: "#0A0A0F",
        surface: "#0F0F1E",
        violetPrimary: "#8A2BE2",
        violetAccent: "#A855F7",
        gold: "#FFD700",
        textMain: "#FFFFFF",
        textMuted: "#8888AA",
        border: "rgba(138, 43, 226, 0.2)",
        input: "#0F0F1E",
        ring: "#8A2BE2",
        card: {
          DEFAULT: "#0F0F1E",
          foreground: "#FFFFFF",
        },
        primary: {
          DEFAULT: "#8A2BE2",
          foreground: "#FFFFFF",
        },
        accent: {
          DEFAULT: "#FFD700",
          foreground: "#0A0A0F",
        },
        muted: {
          DEFAULT: "#151528",
          foreground: "#8888AA",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        gaming: ["Orbitron", "sans-serif"],
        esport: ["Rajdhani", "sans-serif"],
      },
      borderRadius: {
        lg: "1.5rem",
        md: "1rem",
        sm: "0.75rem",
      },
      boxShadow: {
        glowViolet: "0 0 25px rgba(138, 43, 226, 0.4)",
        glowGold: "0 0 25px rgba(255, 215, 0, 0.4)",
        glowGreen: "0 0 20px rgba(34, 197, 94, 0.4)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        pulseGlow: {
          "0%, 100%": { opacity: "1", filter: "drop-shadow(0 0 15px rgba(138, 43, 226, 0.6))" },
          "50%": { opacity: "0.7", filter: "drop-shadow(0 0 25px rgba(168, 85, 247, 0.9))" },
        },
        borderGlow: {
          "0%, 100%": { borderColor: "rgba(138, 43, 226, 0.8)", boxShadow: "0 0 15px rgba(138, 43, 226, 0.4)" },
          "50%": { borderColor: "rgba(255, 215, 0, 0.8)", boxShadow: "0 0 20px rgba(255, 215, 0, 0.5)" },
        }
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "pulse-glow": "pulseGlow 2s infinite ease-in-out",
        "border-glow": "borderGlow 3s infinite ease-in-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;