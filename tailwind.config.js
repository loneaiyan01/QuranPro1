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
        cream: {
          50: '#FCFCFA',
          100: '#F5F5F0',
          200: '#E6E6DF',
          300: '#D1D1C7',
        },
        emerald: {
          850: '#022C22',
          950: '#011C16',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        amiri: ['Amiri', 'serif'],
        quran: ['KFGQPC_V2', 'KFGQPC_V1', 'Uthmani_Hafs', 'Amiri', 'serif'],
      }
    },
  },
  plugins: [],
}
