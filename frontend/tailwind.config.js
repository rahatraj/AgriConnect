import daisyui from 'daisyui'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        agriTheme: {
          primary: "#4CAF50", // Green for primary actions
          secondary: "#FFD700", // Yellow for highlights and CTAs
          accent: "#87CEEB", // Sky blue for accents
          neutral: "#333333", // Dark gray for text
          "base-100": "#F5F5F5", // Light gray for the main background
          white : "#fff",
          info: "#3ABFF8", // Optional: Informational elements
          success: "#36D399", // Optional: Success messages
          warning: "#FBBD23", // Optional: Warnings
          error: "#F87272", // Optional: Errors
        },
      },
      "light",
      "dark"
    ],
  },
}

