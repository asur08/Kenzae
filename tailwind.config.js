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
          DEFAULT: '#FAF8F5',     // Warm Alabaster Linen
          surface: '#FFFFFF',     // Pure White Surface
          subtle: '#F4F0E8',      // Raised Warm Surface
          border: '#E4DDD2',      // Architectural Hairline
        },
        obsidian: {
          DEFAULT: '#18181B',     // Primary Ink (AA+ > 15:1 on canvas)
          slate: '#4A4640',       // Secondary Ink (AA+ > 8:1 on canvas)
          muted: '#615B52',       // Muted Ink & Icons (AA+ > 5.7:1 on canvas)
        },
        brass: {
          DEFAULT: '#C8A46B',     // Warm Antique Champagne Brass
          dark: '#7A5B28',        // AA+ Accessible Brass Ink (> 5.2:1 on white)
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
        'luxury': '0 1px 2px rgba(24, 24, 27, 0.05)',
        'luxury-hover': '0 4px 12px rgba(24, 24, 27, 0.06)',
        'editorial': '0 8px 24px rgba(24, 24, 27, 0.06)',
      }
    },
  },
  plugins: [],
}
