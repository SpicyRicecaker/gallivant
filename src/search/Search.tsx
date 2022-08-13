import { onMount } from 'solid-js';
import browser from 'webextension-polyfill';

const processKey = (bar: HTMLInputElement, e: KeyboardEvent) => {
  switch (e.code) {
    case 'Enter': {
      // try searching!
      // this is actually very easy to do.
      // So we basically make an option page that binds to local storage, and whenever we init search below we load the search engines from local storage. It's pissfree!!!!!!
      // Actually, we'll have to load localstorage from
      window.open(
        `https://www.oxfordlearnersdictionaries.com/us/definition/english/${bar.value.replaceAll(
          ' ',
          '-'
        )}`
      );
      window.open(
        `https://www.google.com/search?q=${bar.value.replaceAll(' ', '+')}`
      );
      window.open(
        `https://www.google.com/search?tbm=isch&q=${bar.value.replaceAll(
          ' ',
          '+'
        )}`
      );
      window.open(`https://www.merriam-webster.com/dictionary/${bar.value}`);

      browser.runtime.sendMessage({ type: 'search' });
      break;
    }
    case 'KeyF': {
      if (e.altKey) {
        e.preventDefault();
        browser.runtime.sendMessage({ type: 'search' });
      }
      break;
    }
    default: {
      break;
    }
  }
};

export const Search = () => {
  let value = '';
  let bar: HTMLInputElement;

  onMount(() => {
    bar!.focus();
  });

  return (
    <>
      <input
        ref={bar!}
        onKeyDown={(e) => {
          processKey(bar, e);
        }}
        onInput={(e: InputEvent) => {
          value = (e.target as any).value;
        }}
        placeholder="[search]..."
      />
    </>
  );
};
