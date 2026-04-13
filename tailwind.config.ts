import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Warm, caring palette for atopy tracker
        skin: {
          50:  '#fff8f1',
          100: '#ffeedd',
          200: '#ffd9b7',
          300: '#ffbc84',
          400: '#ff934f',
          500: '#ff7328',
          600: '#f0550e',
          700: '#c73f0a',
          800: '#9e3310',
          900: '#7f2d13',
        },
        sage: {
          50:  '#f2f8f2',
          100: '#e0f0e0',
          200: '#c2e0c3',
          300: '#96c898',
          400: '#64aa68',
          500: '#428f47',
          600: '#317236',
          700: '#285c2d',
          800: '#224a26',
          900: '#1c3d20',
        },
        cream: {
          50:  '#fdfaf5',
          100: '#faf3e7',
          200: '#f4e4c8',
          300: '#ead0a2',
          400: '#ddb577',
          500: '#d19d55',
          600: '#bb8344',
          700: '#9c6a37',
          800: '#7d5530',
          900: '#674629',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
    },
  },
  plugins: [],
}
export default config
