/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        captain: {
          navy: '#0A1628',
          blue: '#1E3A5F',
          cyan: '#00D4E8',
          gold: '#F5C518',
          red: '#E63946',
          light: '#A8D8EA',
          white: '#F0F8FF',
        },
        /* keep ramen aliases so Admin dashboard still compiles */
        ramen: {
          red: '#E63946',
          dark: '#0A1628',
          charcoal: '#111113',
          cream: '#F0F8FF',
          beige: '#A8D8EA',
          gold: '#F5C518',
          sesame: '#1E3A5F',
          seaweed: '#1F2937',
          kimchi: '#C1121F'
        }
      },
      fontFamily: {
        'outfit': ['Outfit', 'system-ui', 'sans-serif'],
        'inter': ['Inter', 'system-ui', 'sans-serif'],
        'pretendard': ['Outfit', 'system-ui', 'sans-serif'],
        'noto-kr': ['Outfit', 'serif'],
        'noto': ['Outfit', 'serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'bounce-gentle': 'bounceGentle 0.6s ease-out',
        'scale-in': 'scaleIn 0.3s ease-out',
        'wave': 'wave 6s ease-in-out infinite',
        'float': 'float 4s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        bounceGentle: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-4px)' },
          '60%': { transform: 'translateY(-2px)' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        wave: {
          '0%, 100%': { transform: 'translateX(0)' },
          '50%': { transform: 'translateX(-40px)' }
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' }
        }
      }
    },
  },
  plugins: [],
};