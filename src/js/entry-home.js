import { $ } from './lib/dom.js';
import { initTheme } from './modules/theme.js';
import { initReveal } from './modules/reveal.js';
import { initSpotlight } from './modules/spotlight.js';
import { initHeroCanvas } from './modules/hero-canvas.js';
import { initScrollProgress, initToTop } from './modules/scroll-progress.js';
import { initFab } from './modules/fab.js';
import { initLangSwitch } from './modules/lang-switch.js';

initTheme($('[data-theme-toggle]'));
initLangSwitch();
initReveal();
initSpotlight();
initHeroCanvas($('[data-hero-canvas]'));
initScrollProgress($('.read-progress'));
initToTop($('.to-top'));
initFab();
