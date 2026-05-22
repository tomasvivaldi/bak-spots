import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#F5F0E8',
        surface: '#EDE8DC',
        foreground: '#2C2416',
        accent: '#8B6914',
        muted: '#9E9082',
        border: '#D4CEC4',
      },
    },
  },
  plugins: [],
}

export default config
