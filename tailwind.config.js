/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'selector',
  theme: {
    extend: {
      colors: {
        serwin: 'var(--serwin-blue)',
        compute: 'var(--color-compute)',
        gaming: 'var(--color-gaming)',
        ai: 'var(--color-ai)',
        storage: 'var(--color-storage)',
      },
      backdropBlur: {
        md: '12px',
      },
    },
  },
  plugins: [],
}
