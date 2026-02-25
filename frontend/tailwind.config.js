/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1360C6',
          75: 'rgba(19, 96, 198, 0.75)',
          50: 'rgba(19, 96, 198, 0.50)',
          light: '#EBF2FC',
        },
        secondary: {
          DEFAULT: '#103362',
        },
      },
    },
  },
  plugins: [require('@tailwindcss/forms')],
}
