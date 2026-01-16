import type { Config } from 'tailwindcss'

const config: Config = {
    content: [
        './app/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            fontFamily: {
                outfit: ['var(--font-outfit)', 'sans-serif'],
            },
            colors: {
                navy: {
                    900: '#0B1B32', // Color principal del logo
                    800: '#152C4E', // Un poco más claro para componentes
                    700: '#234270', // Bordes y hovers
                },
                white: '#FFFFFF',
                platinum: '#E5E7EB', // Texto secundario
            },
        },
    },
    plugins: [],
}
export default config

