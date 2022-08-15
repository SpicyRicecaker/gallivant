import { createEffect, createResource, createSignal, onMount } from 'solid-js';
import browser from 'webextension-polyfill';
import { produce } from 'solid-js/store';
import { type ContentScriptRequest } from 'src/background/main';

type SearchTitles = { name: string; active: boolean };

const getSchemas = async (): Promise<SearchTitles[]> => {
  const res: { response: SearchTitles[] } = await browser.runtime.sendMessage({
    variant: 'gimmesearchschemas',
  } as ContentScriptRequest);
  return res.response;
};

export const Search = () => {
  let value = '';
  let bar: HTMLInputElement;

  const [searchSchemas, { mutate, refetch }] = createResource(getSchemas);

  const [active, setActive] = createSignal('');

  createEffect(() => {
    const ss = searchSchemas();
    if (ss) {
      setActive(ss.find((s) => s.active)!.name);
    }
  });

  onMount(() => {
    bar!.focus();
  });

  const processKey = (e: KeyboardEvent): void => {
    switch (e.code) {
      case 'Enter': {
        // try searching!
        // this is actually very easy to do.
        // So we basically make an option page that binds to local storage, and whenever we init search below we load the search engines from local storage. It's pissfree!!!!!!
        // Actually, we'll have to load localstorage from
        browser.runtime.sendMessage({
          variant: 'lookupTerm',
          query: bar.value,
        } as ContentScriptRequest);

        browser.runtime.sendMessage({
          variant: 'toggleSearch',
        } as ContentScriptRequest);
        break;
      }
      // TODO currently bugged with IMES, where 1) closing the search causes the
      // user to be unable to type using ime, and 2) prevent default does not
      // work for ime characters. Check `compositionstart` and
      // `compositionupdate` events
      // opacity 0 + pointerevents none fixes 1) but feels hacky
      case 'KeyG': {
        if (e.ctrlKey) {
          e.preventDefault();
          browser.runtime.sendMessage({
            variant: 'toggleSearch',
          } as ContentScriptRequest);
        }
        break;
      }
      case 'KeyK': {
        if (e.ctrlKey) {
          e.preventDefault();
          const ss = searchSchemas();
          if (!ss) {
            return;
          }
          const i = ss.findIndex((s) => s.active)!;
          mutate(
            produce((old) => {
              old![i].active = false;
              const inew = (i - 1 + ss.length) % ss.length;
              old![inew].active = true;
              setActive(old![inew].name);
              browser.runtime.sendMessage({
                variant: 'setActive',
                idx: inew,
              } as ContentScriptRequest);
            })
          );
        }
        break;
      }
      case 'KeyJ': {
        if (e.ctrlKey) {
          e.preventDefault();
          const ss = searchSchemas();
          if (!ss) {
            return;
          }
          const i = ss.findIndex((s) => s.active)!;
          mutate(
            produce((old) => {
              old![i].active = false;
              const inew = (i + 1) % ss.length;
              old![inew].active = true;
              setActive(old![inew].name);
              browser.runtime.sendMessage({
                variant: 'setActive',
                idx: inew,
              } as ContentScriptRequest);
            })
          );
        }
        break;
      }
      case 'Escape': {
        e.preventDefault();
        browser.runtime.sendMessage({
          variant: 'toggleSearch',
        } as ContentScriptRequest);
        break;
      }
      default: {
        break;
      }
    }
  };

  return (
    <>
      <input
        ref={bar!}
        onKeyDown={processKey}
        onInput={(e: InputEvent) => {
          value = (e.target as any).value;
        }}
      />
      <div>{active()}</div>
    </>
  );
};
