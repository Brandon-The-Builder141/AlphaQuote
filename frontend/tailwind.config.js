/** @type {import('tailwindcss').Config} */
// Pass Eight — IRON design system.
// The app was built on Tailwind's slate/gray scales with a teal `primary`.
// Those scales are remapped here to the forged-iron palette so every
// existing utility class renders in the new system: slate/gray carry the
// blackened-steel neutrals, `primary` is ember, `accent` is amber, and the
// legacy `neon-blue` alias points at ember. Blue/purple are muted to
// steel tones so stray info/icon colors stay coherent on black steel.
const ironNeutrals = {
  50: '#FAF8F4',
  100: '#F2EFE9',
  200: '#E4E1D9',
  300: '#C9CDD2',
  400: '#9BA0A6',
  500: '#6F747C',
  600: '#3A3D44',
  700: '#26282E',
  800: '#1B1D22',
  850: '#17181D',
  900: '#141519',
  950: '#0B0C0E'
};

const ember = {
  50: '#FFF3EC',
  100: '#FFE4D3',
  200: '#FFC9A6',
  300: '#FFA26E',
  400: '#FF7A36',
  500: '#FF5C1A',
  600: '#F04A0C',
  700: '#C23A08',
  800: '#9A2F07',
  900: '#7A2708',
  DEFAULT: '#FF5C1A'
};

module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: ironNeutrals,
        gray: ironNeutrals,
        primary: ember,
        // Legacy alias used across older components (EstimateForm,
        // Receipts) — now ember, not cyan.
        'neon-blue': '#FF5C1A',
        accent: {
          100: '#FFEDD5',
          200: '#FFE0B0',
          300: '#FFC46B',
          400: '#FFB04A',
          500: '#FF9E2C',
          600: '#F08C0A',
          700: '#C56F06',
          DEFAULT: '#FF9E2C'
        },
        orange: ember,
        amber: {
          300: '#FFD08A',
          400: '#FFB04A',
          500: '#FF9E2C',
          600: '#E8890B',
          700: '#B96E08',
          DEFAULT: '#FF9E2C'
        },
        yellow: {
          300: '#FFD08A',
          400: '#FFB04A',
          500: '#FF9E2C',
          600: '#E8890B',
          700: '#B96E08'
        },
        green: {
          300: '#8FDCA9',
          400: '#57C983',
          500: '#3FB96C',
          600: '#2F9A57',
          700: '#277E48',
          DEFAULT: '#3FB96C'
        },
        red: {
          300: '#F3A3A6',
          400: '#EC6A6E',
          500: '#E5484D',
          600: '#D13438',
          700: '#AC272B',
          DEFAULT: '#E5484D'
        },
        // Muted steel-blue for informational accents.
        blue: {
          100: '#E1E9EE',
          200: '#C3D3DD',
          300: '#9FB6C6',
          400: '#7E97A8',
          500: '#5F7E93',
          600: '#4A6579',
          700: '#3B5263',
          800: '#2C404E',
          900: '#22323D',
          950: '#17242C'
        },
        // Muted plum-steel for secondary accents.
        purple: {
          300: '#C4B3CC',
          400: '#A78FB3',
          500: '#8A6E99',
          600: '#6E557C',
          700: '#584364',
          800: '#44334E',
          900: '#342739',
          950: '#241A29'
        }
      },
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        body: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Barlow Condensed"', 'Inter', 'ui-sans-serif', 'sans-serif'],
        heading: ['"Barlow Condensed"', 'Inter', 'ui-sans-serif', 'sans-serif']
      },
      backgroundImage: {
        'ember-gradient': 'linear-gradient(135deg, #FF5C1A, #FF9E2C)'
      },
      boxShadow: {
        'ember-glow': '0 8px 30px rgba(255, 92, 26, 0.35)',
        'ember-glow-sm': '0 4px 16px rgba(255, 92, 26, 0.30)'
      }
    },
  },
  plugins: [],
}
