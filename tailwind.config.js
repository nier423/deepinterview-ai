/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          500: '#0ea5e9', // Sky blue for friendly interactions
          600: '#0284c7',
          700: '#0369a1',
          900: '#0c4a6e', // Deep Navy for professionalism
        },
        accent: {
          400: '#818cf8', // Indigo for accents
          500: '#6366f1',
        },
        surface: '#f8fafc', // Slate 50
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'], // Modern coding font
      },
    },
  },
  plugins: [],
}