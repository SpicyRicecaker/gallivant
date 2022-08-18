import { createEffect, createResource } from 'solid-js';

import { createStore } from 'solid-js/store';
import browser from 'webextension-polyfill';

import { type SearchSchema } from 'src/background/store';
import { type ContentScriptRequest } from 'src/background/main';

const getSearchSchemaNames = async (): Promise<SearchSchema[]> => {
  const res: { response: string } = await browser.runtime.sendMessage({
    variant: 'getSearchSchemas',
  } as ContentScriptRequest);
  return JSON.parse(res.response) as SearchSchema[];
};

// Objects from signals aren't deeply reactive by default, so we wrap the result in a store. Call it inefficient, because it is lol
const [searchResource, _] = createResource(getSearchSchemaNames);

export const [searchSchemas, setSearchSchemas] = createStore([] as SearchSchema[]);

createEffect(() => {
  const r = searchResource();
  if (r) {
    // set function
    setSearchSchemas(r);
  }
});
