import type { Config } from 'tailwindcss';
import { nextui } from '@nextui-org/react';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {},
  },
  darkMode: 'class',
  plugins: [
    nextui({
      defaultTheme: 'dark',
      themes: {
        dark: {
          colors: {
            background: '#0a0a0a',
            foreground: '#fafafa',
            content1: '#18181b',
            content2: '#27272a',
            content3: '#3f3f46',
            content4: '#52525b',
            divider: '#27272a',
            primary: {
              50: '#e6f1fe',
              100: '#cce3fd',
              200: '#99c7fb',
              300: '#66aaf9',
              400: '#338ef7',
              500: '#006FEE',
              600: '#005bc4',
              700: '#004493',
              800: '#002e62',
              900: '#001731',
              DEFAULT: '#006FEE',
              foreground: '#ffffff',
            },
            success: {
              DEFAULT: '#22c55e',
              foreground: '#ffffff',
            },
            warning: {
              DEFAULT: '#f59e0b',
              foreground: '#000000',
            },
            danger: {
              DEFAULT: '#ef4444',
              foreground: '#ffffff',
            },
            focus: '#006FEE',
          },
        },
      },
    }),
  ],
};

export default config;
