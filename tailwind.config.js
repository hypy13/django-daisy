/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './templates/**/*.html',   // Scan HTML templates for Tailwind classes
        './static/**/*.js',        // Include all JavaScript files in static directory
        './static/admin/css/styles.css',  // Admin-specific CSS
        '../**/*.py',              // Include Python files for possible Jinja-style Tailwind classes
        './static/**/*.jsx',       // Include JSX files
    ],

    theme: {
        extend: {
            fontFamily: {
                vazir: ['Vazir', 'sans-serif'],   // Define the Vazir font
                roboto: ['Cantarell', 'sans-serif'], // Define the Roboto font
            },
            animation: {
                'bounce-once': 'bounce 1s ease-in-out 1',
            },
        },
    },

    daisyui: {
        themes: [
            "light",
            "dark",
            "dracula",
            "dim",
            "autumn",
            "lemonade",
        ],  // Include themes from DaisyUI
    },

    plugins: [
        require('daisyui'),  // DaisyUI for additional UI components
    ],
}
