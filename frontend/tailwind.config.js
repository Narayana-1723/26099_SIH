/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gov: {
          navy: {
            DEFAULT: '#0f2942',
            50: '#f0f5fa',
            100: '#dbe8f4',
            200: '#bcd4ea',
            300: '#8db7dc',
            400: '#5693cb',
            500: '#3475b8',
            600: '#235c9b',
            700: '#1d4a7e',
            800: '#1b3f69',
            900: '#0f2942',
            950: '#0a1a2b',
          },
          gold: {
            DEFAULT: '#d97706',
            light: '#fef3c7',
            border: '#fde68a',
            dark: '#b45309',
          },
          emerald: {
            DEFAULT: '#047857',
            light: '#d1fae5',
            border: '#a7f3d0',
            dark: '#065f46',
          },
          crimson: {
            DEFAULT: '#b91c1c',
            light: '#fee2e2',
            border: '#fecaca',
            dark: '#991b1b',
          },
          slate: {
            50: '#f8fafc',
            100: '#f1f5f9',
            200: '#e2e8f0',
            300: '#cbd5e1',
            400: '#94a3b8',
            500: '#64748b',
            600: '#475569',
            700: '#334155',
            800: '#1e293b',
            900: '#0f172a',
          }
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        'gov': '0 1px 3px 0 rgba(15, 41, 66, 0.08), 0 1px 2px 0 rgba(15, 41, 66, 0.04)',
        'gov-md': '0 4px 6px -1px rgba(15, 41, 66, 0.1), 0 2px 4px -1px rgba(15, 41, 66, 0.06)',
        'gov-lg': '0 10px 15px -3px rgba(15, 41, 66, 0.1), 0 4px 6px -2px rgba(15, 41, 66, 0.05)',
      }
    },
  },
  plugins: [],
}
