/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0F172A",
        secondary: "#0b87b9", // Updated Brand Blue
        accent: "#F59E0B",
        // Override default blue to match the requested brand color (#0b87b9)
        blue: {
          50: '#f0f9fd',
          100: '#e0f4fa',
          200: '#bae7f6',
          300: '#7dd5ef',
          400: '#38bdf8',
          500: '#0ea5e9',
          600: '#0b87b9', // Main Target Color
          700: '#096b93', // Darker Hover
          800: '#075985',
          900: '#0c4a6e',
          950: '#082f49',
        },
      },
    },
    animation: {
      fadeIn: 'fadeIn 0.3s ease-in-out',
      slideRight: 'slideRight 0.3s ease-out forwards',
    },
    keyframes: {
      fadeIn: {
        '0%': { opacity: '0' },
        '100%': { opacity: '1' },
      },
      slideRight: {
        '0%': { transform: 'translateX(-100%)' },
        '100%': { transform: 'translateX(0)' },
      },
    },
  },
  plugins: [],
}
