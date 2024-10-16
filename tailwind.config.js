/** @type {import('tailwindcss').Config} */
const rootProjectPath = process.env.DJANGO_ROOT_PROJECT_PATH;

project_content_pattern = []
if (rootProjectPath) {
    console.log("render project root path:", rootProjectPath)
    project_content_pattern = [
        ...project_content_pattern,
        rootProjectPath + '/**/templates/**/*.html',   // Using environment variable
        rootProjectPath + '/**/static/**/*.js',        // Using environment variable
        rootProjectPath + '/templates/*.py',
        rootProjectPath + '/static/**/*.js',
        rootProjectPath + '/**/*.py',
    ]
}

module.exports = {
    content: [
        './django_daisy/templates/**/*.html',   // Scan HTML templates for Tailwind classes
        './django_daisy/static/**/*.js',        // Include all JavaScript files in static directory
        './django_daisy/static/admin/css/styles.css',  // Admin-specific CSS
        './django_daisy/**/*.py',              // Include Python files for possible Jinja-style Tailwind classes
        './django_daisy/static/**/*.jsx',       // Include JSX files
        ...project_content_pattern,
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
        darkTheme: "dark", // name of one of the included themes for dark mode
        base: true, // applies background color and foreground color for root element by default
        styled: true, // include daisyUI colors and design decisions for all components
        utils: true, // adds responsive and modifier utility classes
    },
    safelist: [
        "flex",
        // List all potential classes that you expect to be dynamically generated
    ],

    plugins: [
        require('daisyui'),  // DaisyUI for additional UI components
    ],
}
