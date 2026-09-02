export const isRTL = () => document.documentElement.dir === 'rtl';
export const dirSign = () => (isRTL() ? -1 : 1);
