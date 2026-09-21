import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        'bg-deep': '#120f1e',
        'bg-deep-2': '#1b1530',
        gold: '#ffc857',
        pink: '#ff5d8f',
        teal: '#3fe0c5',
        cream: '#f8f3ec',
        muted: '#b3a9c9',
      },
      fontFamily: {
        display: ['Unbounded', 'sans-serif'],
        sans: ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;