/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                keppel: {
                    50: "#effefa",
                    100: "#c7fff1",
                    200: "#90ffe2",
                    300: "#51f7d3",
                    400: "#1de4bf",
                    500: "#04c8a6",
                    600: "#00b398",
                    700: "#05806e",
                    800: "#0a6559",
                    900: "#0d544b",
                    950: "#00332f",
                },
                sunglow: {
                    50: "#fffbeb",
                    100: "#fff5c6",
                    200: "#ffe988",
                    300: "#ffd74a",
                    400: "#ffc72c",
                    500: "#f9a207",
                    600: "#dd7a02",
                    700: "#b75506",
                    800: "#94410c",
                    900: "#7a350d",
                    950: "#461b02",
                },
            },
            width: {
                22: "5.5rem",
            },
            backgroundImage: {
                "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
                "gradient-conic":
                    "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
            },
            fontFamily: {
                mono: ["var(--font-roboto-mono)", "sans-serif"],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            animation: {
                gradient: "gradient 8s linear infinite",
                "blur-in": "blur-in 1s ease-in-out",
            },
            keyframes: {
                gradient: {
                    to: {
                        backgroundPosition: "var(--bg-size, 300%) 0",
                    },
                },
                "blur-in": {
                    "0%": {
                        opacity: "0",
                        filter: "blur(10px)",
                        transform: "translateY(20px)",
                    },
                    "100%": {
                        opacity: "1",
                        filter: "blur(0px)",
                        transform: "translateY(0)",
                    },
                },
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};
