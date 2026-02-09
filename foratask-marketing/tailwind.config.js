/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eef8ff',
          100: '#d9eeff',
          200: '#bce2ff',
          300: '#8ed0ff',
          400: '#59b4ff',
          500: '#3391ff',
          600: '#1a6ff5',
          700: '#1458e1',
          800: '#1749b6',
          900: '#19408f',
        },
        accent: {
          50: '#edfcf4',
          100: '#d3f8e3',
          200: '#aaf0cc',
          300: '#73e2ae',
          400: '#3ace8c',
          500: '#16b571',
          600: '#0a925b',
          700: '#08754b',
          800: '#095c3d',
          900: '#084c34',
        },
        dark: {
          50: '#f6f7f9',
          100: '#eceef2',
          200: '#d5dae2',
          300: '#b0b9c9',
          400: '#8593ab',
          500: '#667590',
          600: '#515e77',
          700: '#434c61',
          800: '#3a4252',
          900: '#0f172a',
          950: '#0a0f1a',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Cal Sans', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
      },
    },
  },
  plugins: [],
}
