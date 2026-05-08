/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        prime: {
          bg: '#0f171e',
          surface: '#1a242f',
          accent: '#00A8E1',
          'accent-hover': '#00adee',
          text: '#ffffff',
          muted: '#8197a4',
          'blue-light': '#79b8f3',
        }
      }
    },
  },
  plugins: [],
}