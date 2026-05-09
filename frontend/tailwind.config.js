/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base:    '#0a0a1a',
        card:    '#1a1a2e',
        border:  '#2a2a4a',
        bull:    '#00d26a',
        bear:    '#ff4757',
        neutral: '#ffa502',
        accent:  '#3742fa',
        muted:   '#8a8ab0',
      },
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
