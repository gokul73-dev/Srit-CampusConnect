module.exports = {
    content: ['./index.html','./src/**/*.{js,jsx}'],
    theme: {
      extend: {
        colors: { primary: '#2563EB' },
        keyframes: {
          'slide-up': { '0%': { opacity: 0, transform: 'translateY(8px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
          'scale-in': { '0%': { opacity: 0, transform: 'scale(0.98)' }, '100%': { opacity: 1, transform: 'scale(1)' } }
        },
        animation: {
          'slide-up': 'slide-up 320ms cubic-bezier(.16,.84,.35,1) both',
          'scale-in': 'scale-in 260ms cubic-bezier(.16,.84,.35,1) both'
        },
        boxShadow: {
          'card': '0 6px 18px rgba(14,165,233,0.06)',
          'glow': '0 10px 30px rgba(59,130,246,0.12)'
        }
      }
    },
    plugins: []
  }
  