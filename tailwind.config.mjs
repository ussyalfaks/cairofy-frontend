/** @type {import('tailwindcss').Config} */
export default {
    content: [
      './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
      './src/components/**/*.{js,ts,jsx,tsx,mdx}',
      './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          primary: '#e50571',
          secondary: '#000000',
        },
        fontFamily: {
          sora: ['var(--font-sora)', 'sans-serif'],
          orbitron: ['var(--font-orbitron)', 'sans-serif'],
          loubag: ['loubag', 'sans-serif'],
          calSans: ['cal-sans', 'sans-serif'],
        },
      },
    },
    plugins: [],
  };