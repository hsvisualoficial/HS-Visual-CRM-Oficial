/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // ── MetricZap Neon Noir Executive ──────────────────
        "bg-base":      "#0B0B0B",   // Fundo principal
        "bg-card":      "#141414",   // Cards & superfícies
        "bg-border":    "#1F1F1F",   // Bordas sutis
        "magenta":      "#E01183",   // Destaque principal HS
        "magenta-dim":  "#B8006B",   // Magenta escurecido
        "turquesa":     "#20C2AE",   // Destaque tecnológico
        "turquesa-dim": "#189E8D",   // Turquesa mais sóbrio
        "text-primary": "#FFFFFF",   // Números de impacto
        "text-body":    "#F0F0F0",   // Leitura confortável
        "text-muted":   "#6B7280",   // Texto de apoio
        // ── Legacidade (mantido para componentes antigos) ──
        "primary":      "#E01183",
        "secondary":    "#20C2AE",
        "tertiary":     "#20C2AE",
        "outline":      "#1F1F1F",
        "surface":      "#141414",
        "background":   "#0B0B0B",
        "on-surface":   "#F0F0F0",
        "on-background":"#F0F0F0",
        "error":        "#FF5252",
        "surface-container-high": "#1F1F1F",
        "surface-container":      "#141414",
        "surface-container-low":  "#0D0D0D",
        "surface-variant":        "#1A1A1A",
      },
      fontFamily: {
        // Space Grotesk — títulos e números
        "headline":      ["Space Grotesk", "Urbanist", "sans-serif"],
        "display":       ["Space Grotesk", "sans-serif"],
        // Plus Jakarta Sans — textos de apoio e microcopy
        "body":          ["Plus Jakarta Sans", "Urbanist", "sans-serif"],
        "plus-jakarta":  ["Plus Jakarta Sans", "sans-serif"],
        "label":         ["Plus Jakarta Sans", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.75rem",
        "lg":      "1.25rem",
        "xl":      "1.75rem",
        "2xl":     "2rem",
        "full":    "9999px",
      },
      boxShadow: {
        "magenta":  "0 0 30px rgba(224, 17, 131, 0.12)",
        "turquesa": "0 0 30px rgba(32, 194, 174, 0.10)",
        "card":     "0 4px 24px rgba(0,0,0,0.6)",
        "glow-mg":  "0 4px 20px -5px rgba(224, 17, 131, 0.35)",
      },
    },
  },
  plugins: [],
}
