import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        space: '#05060A',
        panel: '#12142B',
        gold: '#A7F3D0',
        purple: '#A99AFF',
        cyan: '#4CC9F0',
        ink: '#F5F5F7',
        muted: '#A5ADC2'
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
