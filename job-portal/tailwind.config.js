/** @type {import('tailwindcss').Config} */

module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                primary: {
                    light: '#3b82f6', // Bright Blue
                    DEFAULT: '#0f172a', // Royal/Navy Blue
                    dark: '#020617', // Very Dark Blue
                },
                secondary: '#64748b', // Slate Gray
                accent: '#f59e0b', // Amber
            },
            fontFamily: {
                sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
