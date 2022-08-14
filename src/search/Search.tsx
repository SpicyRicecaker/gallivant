import { createEffect, createSignal, onMount } from 'solid-js';
import { searchSchemas, setSearchSchemas } from '../background/store';
import browser from 'webextension-polyfill';
import { produce } from 'solid-js/store';

const processKey = (bar: HTMLInputElement, e: KeyboardEvent) => {
  switch (e.code) {
    case 'Enter': {
      // try searching!
      // this is actually very easy to do.
      // So we basically make an option page that binds to local storage, and whenever we init search below we load the search engines from local storage. It's pissfree!!!!!!
      // Actually, we'll have to load localstorage from
      browser.runtime.sendMessage({
        type: 'lookup',
        query: bar.value,
      });

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
    case 'KeyK': {
      if (e.ctrlKey) {
        e.preventDefault();
        // browser.runtime.sendMessage({ type: 'swapup' });
        const i = searchSchemas.findIndex((s) => s.active)!;
        setSearchSchemas(
          produce((old) => {
            old[i].active = false;
            old[(i - 1 + searchSchemas.length) % searchSchemas.length].active =
              true;
          })
        );
      }
      break;
    }
    case 'KeyJ': {
      if (e.ctrlKey) {
        e.preventDefault();
        const i = searchSchemas.findIndex((s) => s.active)!;
        setSearchSchemas(
          produce((old) => {
            old[i].active = false;
            old[(i + 1) % searchSchemas.length].active = true;
          })
        );
        for (const b of searchSchemas) {
          console.log(b.name, b.active);
        }
      }
      break;
    }
    case 'Escape': {
      e.preventDefault();
      browser.runtime.sendMessage({ type: 'search' });
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

  const [active, setActive] = createSignal('');

  createEffect(() => {
    setActive(searchSchemas.find((s) => s.active)!.name);
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
        onBlur={() => browser.runtime.sendMessage({ type: 'search' })}
        onFocusOut={() => browser.runtime.sendMessage({ type: 'search' })}
      />
      <div>{active()}</div>
    </>
  );
};
