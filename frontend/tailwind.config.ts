import type { Config } from 'tailwindcss';

/**
 * Aurelia design system.
 * Palette: ivory / cream / champagne / warm beige / deep brown / soft black,
 * with gold used sparingly as an accent.
 */
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ivory: '#FBF9F4',
        cream: '#F4EEE2',
        champagne: '#E7D8BE',
        beige: '#D9C7A3',
        sand: '#CBB893',
        gold: {
          DEFAULT: '#B08D57', // muted, tasteful gold accent
          soft: '#C9A961',
          deep: '#8A6D3B',
        },
        cocoa: '#3A2E23', // deep brown
        espresso: '#241B13',
        ink: '#1C1917', // soft black
        clay: '#6B5C4A', // muted brown text
      },
      fontFamily: {
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        luxe: '0.18em',
      },
      boxShadow: {
        soft: '0 10px 40px -18px rgba(58, 46, 35, 0.28)',
        card: '0 8px 30px -20px rgba(58, 46, 35, 0.35)',
      },
      maxWidth: {
        content: '1280px',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        'fade-in': 'fade-in 0.5s ease-out both',
      },
    },
  },
  plugins: [],
};

export default config;
