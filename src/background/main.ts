import browser, { Tabs } from 'webextension-polyfill';

browser.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

export interface Command {
  command: string,
  searchBarURL: string,
}

function search(tabs: Tabs.Tab[]) {
  browser.tabs.sendMessage(tabs[0].id!, {
    command: "search",
    searchBarURL: browser.runtime.getURL("src/search/index.html")
  } as Command);
}

browser.commands.onCommand.addListener((command) => {
  switch (command) {
    case "search": {
      // create overlay on the current webpage
      browser.tabs.query({ active: true, currentWindow: true }).then(search)
      break;
    }
    default: {
      break;
    }
  }
});

// the content script should be able to toggle search
browser.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case "search": {
      // create overlay on the current webpage
      browser.tabs.query({ active: true, currentWindow: true }).then(search)
      break;
    }
    default: {
      break;
    }
  }
});