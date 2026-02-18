// tailwind.config.js
module.exports = {
  darkMode: 'class', // o 'media'
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#136dec",
        "background-light": "#f6f7f8",
        "background-dark": "#101822",
        "card-dark": "#1c2632",
        "border-dark": "#2d3a4b",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    // require('@tailwindcss/container-queries'), // Opcional si lo usas
  ],
}