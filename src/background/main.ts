import { produce } from 'solid-js/store';
import browser from 'webextension-polyfill';
import { SearchSchema, searchSchemas, setSearchSchemas } from './store';

browser.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

export type BackgroundRequest = {
  variant: "toggleSearch",
  searchBarSrc: string
}
export type ContentScriptRequest = {
  variant: "getSearchSchemaNames",
} | {
  variant: "toggleSearch"
} | {
  variant: "lookupTerm",
  query: string
} | {
  variant: "setActive",
  idx: number
} | {
  variant: "getSearchSchemas",
} | {
  variant: "setSearchSchemas",
  searchSchemas: SearchSchema[]
};

const searchBarSrc = browser.runtime.getURL("src/search/index.html");

browser.commands.onCommand.addListener(async (command) => {
  switch (command) {
    case "search": {
      // create overlay on the current webpage
      const currentTab = (await browser.tabs.query({ active: true, currentWindow: true }))[0];
      browser.tabs.sendMessage(currentTab.id!, {
        variant: "toggleSearch",
        searchBarSrc
      } as BackgroundRequest);
      break;
    }
    default: {
      break;
    }
  }
});

// Create set of urls => tab ids, which will keep track of which urls have binded tabs. This is usefull, because most times when a user searches, they don't want to keep creating more and more tabs but just reload the existing ones.
// Small concern that if the user creates like a million urls without any actual urls, there will be a bunch of garbage ids in here. But this isn't that big of a concern since this cache basically gets reset upon the browser restarting.
const urlToId: Map<string, number> = new Map();

// the content script should be able to toggle search
browser.runtime.onMessage.addListener(async (message: ContentScriptRequest) => {
  switch (message.variant) {
    case "toggleSearch": {
      // create overlay on the current webpage
      const currentTab = (await browser.tabs.query({ active: true, currentWindow: true }))[0];
      browser.tabs.sendMessage(currentTab.id!, {
        variant: "toggleSearch",
      } as BackgroundRequest);
      break;
    }
    // opens url in new tab
    case "lookupTerm": {
      // get selected search schema
      const selectedSchema = searchSchemas.find((s) => s.active)!;
      const urls = selectedSchema.urls;

      // iterate over all urls
      for (let i = 0; i < urls.length; i++) {
        const tabInfo = {
          url: `${urls[i].base}${urls[i].before.replaceAll(' ', urls[i].replaceSpaceWith)}${message.query!.replaceAll(' ', urls[i].replaceSpaceWith)}${urls[i].after.replaceAll(' ', urls[i].replaceSpaceWith)}`, active: urls[i].active
        }

        // attempt to update existing tabs
        // KEY: we concatenate the name of the schema here so that identical links will belong to different schemas
        const tabId = urlToId.get(`${selectedSchema.name}${urls[i].base}`);
        if (tabId) {
          try {
            const tab = await browser.tabs.get(tabId);
            // if tab exists, simply update it with the new query
            await browser.tabs.update(tab.id!, tabInfo);
            continue;
          } catch (e) {
            // tab has been removed or whatever, this is fine and expected behavior
          }
        }

        // otherwise, create new tab and insert the thing into the map
        const newTabId = (await browser.tabs.create(tabInfo)).id!;
        urlToId.set(`${selectedSchema.name}${urls[i].base}`, newTabId);
      }
      break;
    }
    case "getSearchSchemas": {
      return Promise.resolve({ response: JSON.stringify(searchSchemas) })
    }
    case "getSearchSchemaNames": {
      return Promise.resolve({ response: searchSchemas.map((s) => { return { name: s.name, active: s.active, clear: s.clear } }) });
    }
    case "setActive": {
      setSearchSchemas(produce((prev) => {
        for (let i = 0; i < prev.length; i++) {
          if (message.idx === i) {
            prev[i].active = true;
          } else {
            prev[i].active = false;
          }
        }
      }))
      break;
    }
    case "setSearchSchemas": {
      setSearchSchemas(message.searchSchemas);
      break;
    }
    default: {
      break;
    }
  }
});

browser.browserAction.onClicked.addListener(() => {
  browser.tabs.create({ url: 'src/options/index.html' });
});