import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
        "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
                ryyt: {
                    DEFAULT: '#0052FF',
                    500: '#0052FF',
                    600: '#0040DD',
                    glow: '#0052FF'
                },
                marketing: { bg: '#0A0A0A', card: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.05)' }
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
            },
            animation: {
                spotlight: "spotlight 2s ease .75s 1 forwards",
            },
            keyframes: {
                spotlight: {
                    "0%": {
                        opacity: "0",
                        transform: "translate(-50%, -150%) scale(0.5)",
                    },
                    "100%": {
                        opacity: "1",
                        transform: "translate(-50%, -100%) scale(1)",
                    },
                },
            },
        },
    },
    plugins: [],
};
export default config;
