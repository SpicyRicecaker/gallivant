import browser, { Tabs } from 'webextension-polyfill';

browser.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

export interface Command {
  command: string,
  searchBarURL: string,
}

export interface Message {
  type: string,
  urls?: string[]
}

function search(tab: Tabs.Tab) {
  browser.tabs.sendMessage(tab.id!, {
    command: "search",
    searchBarURL: browser.runtime.getURL("src/search/index.html")
  } as Command);
}

browser.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case "search": {
      // create overlay on the current webpage
      const currentTab = (await browser.tabs.query({ active: true, currentWindow: true }))[0];
      search(currentTab);
      break;
    }
    default: {
      break;
    }
  }
});

// the content script should be able to toggle search
browser.runtime.onMessage.addListener(async (message: Message) => {
  switch (message.type) {
    case "search": {
      // create overlay on the current webpage
      const currentTab = (await browser.tabs.query({ active: true, currentWindow: true }))[0];
      search(currentTab);
      break;
    }
    // opens url in new tab
    case "open": {
      for (const url of message.urls!) {
        await browser.tabs.create({ url });
      }
      break;
    }
    default: {
      break;
    }
  }
});