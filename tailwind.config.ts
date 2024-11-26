import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        light: {
          background: '#ffffff',
          text: '#1a202c',
          primary: '#3182ce',
        },
        dark: {
          background: '#1a202c',
          text: '#e2e8f0',
          primary: '#63b3ed',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
