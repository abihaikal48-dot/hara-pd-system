/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          red: '#C0392B',
          'red-dark': '#8E2A1F',
          yellow: '#F4B400',
          ink: '#1E1E1E',
          bg: '#F6F5F3',
          card: '#FFFFFF',
          border: '#E7E3DE',
          muted: '#8A8580'
        },
        dark: {
          bg: '#181614',
          card: '#221F1C',
          border: '#332F2B',
          ink: '#F1EDE9',
          muted: '#A79E96'
        }
      },
      borderRadius: {
        'radius': '14px',
        'radius-lg': '20px',
      },
    },
  },
  plugins: [],
}
