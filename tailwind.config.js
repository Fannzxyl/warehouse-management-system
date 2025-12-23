/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './*.html',
    './js/**/*.js',
    './src/**/*.{html,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        inter: ['Inter', 'system-ui', 'sans-serif'],
        poppins: ['Poppins', 'sans-serif'],
      },
      colors: {
        // WISE Design System Colors
        wise: {
          'light-gray': '#FAFAFA',
          'gray': '#6B7280',
          'dark-gray': '#1F2937',
          'border': '#E5E7EB',
          'pink': '#FEE2E2',
          'brown': '#991B1B',
          'primary': '#3B82F6',
          'secondary': '#8B5CF6',
          'success': '#10B981',
          'warning': '#F59E0B',
          'error': '#EF4444',
          'info': '#06B6D4',
        },
        // Legacy colors
        'dark-blue-text': '#1A2C49',
        'light-gray-text': '#6B7280',
        'input-field-bg': '#FFFFFF',
        'input-field-border': '#D1D5DB',
        'button-dark-blue': '#1A2C49',
        'button-text-white': '#FFFFFF',
        'gray-overlay': 'rgba(0, 0, 0, 0.2)',
        // Profile page colors
        'primary-blue': '#4F46E5',
        'soft-gray': '#F8FAFC',
        'text-dark': '#1A202C',
        'text-light': '#6B7280',
        'border-light': '#E5E7EB',
        'accent-purple': '#6D28D9',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'bounce-subtle': 'bounceSubtle 0.6s ease-in-out',
        'spin-slow': 'spin 1.5s linear infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-2px)' }
        }
      },
      zIndex: {
        '25': '25',
      }
    },
  },
  plugins: [],
}