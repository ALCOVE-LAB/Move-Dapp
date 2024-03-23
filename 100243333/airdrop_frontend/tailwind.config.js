/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./contexts/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#4038FF",
        "primary-lighter": "#6963FF",
        secondary: "#6B7196",
        border: "#BFC6CC",
        "border-hover": "#434D56",
        "border-focus": "#1975FF",
        "border-error": "#FF4242",
        "border-disabled": "#D9DEE2",
        "text-default": "#1A2128",
        "text-placeholder": "#7B858F",
        "text-disabled": "#7B858F",
        "bg-disabled": "#D9DEE2",
        "input-bg-default": "#E6E8F0",
      },
      fontFamily: {
        Inter: ["Inter", "sans-serif"],
      },
      backgroundImage: {
        "home-left-bottom": "url('/images/home-left-bg.png')",
        "home-right-bg": "url('/images/home-circirs-bg.png')",
        "home-right": "url('/images/home-circles.svg')",
        "about-bg-1": "url('/images/about-bg-1.png')",
        "about-bg-2": "url('/images/about-bg-2.png')",
        "about-diamond-1": "url('/images/about-diamond-1.svg')",
        "about-diamond-2": "url('/images/about-diamond-2.svg')",
      },
    },
  },
  plugins: [require("@tailwindcss/forms"), require("@tailwindcss/line-clamp")],
};
