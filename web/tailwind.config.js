/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      backgroundImage: {
        "ticket-bg": "url('/images/bg3.jpg')",
      },
      colors: {
        "base-color": "#000650",
        "second-color": "#2490c2",
        "dark-blue": "#000650",
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
