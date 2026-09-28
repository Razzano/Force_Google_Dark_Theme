// ==UserScript==
// @name         Force Google Dark Theme
// @namespace    http://tampermonkey.net/
// @version      1.1
// @description  Force Google Homepage / Search Settings → Dark theme → On
// @author       Sonny Razzano a.k.a. srazzano
// @license      MIT
// @icon         https://raw.githubusercontent.com/Razzano/Images/master/googleicon64.png
// @match        *://www.google.com/*
// @match        *://www.google.ad/*
// @match        *://www.google.ae/*
// @match        *://*.google.*/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {

  'use strict';

  // Enable forcing of Google Dark Theme On ==============================================
  const enableGoogleDarkTheme = true; // 1 OR true, 0 OR false
  // =====================================================================================

  const LOG = '🌙 [Force Dark Theme]';
  const MAX_ATTEMPTS = 40;
  const INTERVAL_MS = 200;

  if (enableGoogleDarkTheme) {
    (function forceGoogleDarkTheme() {

      function isAlreadyDark() {
        const html = document.documentElement;
        return (
          html.hasAttribute('dark') ||
          html.getAttribute('data-darkreader-scheme') === 'dark' ||
          (document.body && getComputedStyle(document.body).backgroundColor === 'rgb(32, 33, 36)')
        );
      }

      function tryForceDark() {
        if (isAlreadyDark()) return true;
        let el = document.querySelector('#YUIDDb [jsaction*="ok5gFc"]')
          || document.querySelector('#YUIDDb [role="link"]')
          || document.querySelector('#YUIDDb');
        if (el && /dark theme:\s*off/i.test(el.textContent || el.closest('#YUIDDb')?.textContent || '')) {
          forceClick(el); //el.click();
          return true;
        }
        el = [...document.querySelectorAll('[jsaction*="ok5gFc"], [role="menuitem"], [role="link"]')]
          .find(e => /dark theme:\s*off/i.test(e.textContent));
        if (el) {
          forceClick(el); //el.click();
          return true;
        }
        return false;
      }

      function forceClick(el) {
        el.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
        el.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      }

      let attempts = 0;
      const timer = setInterval(() => {
        attempts++;
        if (tryForceDark() || attempts >= MAX_ATTEMPTS) {
          clearInterval(timer);
        }
      }, INTERVAL_MS);

      const observer = new MutationObserver(() => {
        if (tryForceDark()) {
          observer.disconnect();
          clearInterval(timer);
        }
      });

      observer.observe(document.documentElement, { childList: true, subtree: true });
    })();
  }

})();
