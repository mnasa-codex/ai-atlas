export const $ = (selector, root = document) => root.querySelector(selector);
export const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
export const on = (element, event, handler) => element?.addEventListener(event, handler);
