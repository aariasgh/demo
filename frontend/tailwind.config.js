/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // Responsive Breakpoints (Mobile-first approach)
      screens: {
        'sm': '640px',   // Mobile large
        'md': '768px',   // Tablet
        'lg': '1024px',  // Desktop small
        'xl': '1280px',  // Desktop large
        '2xl': '1536px', // Desktop XL
      },
      // Responsive Typography Scale
      fontSize: {
        'xs': '0.75rem',    // 12px (secondary text)
        'sm': '0.8125rem',  // 13px (mobile default) — AC-12 spec compliance
        'base': '1rem',     // 16px (desktop default)
        'lg': '1.125rem',   // 18px (headings/large text)
        'xl': '1.25rem',    // 20px (modal headers)
        '2xl': '1.5rem',    // 24px (page titles)
      },
      // Custom Colors (preserve existing)
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
        danger: '#EF4444',
        warning: '#F59E0B',
      },
      // Responsive Spacing
      spacing: {
        'xs': '0.25rem',
        'sm': '0.5rem',
        'md': '1rem',
        'lg': '1.5rem',
        'xl': '2rem',
      },
    },
  },
  plugins: [],
}

