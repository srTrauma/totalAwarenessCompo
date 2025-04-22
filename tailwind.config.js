/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx}", // Ajusta esta ruta según la estructura de tu proyecto
    "./components/**/*.{js,ts,jsx,tsx}", // Incluye tus componentes
    "./pages/**/*.{js,ts,jsx,tsx}", // Incluye tus páginas
    "./app/**/*.{js,ts,jsx,tsx}", // Incluye tus archivos en la carpeta app
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}