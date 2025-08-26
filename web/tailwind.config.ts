import type { Config } from "tailwindcss";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { heroui } = require("@heroui/react");

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "var(--primary)",
        
        // WSL Brand Colors (Ocean Blue Palette)
        "wsl-primary-blue": "var(--wsl-primary-blue)",
        "wsl-deep-blue": "var(--wsl-deep-blue)", 
        "wsl-ocean-blue": "var(--wsl-ocean-blue)",
        "wsl-light-blue": "var(--wsl-light-blue)",
        
        // WSL Grays
        "wsl-white": "var(--wsl-white)",
        "wsl-gray-50": "var(--wsl-gray-50)",
        "wsl-gray-100": "var(--wsl-gray-100)",
        "wsl-gray-500": "var(--wsl-gray-500)",
        "wsl-gray-700": "var(--wsl-gray-700)",
        "wsl-gray-900": "var(--wsl-gray-900)",
        
        // WSL Accent Colors
        "wsl-success-green": "var(--wsl-success-green)",
        "wsl-warning-orange": "var(--wsl-warning-orange)",
        "wsl-rank-gold": "var(--wsl-rank-gold)",
        "wsl-rank-silver": "var(--wsl-rank-silver)",
        "wsl-rank-bronze": "var(--wsl-rank-bronze)",

        // Legacy colors (keep for now to avoid breaking changes)
        navy900: "#001143",
        navy800: "#1A2956",
        navy700: "#334155",
        navy600: "#4D587B",
        navy500: "#66708E",
        navy400: "#98A2B7",
        navy300: "#CBD5E1",
        navy200: "#E2E8F0",
        navy100: "#F1F5F9",
        navy50: "#F8FAFC",
        
        neutral900: "#171717",
        neutral800: "#262626",
        neutral700: "#404040",
        neutral600: "#525252",
        neutral500: "#737373",
        neutral400: "#A3A3A3",
        neutral300: "#D4D4D4",
        neutral200: "#E5E5E5",
        neutral100: "#F5F5F5",
        neutral50: "#FAFAFA",

        success800: "#166534",
        success700: "#15803D",
        success500: "#22C55E",
        success100: "#DCFCE7",
        success50: "#F0FDF4",

        error800: "#9A1A1E",
        error700: "#BA1B21",
        error500: "#F04349",
        error100: "#FEE2E3",
        error50: "#FEF2F2",

        info800: "#1E40AF",
        info700: "#1D4ED8",
        info500: "#3B82F6",
        info100: "#DBEAFE",
        info50: "#EFF6FF",

        warning800: "#92400E",
        warning700: "#B45309",
        warning500: "#F59E0B",
        warning100: "#FEF3C7",
        warning50: "#FFFBEB",

      },
      screens: {
        '3xl': '120rem',
        '4xl': '140rem',
        '5xl': '160rem',
        'iframe': '847px',
      }
    },
  },
  darkMode: "selector",
  plugins: [
    heroui({
      themes: {
        light: {
          colors: {
            secondary: "#589CFF",
          },
        },
        dark: {
          colors: {
            secondary: "#589CFF",
            danger: "#DD8D90",
          },
        },
      },
    }),
  ],
} satisfies Config;
