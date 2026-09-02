import { $ } from './lib/dom.js';
import { initTheme } from './modules/theme.js';
import { initReveal } from './modules/reveal.js';
import { initWebglStage } from './modules/webgl-stage.js';
import { initTilt } from './modules/tilt.js';
import { initScrollProgress, initToTop } from './modules/scroll-progress.js';
import { initFab } from './modules/fab.js';
import { initLangSwitch } from './modules/lang-switch.js';
initTheme($('[data-theme-toggle]'));initLangSwitch();initReveal();initWebglStage($('[data-orb]'));initTilt();initScrollProgress($('.read-progress'));initToTop($('.to-top'));initFab();