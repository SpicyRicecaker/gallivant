import browser from 'webextension-polyfill';
import type { BackgroundRequest } from '../background/main';

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
    } else if ((<any>window).gallivant === false) {
      enableSearch();
      (<any>window).gallivant = true;
      return;
    }
    (<any>window).gallivant = true;

    const iframe = document.createElement('iframe');

    iframe.setAttribute("fetchpriority", "high");
    iframe.setAttribute("src", searchBarURL);

    // slightly slow....
    iframe.style.boxShadow = "0px 5px 30px 0px rgba(0,0,0,0.5)";

    iframe.style.margin = "0";
    iframe.style.padding = "0";
    iframe.style.border = "0";
    iframe.style.borderRadius = "0.5em";
    iframe.style.background = "none"

    iframe.style.position = 'fixed'
    iframe.style.left = "10%";
    iframe.style.top = "40%";
    iframe.style.zIndex = "2147383647";
    iframe.style.colorScheme = "normal";
    iframe.style.width = "80%";
    // hardcoding solves everything 
    iframe.style.height = "68px";
    iframe.id = 'gallivant-search';

    document.body.appendChild(iframe);
  }

  /**
   * Remove every searchbar from the page.
   */
  function removeSearch() {
    document.getElementById("gallivant-search")!.style.display = "none";
  }

  function enableSearch() {
    const iframe = document.getElementById("gallivant-search")! as HTMLIFrameElement;
    iframe.style.display = "block";
    // need to focus iframe first before the content in it
    iframe.focus();
    (iframe.contentDocument?.getElementsByTagName("input")[0]! as HTMLInputElement).focus();
  }

  /**
   * Listen for messages from the background script.
   */
  browser.runtime.onMessage.addListener((message: BackgroundRequest) => {
    switch (message.variant) {
      case "toggleSearch": {
        insertSearch(message.searchBarSrc);
        break;
      }
      default: {
        break;
      }
    }
  });

})();
