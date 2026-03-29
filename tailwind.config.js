/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        moss: {
          50: '#f0f5ed',
          100: '#dce8d5',
          200: '#b9d1ab',
          300: '#96ba81',
          400: '#78a35e',
          500: '#5a8a48',
          600: '#3d6630',
          700: '#2d4a22',
          800: '#1f3518',
          900: '#142210',
        },
        bark: {
          50: '#faf7f2',
          100: '#f4efe6',
          200: '#e5daca',
          300: '#d1c0a8',
          400: '#b8a58e',
          500: '#8b7355',
          600: '#6b5a46',
          700: '#4a3c30',
          800: '#342a22',
          900: '#211a16',
        },
        cream: '#f5f0e8',
      },
      fontFamily: {
        sans: ['Pretendard', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
