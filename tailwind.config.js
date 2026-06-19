/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}', './components/**/*.{js,jsx}', './lib/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          950: '#050608',
          900: '#080b12',
          850: '#0c1018',
          800: '#111827',
          700: '#1f2937',
          cyan: '#4ffcff',
          green: '#7CFF6B',
          pink: '#ff4fd8',
        },
      },
      boxShadow: {
        glow: '0 0 30px rgba(79, 252, 255, 0.12)',
      },
      fontFamily: {
        mono: ['var(--font-geist-mono)', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace'],
      },
    },
  },
  plugins: [],
};
