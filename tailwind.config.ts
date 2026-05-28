import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(59, 130, 246, 0.2), 0 15px 30px rgba(59, 130, 246, 0.12)'
      }
    }
  },
  plugins: []
};

export default config;
