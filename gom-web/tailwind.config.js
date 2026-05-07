/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ivory: '#F7F2E8',
        porcelain: '#FFFFFF',
        navy: {
          DEFAULT: '#0F265C',
          dark: '#0A1A42',
          light: '#142C6E',
        },
        // Ceramic blue accent - replacing gold
        ceramic: {
          DEFAULT: '#C9D8E6',
          soft: '#DCE7F0',
          hover: '#9FB7C9',
          border: '#B8CAD8',
          dark: '#7A95AD',
        },
        clay: '#8B3A3A',
        muted: '#6F6A64',
        stroke: '#E6DED1',
        surface: '#FFFFFF',
        'surface-alt': '#F0EFE9',
        success: '#43A047',
        danger: '#E53935',
        warning: '#F59E0B',
        info: '#3B82F6',
        // Dark mode tokens
        'dark-bg': '#0A0F1F',
        'dark-surface': '#111827',
        'dark-surface-alt': '#1F2937',
        'dark-stroke': '#1F2937',
        'dark-text': '#F3F4F6',
        'dark-text-muted': '#9CA3AF',
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'serif'],
        body: ['"Be Vietnam Pro"', 'sans-serif'],
      },
      borderRadius: {
        sm: '12px',
        md: '20px',
        lg: '24px',
        xl: '32px',
        '2xl': '40px',
      },
      boxShadow: {
        sm: '0 2px 8px rgba(0, 0, 0, 0.04)',
        md: '0 8px 24px rgba(0, 0, 0, 0.08)',
        lg: '0 16px 48px rgba(0, 0, 0, 0.12)',
        xl: '0 30px 80px rgba(0, 0, 0, 0.06)',
        glow: '0 0 40px rgba(201, 216, 230, 0.3)',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(15px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        spin: {
          '0%': { transform: 'rotate(0deg)' },
          '100%': { transform: 'rotate(360deg)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        'slide-down': 'slideDown 0.4s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-out forwards',
        shimmer: 'shimmer 2s linear infinite',
        spin: 'spin 1s linear infinite',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      backgroundImage: {
        'gradient-ceramic': 'linear-gradient(135deg, #C9D8E6 0%, #DCE7F0 100%)',
        'gradient-navy': 'linear-gradient(135deg, #0F265C 0%, #142C6E 100%)',
        'shimmer-ceramic': 'linear-gradient(90deg, transparent, rgba(201,216,230,0.3), transparent)',
      },
      lineHeight: {
        // Display headings (hero, large titles) - Vietnamese-friendly with extra space
        display: '1.32',              // Hero headings - enough space for diacritics
        'display-relaxed': '1.38',    // Extra relaxed for very large text
        'display-tight': '1.28',      // Tighter but still safe
        // Section headings
        heading: '1.28',              // Section titles
        'heading-tight': '1.22',      // Compact headings
        // Card titles
        card: '1.35',                 // Card headings
        'card-tight': '1.3',          // Compact card headings
        // Body text
        body: '1.7',                  // Body text
        paragraph: '1.75',            // Paragraphs
        'paragraph-relaxed': '1.8',   // Long-form content
        // UI elements
        button: '1.35',               // Buttons
        form: '1.5',                  // Form inputs
        label: '1.4',                 // Labels
        eyebrow: '1.4',               // Uppercase labels
      },
      maxWidth: {
        '8xl': '88rem',
        content: '1280px',
      },
    },
  },
  plugins: [],
};
