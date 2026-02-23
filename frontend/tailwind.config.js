/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        clinic: {
          50: '#eef7f6',
          100: '#d9ece8',
          400: '#4c9f91',
          700: '#1f4f47',
          900: '#132c29',
        }
      }
    },
  },
  plugins: [],
}
