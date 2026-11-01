/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#000650",
          deep: "#00032E",
          panel: "#070E63",
          lift: "#101A7A",
        },
        sky: {
          DEFAULT: "#6FCBFF",
          soft: "#BDE6FF",
        },
        ink: "#05072A",
        go: "#3EE8B0",
        stop: "#FF6B85",
      },
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        sans: ["var(--font-body)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
    },
    screens: {
      mobile: "320px",
      xmobile: "350px",
      "2xmobile": "520px",
      md: "640px",
      "2md": "820px",
      slg: "950px",
      lg: "1024px",
      xl: "1280px",
    },
  },
  plugins: [],
};
