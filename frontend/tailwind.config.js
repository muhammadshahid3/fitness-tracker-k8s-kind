/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        base: {
          light: '#F6F7F5',
          dark: '#0A0F0D',
        },
        surface: {
          light: '#FFFFFF',
          dark: '#121917',
          hoverLight: '#EFF1EE',
          hoverDark: '#1A2320',
        },
        border: {
          light: '#E2E5DF',
          dark: '#222C28',
        },
        ink: {
          light: '#101512',
          dark: '#E7ECE8',
          mutedLight: '#5B655E',
          mutedDark: '#8A968E',
        },
        lime: {
          DEFAULT: '#B9FF4B',
          dim: '#8FCC3A',
        },
        cobalt: {
          DEFAULT: '#4C7EFF',
          dim: '#3A5FC4',
        },
        coral: {
          DEFAULT: '#FF6B5B',
          dim: '#D9564A',
        },
        amber: {
          DEFAULT: '#FFB74C',
        },
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'monospace'],
      },
      borderRadius: {
        xl: '1rem',
        '2xl': '1.25rem',
      },
      boxShadow: {
        card: '0 1px 2px rgba(0,0,0,0.04), 0 8px 24px -12px rgba(0,0,0,0.12)',
      },
    },
  },
  plugins: [],
}

