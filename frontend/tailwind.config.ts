import type { Config } from 'tailwindcss'

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        duck: {
          yellow: '#F5C542',
          dark:   '#0F1117',
          card:   '#1A1D2E',
          border: '#2A2D3E',
        },
      },
    },
  },
} satisfies Config
