import { createEffect } from 'solid-js';
import { createStore, SetStoreFunction, Store } from 'solid-js/store';

export interface Url {
  base: string,
  replaceSpaceWith: string,
  before: string,
  after: string,
  active: boolean
}

export interface SearchSchema {
  name: string,
  urls: Url[],
  active: boolean,
  // whether or not to shift focus to a specific tab
  shouldShiftFocus: boolean
}

const createLocalStore = <T extends object>(name: string, init: T): [Store<T>, SetStoreFunction<T>] => {
  const rawJson = localStorage.getItem(name);

  // load json from localstore
  const [store, setStore]: [Store<T>, SetStoreFunction<T>] = createStore(rawJson ? JSON.parse(rawJson) : init);
  // currently debugging and will probably change this a lot, so just setting it to init

  createEffect(() => localStorage.setItem(name, JSON.stringify(store)))

  return [store, setStore];
}

export const initSearchSchemas = (): SearchSchema[] => {
  const searchSchemas: SearchSchema[] = [
    {
      name: "English",
      urls: [
        {
          base: 'https://www.oxfordlearnersdictionaries.com/us/definition/english/',
          replaceSpaceWith: '-',
          before: '',
          after: '',
          active: true,
        },
        {
          base: 'https://www.google.com/search?q=',
          replaceSpaceWith: '+',
          before: 'define ',
          after: '',
          active: false,
        },
        {
          base: 'https://www.google.com/search?tbm=isch&q=',
          replaceSpaceWith: '+',
          before: '',
          after: '',
          active: false,
        },
        {
          base: 'https://www.merriam-webster.com/dictionary/',
          replaceSpaceWith: ' ',
          before: '',
          after: '',
          active: false,
        },
      ],
      active: true,
      shouldShiftFocus: true
    },
    {
      name: "Japanese",
      urls: [
        {
          base: 'https://www.google.com/search?q=',
          replaceSpaceWith: '+',
          before: '',
          after: 'とは',
          active: true,
        },
        {
          base: 'https://www.google.com/search?tbm=isch&q=',
          replaceSpaceWith: '+',
          before: '',
          after: '',
          active: false,
        },
        {
          base: 'https://kotobank.jp/gs/?q=',
          replaceSpaceWith: ' ',
          before: '',
          after: '',
          active: false,
        },
        {
          base: 'https://www.weblio.jp/content/',
          replaceSpaceWith: ' ',
          before: '',
          after: '',
          active: false,
        },
        {
          base: 'https://ja.wikipedia.org/w/index.php?search=',
          replaceSpaceWith: ' ',
          before: '',
          after: '',
          active: false,
        },
        {
          base: 'https://jisho.org/search/',
          replaceSpaceWith: ' ',
          before: '',
          after: '%23kanji',
          active: false,
        },
      ],
      active: false,
      shouldShiftFocus: true
    }
  ];
  return searchSchemas;
}

console.log('loaded store');

export const [searchSchemas, setSearchSchemas] = createLocalStore('searchSchemas', initSearchSchemas());