/** Load BEFORE https://cdn.tailwindcss.com on marketing pages */
tailwind.config = {
  theme: {
    extend: {
      colors: {
        burgundy: {
          50: '#fdf2f4',
          100: '#fbe5e9',
          700: '#722F37',
          800: '#5a242a',
          900: '#4A1521',
        },
        gold: {
          DEFAULT: '#D4AF37',
          hover: '#f0c842',
        },
        liturgicalGold: '#D4AF37',
      },
    },
  },
}
