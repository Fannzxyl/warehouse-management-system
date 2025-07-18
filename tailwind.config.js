/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './login.html',
    './dashboard.html',
    './public/**/*.html',
    './Profile.html',
    './src/**/*.{html,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'], // Changed from 'inter' to 'poppins'
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
      // You can leave this commented out if using inline styles in HTML
      // Or if you want to use it, make sure the path is correct
      // backgroundImage: {
      //   'warehouse-bg': "url('/public/images/warehouse.png')",
      // }
    },
  },
  plugins: [],
}