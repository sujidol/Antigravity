/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          50:  '#f8fafc',
          100: '#1a1a2e',
          200: '#16213e',
          300: '#0f3460',
          400: '#0a0a0a',
          900: '#050505',
        },
        accent: {
          DEFAULT: '#6366f1',
          hover:   '#4f46e5',
          glow:    'rgba(99,102,241,0.3)',
        },
        success: '#10b981',
        warning: '#f59e0b',
        danger:  '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      boxShadow: {
        glow: '0 0 20px rgba(99,102,241,0.2)',
        card: '0 4px 24px rgba(0,0,0,0.4)',
      },
    },
  },
  plugins: [],
}
