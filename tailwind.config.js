/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // Premium off-black (neutral charcoal) — never pure black
        midnight: {
          950: '#0a0a0c',
          900: '#101013',
          800: '#17171c',
          700: '#202027',
          600: '#2c2c35',
        },
        // Monochrome "metal" accents — platinum / silver / white
        accent: {
          violet: '#e7e7ec',
          purple: '#bfbfc8',
          cyan: '#fbfbfd',
          pink: '#9a9aa4',
        },
        crown: {
          light: '#f4f4f6',
          silver: '#c9c9d1',
          steel: '#8c8c97',
        },
        // Semantic brand (prefer over legacy accent-* class names)
        brand: {
          DEFAULT: 'rgb(231 231 236 / <alpha-value>)',
          muted: 'rgb(154 154 164 / <alpha-value>)',
          dim: 'rgb(191 191 200 / <alpha-value>)',
          bright: 'rgb(251 251 253 / <alpha-value>)',
        },
        status: {
          success: 'rgb(110 231 183 / <alpha-value>)',
          warning: 'rgb(251 191 36 / <alpha-value>)',
          error: 'rgb(248 113 113 / <alpha-value>)',
        },
        ink: {
          DEFAULT: 'rgb(255 255 255 / <alpha-value>)',
          muted: 'rgb(255 255 255 / 0.65)',
          subtle: 'rgb(255 255 255 / 0.52)',
          faint: 'rgb(255 255 255 / 0.38)',
        },
        neon: {
          cyan: '#00e8ff',
          magenta: '#ff2bd6',
          violet: '#a855f7',
          blue: '#3b82f6',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'sans-serif'],
        royal: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-glow':
          'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,255,255,0.14), transparent)',
        'card-shine':
          'linear-gradient(135deg, rgba(255,255,255,0.10) 0%, transparent 50%, rgba(255,255,255,0.03) 100%)',
      },
      boxShadow: {
        glow: '0 0 40px rgba(255, 255, 255, 0.12)',
        'glow-cyan': '0 0 30px rgba(255, 255, 255, 0.10)',
        'neon-cyan': '0 0 20px rgba(0, 232, 255, 0.45), 0 0 40px rgba(0, 232, 255, 0.15)',
        'neon-cyan-lg': '0 0 28px rgba(0, 232, 255, 0.55), 0 0 56px rgba(0, 232, 255, 0.2)',
        'neon-magenta': '0 0 20px rgba(255, 43, 214, 0.45), 0 0 40px rgba(255, 43, 214, 0.15)',
        'neon-violet': '0 0 24px rgba(168, 85, 247, 0.4)',
        glass: '0 8px 32px rgba(0, 0, 0, 0.5)',
      },
      animation: {
        float: 'float 6s ease-in-out infinite',
        'pulse-glow': 'pulse-glow 3s ease-in-out infinite',
        shimmer: 'shimmer 2.5s linear infinite',
        'neon-pulse': 'neon-pulse 2.5s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-12px)' },
        },
        'pulse-glow': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '0.8' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'neon-pulse': {
          '0%, 100%': {
            boxShadow:
              '0 0 16px rgba(0, 232, 255, 0.35), 0 0 32px rgba(255, 43, 214, 0.12)',
          },
          '50%': {
            boxShadow:
              '0 0 24px rgba(0, 232, 255, 0.55), 0 0 48px rgba(255, 43, 214, 0.22)',
          },
        },
      },
    },
  },
  plugins: [],
}
