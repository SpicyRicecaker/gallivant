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
  query: string
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

// eventually replace with localstore
const urls = [
  {
    base: 'https://www.oxfordlearnersdictionaries.com/us/definition/english/',
    replaceSpaceWith: '-',
  },
  {
    base: 'https://www.google.com/search?q=',
    replaceSpaceWith: '+',
  },
  {
    base: 'https://www.google.com/search?tbm=isch&q=',
    replaceSpaceWith: '+',
  },
  {
    base: 'https://www.merriam-webster.com/dictionary/',
    replaceSpaceWith: ' ',
  },
];

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
    case "lookup": {
      const lookup: boolean[] = new Array(urls.length);
      for (let i = 0; i < lookup.length; i++) {
        lookup[i] = true;
      }

      const tabs = await browser.tabs.query({});
      for (const tab of tabs) {
        // if we've already updated for the url, skip
        const urlIdx = urls.findIndex((url, urlIndex) => lookup[urlIndex] && tab.url!.includes(url.base));
        if (urlIdx !== -1) {
          // do not create another tab, 
          lookup[urlIdx] = false;
          // simply update the tab with new url
          await browser.tabs.update(tab.id!, { url: `${urls[urlIdx].base}${message.query!.replaceAll(' ', urls[urlIdx].replaceSpaceWith)}` })
        }
      }

      // create leftovers
      for (let i = 0; i < lookup.length; i++) {
        if (lookup[i]) {
          await browser.tabs.create({ url: `${urls[i].base}${message.query!.replaceAll(' ', urls[i].replaceSpaceWith)}` })
        }
      }
      break;
    }
    default: {
      break;
    }
  }
});