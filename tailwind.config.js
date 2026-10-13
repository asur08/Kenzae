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
          DEFAULT: '#FAF8F5',     // Linen / Warm Alabaster
          surface: '#FFFFFF',     // Pure White Card Surface
          subtle: '#F5F2EB',
          border: '#EFECE6',
        },
        obsidian: {
          DEFAULT: '#18181B',     // Deep Charcoal Obsidian (Headings)
          slate: '#52525B',       // Warm Slate (Descriptions/Body)
          muted: '#71717A',
        },
        brass: {
          DEFAULT: '#C5A880',     // Muted Kerala Temple Brass
          dark: '#8C6D37',
          light: '#DFCFB7',
          50: '#F9F6F0',
        },
        terracotta: {
          DEFAULT: '#B4533C',     // Warm Terracotta (Status Pills)
          dark: '#933E2B',
          light: '#E48873',
          50: '#FDF3F0',
        },
        emerald: {
          950: '#071B14',
          900: '#0B281E',
          850: '#0F382A',
          800: '#134635',
          700: '#1D604A',
          50: '#F1F9F5',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          hover: '#1EBE5D',
          dark: '#128C7E',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', '"Playfair Display"', 'Cinzel', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -10px rgba(24, 24, 27, 0.06), 0 4px 6px -2px rgba(24, 24, 27, 0.03)',
        'luxury-hover': '0 20px 40px -15px rgba(24, 24, 27, 0.12), 0 8px 12px -4px rgba(24, 24, 27, 0.05)',
        'brass-glow': '0 0 20px -5px rgba(197, 168, 128, 0.35)',
      }
    },
  },
  plugins: [],
}
