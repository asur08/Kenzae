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
          DEFAULT: '#C8A46B',     // Warm Antique Champagne Brass
          dark: '#8E6B32',
          light: '#EDE0C8',
          50: '#F9F6F0',
        },
        gold: {
          300: '#EDE0C8',
          400: '#D4B684',
          500: '#C8A46B',
          600: '#A68754',
          700: '#8E6B32',
        },
        terracotta: {
          DEFAULT: '#B4533C',     // Warm Terracotta (Status Pills)
          dark: '#933E2B',
          light: '#E48873',
          50: '#FDF3F0',
        },
        maroon: {
          950: '#340813',         // Deep Oxblood Maroon (Announcement bar, Footer)
          900: '#4B0E1D',         // Royal Maroon (Primary Buttons, Active Pills, Staff Console)
          850: '#5E1325',         // Rich Velvet Maroon (Hero Backdrop, Hover States)
          800: '#741A30',         // Claret Burgundy (Accents, Secondary Borders)
          700: '#8E243D',         // Warm Wine
          200: '#EED2D9',
          100: '#F9EAEF',
          50: '#FDF7F9',
        },
        whatsapp: {
          DEFAULT: '#25D366',
          hover: '#1EBE5D',
          dark: '#128C7E',
        }
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Cinzel', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 10px 30px -12px rgba(52, 8, 19, 0.08), 0 4px 8px -2px rgba(24, 24, 27, 0.03)',
        'luxury-hover': '0 22px 44px -14px rgba(52, 8, 19, 0.14), 0 8px 14px -4px rgba(24, 24, 27, 0.05)',
        'editorial': '0 1px 2px rgba(52, 8, 19, 0.04), 0 12px 32px -16px rgba(52, 8, 19, 0.12)',
        'brass-glow': '0 0 24px -6px rgba(200, 164, 107, 0.35)',
      }
    },
  },
  plugins: [],
}
