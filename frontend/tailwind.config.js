/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Cream / Yellow learning platform palette
                primary: {
                    DEFAULT: '#F6C547',
                    600: '#EAB308',
                    700: '#CA8A04',
                },
                secondary: {
                    DEFAULT: '#FFF6DB',
                },
                background: {
                    light: '#FAF6ED',
                    dark: '#020617',
                },
                surface: {
                    light: '#FFFFFF',
                    dark: '#0f172a',
                },
                border: {
                    light: '#EAEAEA',
                },
                text: {
                    primary: '#1A1A1A',
                    secondary: '#6B6B6B',
                },
            },
            backdropBlur: {
                xs: '2px',
            }
        },
    },
    darkMode: 'class',
    plugins: [],
}
