import browser from 'webextension-polyfill';
import type { Command } from '../background/main';

(() => {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if ((<any>window).hasRun) {
    return;
  }
  (<any>window).hasRun = true;

  function insertSearch(searchBarURL: string) {
    if ((<any>window).gallivant === true) {
      removeSearch();
      (<any>window).gallivant = false;
      return;
    }
    (<any>window).gallivant = true;

    const iframe = document.createElement('iframe');
    iframe.setAttribute("src", searchBarURL);
    iframe.style.margin = "0";
    iframe.style.padding = "0";
    iframe.style.border = "0";

    iframe.style.position = 'fixed';
    iframe.style.left = "10%";
    iframe.style.top = "40%";
    iframe.style.zIndex = "999";

    iframe.style.width = "80%";
    iframe.style.overflow = "hidden"
    iframe.className = 'gallivant-search'

    document.body.appendChild(iframe);
  }

  /**
   * Remove every beast from the page.
   */
  function removeSearch() {
    let existingSearch = document.querySelectorAll(".gallivant-search");
    for (const search of existingSearch) {
      search.remove();
    }
  }

  /**
   * Listen for messages from the background script.
   * Call "insertBeast()" or "removeExistingBeasts()".
   */
  browser.runtime.onMessage.addListener((message: Command) => {
    switch (message.command) {
      case "search": {
        insertSearch(message.searchBarURL);
        break;
      }
      default: {
        break;
      }
    }
  });

})();
