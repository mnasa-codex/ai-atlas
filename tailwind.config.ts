import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        space: '#05060A',
        panel: '#12142B',
        gold: 'rgb(var(--atlas-gold-rgb, 167 243 208) / <alpha-value>)',
        purple: 'rgb(var(--atlas-purple-rgb, 169 154 255) / <alpha-value>)',
        cyan: '#4CC9F0',
        ink: '#F5F5F7',
        muted: 'rgb(var(--atlas-muted-rgb, 165 173 194) / <alpha-value>)'
      },
      boxShadow: {
        'gold-glow': '0 0 40px rgba(201,162,39,.18)',
        'purple-glow': '0 0 60px rgba(123,97,255,.16)'
      }
    }
  },
  plugins: []
};
export default config;
