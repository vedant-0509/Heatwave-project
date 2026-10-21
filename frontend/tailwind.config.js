/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#0b0f19',
          card: '#131b2e',
          panel: '#182238',
          border: '#243354',
          text: '#f1f5f9',
          muted: '#94a3b8'
        },
        brand: {
          blue: '#38bdf8',
          teal: '#2ec4b6',
          yellow: '#f7b801',
          orange: '#f15bb5',
          red: '#e63946'
        }
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
