/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ivory: {
          50: '#FAF8F5',
          100: '#F7F4EE',
          200: '#F0ECE1',
          300: '#E5DFC-D',
          400: '#D5CCB8',
          500: '#B8AB90',
        },
        charcoal: {
          50: '#F5F5F4',
          100: '#E7E5E4',
          200: '#D6D3D1',
          300: '#A8A29E',
          400: '#78716C',
          500: '#57534E',
          600: '#44403C',
          700: '#2B2825',
          800: '#23201D',
          900: '#1C1A18',
          950: '#12100E',
        },
        sage: {
          50: '#F4F6F4',
          100: '#E6EBE6',
          200: '#CDD7CD',
          300: '#A2B29F',
          400: '#8A9A7E',
          500: '#6E7E62',
          600: '#57654E',
          700: '#434E3C',
        },
        champagne: {
          50: '#FBF9F5',
          100: '#F5EFEB',
          200: '#EBDDCE',
          300: '#DFD3C3',
          400: '#C5A880',
          500: '#B39164',
          600: '#94754B',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', '"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'subtle': '0 2px 10px rgba(28, 26, 24, 0.04)',
        'soft': '0 8px 30px rgba(28, 26, 24, 0.06)',
        'lift': '0 12px 36px rgba(28, 26, 24, 0.08)',
      }
    },
  },
  plugins: [],
}
