/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        canvas: {
          DEFAULT: '#FAF8F5',
          subtle: '#F3EFE6',
          muted: '#EBE5D8',
          dark: '#E2D9C8',
        },
        emerald: {
          950: '#071B14',
          900: '#0B281E',
          850: '#0F382A',
          800: '#134635',
          700: '#1D604A',
          600: '#288063',
          100: '#E2F3EC',
          50: '#F1F9F5',
        },
        gold: {
          300: '#F2DDA4',
          400: '#E5C768',
          500: '#D4AF37',
          600: '#B89324',
          700: '#967417',
          50: '#FAF6E9',
        },
        obsidian: {
          DEFAULT: '#1A1A1A',
          light: '#2D2D2D',
          muted: '#5A564F',
        },
        terracotta: {
          500: '#9B3D3D',
          600: '#832E2E',
          50: '#FDF3F3',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          hover: '#1EBE5D',
          dark: '#128C7E',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Cinzel', 'Playfair Display', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(11, 40, 30, 0.08), 0 4px 6px -2px rgba(11, 40, 30, 0.04)',
        'luxury-hover': '0 20px 40px -15px rgba(11, 40, 30, 0.16), 0 8px 12px -4px rgba(11, 40, 30, 0.06)',
        'gold-glow': '0 0 25px -5px rgba(212, 175, 55, 0.25)',
      }
    },
  },
  plugins: [],
}
