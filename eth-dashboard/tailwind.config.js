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
        brand: {
          50: '#f8f9fa',
          100: '#e9ecef',
          500: '#3f77ff',
          800: '#21325b',
          900: '#111b36',
        }
      }
    },
  },
  plugins: [],
}