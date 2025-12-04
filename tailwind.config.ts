import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0066cc',
        secondary: '#00b4d8',
      },
      spacing: {
        '128': '32rem',
      },
    },
  },
  plugins: [],
}

export default config
