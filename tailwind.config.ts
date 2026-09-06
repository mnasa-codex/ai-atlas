import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        space: '#05060A',
        panel: '#12142B',
        gold: '#C9A227',
        purple: '#7B61FF',
        cyan: '#4CC9F0',
        ink: '#F5F5F7',
        muted: '#9A9DB0'
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
