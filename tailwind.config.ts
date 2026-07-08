import type { Config } from 'tailwindcss';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      boxShadow: {
        glow: '0 0 0 1px rgba(59, 130, 246, 0.2), 0 15px 30px rgba(59, 130, 246, 0.12)'
      }
    },
  },
  plugins: [],
};


//export default config;
