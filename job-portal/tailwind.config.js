/** @type {import('tailwindcss').Config} */

module.exports = {
    content: [
        "./src/**/*.{js,jsx,ts,tsx}",
    ],
    darkMode: 'class', // Enable class-based dark mode
    theme: {
        extend: {
            colors: {
                // Primary Indigo - Main brand color
                indigo: {
                    50: '#EEF2FF',
                    100: '#E0E7FF',
                    200: '#C7D2FE',
                    300: '#A5B4FC',
                    400: '#818CF8',
                    500: '#6366F1',
                    600: '#4F46E5', // Primary brand color
                    700: '#4338CA',
                    800: '#3730A3',
                    900: '#312E81',
                    950: '#1E1B4B',
                },
                // Accent Green - Success & Active states
                green: {
                    50: '#F0FDF4',
                    100: '#DCFCE7',
                    200: '#BBF7D0',
                    300: '#86EFAC',
                    400: '#4ADE80',
                    500: '#22C55E', // Accent color
                    600: '#16A34A',
                    700: '#15803D',
                    800: '#166534',
                    900: '#14532D',
                    950: '#052E16',
                },
                // Text colors
                text: {
                    light: {
                        heading: '#0F172A',
                        body: '#334155',
                        muted: '#94A3B8',
                    },
                    dark: {
                        heading: '#FFFFFF',
                        body: '#CBD5E1',
                        muted: '#94A3B8',
                    }
                },
                // Slate for backgrounds and borders
                slate: {
                    50: '#F8FAFC',
                    100: '#F1F5F9',
                    200: '#E2E8F0',
                    300: '#CBD5E1',
                    400: '#94A3B8',
                    500: '#64748B',
                    600: '#475569',
                    700: '#334155',
                    800: '#1E293B',
                    900: '#0F172A',
                    950: '#020617',
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
                brand: ['Poppins', 'Inter', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                // Desktop sizes
                'h1': ['48px', { lineHeight: '1.1', fontWeight: '700' }],
                'h2': ['36px', { lineHeight: '1.15', fontWeight: '700' }],
                'h3': ['28px', { lineHeight: '1.2', fontWeight: '600' }],
                'h4': ['22px', { lineHeight: '1.3', fontWeight: '600' }],
                'h5': ['18px', { lineHeight: '1.4', fontWeight: '600' }],
                'body-lg': ['18px', { lineHeight: '1.7', fontWeight: '400' }],
                'body': ['16px', { lineHeight: '1.6', fontWeight: '400' }],
                'body-sm': ['14px', { lineHeight: '1.5', fontWeight: '400' }],
                'caption': ['12px', { lineHeight: '1.4', fontWeight: '400' }],
                'btn-lg': ['16px', { fontWeight: '600' }],
                'btn': ['14px', { fontWeight: '600' }],
                'label': ['14px', { fontWeight: '500' }],
                'nav': ['15px', { fontWeight: '500' }],
            },
            letterSpacing: {
                'brand': '-0.02em',
            },
            screens: {
                'xs': '480px',
            }
        },
    },
    plugins: [],
}
