/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './login.html',       // Untuk login.html di root
    './dashboard.html',   // Untuk dashboard.html jika ada
    './public/**/*.html', // Jika ada file HTML lain di dalam public atau subfolder lainnya
    './src/**/*.{html,js,ts,jsx,tsx}', // Pastikan ini juga mencakup file HTML di src jika ada
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'sans-serif'],
      },
      colors: {
        'dark-blue-text': '#1A2C49',
        'light-gray-text': '#6B7280',
        'input-field-bg': '#FFFFFF',
        'input-field-border': '#D1D5DB',
        'button-dark-blue': '#1A2C49',
        'button-text-white': '#FFFFFF',
        'gray-overlay': 'rgba(0, 0, 0, 0.2)',
      },
      // Anda bisa biarkan ini dikomentari jika menggunakan style inline di HTML
      // Atau jika Anda ingin menggunakannya, pastikan path-nya benar
      // backgroundImage: {
      //   'warehouse-bg': "url('/public/images/warehouse.png')",
      // }
    },
  },
  plugins: [],
}