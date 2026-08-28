/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        nature: {
          bg: '#141c1f',
          panel: '#1e292d',
          card: '#243339',
          border: '#33474f',
          grass: '#84cc16',
          grassDark: '#4d7c0f',
          wolf: '#ef4444',
          sheep: '#f8fafc',
          dead: '#64748b'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
