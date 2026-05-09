/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0a0a1a',
          900: '#0d0d1f',
          800: '#1a1a2e',
          700: '#1e1e3a',
        },
        bullish: '#00d26a',
        bearish: '#ff4757',
        neutral: '#ffa502',
        accent: '#3742fa',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'Consolas', 'monospace'],
      },
    },
  },
  plugins: [],
}
