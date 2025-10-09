/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './entrypoints/**/*.{js,ts,jsx,tsx,html}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        cyber: {
          50: '#f0f9ff',
          100: '#e0f2fe',
          200: '#bae6fd',
          300: '#7dd3fc',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0284c7',
          700: '#0369a1',
          800: '#075985',
          900: '#0c4a6e',
        },
        pixel: {
          black: '#000000',
          white: '#ffffff',
          gray: '#808080',
          'dark-gray': '#404040',
        },
      },
      fontFamily: {
        pixel: ['"Press Start 2P"', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        pixel: '4px 4px 0px 0px rgba(0, 0, 0, 0.25)',
        'pixel-hover': '6px 6px 0px 0px rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'bounce-slow': 'bounce 3s infinite',
        'float': 'float 3s ease-in-out infinite',
        'pixel-blink': 'blink 1s step-end infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        blink: {
          '0%, 50%': { opacity: '1' },
          '51%, 100%': { opacity: '0' },
        },
      },
    },
  },
  plugins: [],
}
