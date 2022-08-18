import { Component, createEffect, createResource } from 'solid-js';
import { For } from 'solid-js';
import { render } from 'solid-js/web';
import { createStore, produce } from 'solid-js/store';
import browser from 'webextension-polyfill';

import './index.css';
import styles from './index.module.css';

import { type SearchSchema } from 'src/background/store';
import { type ContentScriptRequest } from 'src/background/main';

const element = document.getElementById('app');
if (!element) {
  throw new Error('No app element found');
}

const getSearchSchemaNames = async (): Promise<SearchSchema[]> => {
  const res: { response: string } = await browser.runtime.sendMessage({
    variant: 'getSearchSchemas',
  } as ContentScriptRequest);
  return JSON.parse(res.response) as SearchSchema[];
};

const Options: Component = () => {
  // Objects from signals aren't deeply reactive by default, so we wrap the result in a store. Call it inefficient, because it is lol
  const [searchResource, _] = createResource(getSearchSchemaNames);

  const [searchSchemas, setSearchSchemas] = createStore([] as SearchSchema[]);

  createEffect(() => {
    const r = searchResource();
    if (r) {
      setSearchSchemas(r);
      console.log(r);
    }
  });

  return (
    <>
      <For each={searchSchemas}>
        {(searchSchema, y) => (
          <div class={styles.searchSchemas}>
            <div>
              <h2>{searchSchema.name}</h2>
              <label>
                is active searcher
                <input
                  type="radio"
                  name="active"
                  checked={searchSchema.active}
                />
              </label>
              <label>
                should shift focus
                <input
                  type="checkbox"
                  checked={searchSchema.shouldShiftFocus}
                />
              </label>
            </div>
            <div class={styles.urls}>
              <For each={searchSchema.urls}>
                {(url, x) => (
                  <div class={styles.url}>
                    <label class={styles.base}>
                      <input
                        value={url.base}
                        onInput={(e: InputEvent) => {
                          setSearchSchemas(
                            produce(
                              (prev) =>
                                (prev[y()].urls[x()].base = (
                                  e.target as any
                                ).value)
                            )
                          );
                        }}
                      />
                    </label>
                    <input
                      value={url.before}
                      onInput={(e: InputEvent) => {
                        setSearchSchemas(
                          produce(
                            (prev) =>
                              (prev[y()].urls[x()].before = (
                                e.target as any
                              ).value)
                          )
                        );
                      }}
                    />
                    <input
                      value={url.after}
                      onInput={(e: InputEvent) => {
                        setSearchSchemas(
                          produce(
                            (prev) =>
                              (prev[y()].urls[x()].after = (
                                e.target as any
                              ).value)
                          )
                        );
                      }}
                    />
                    <div class={styles.space}>
                      <input
                        value={url.replaceSpaceWith}
                        onInput={(e: InputEvent) => {
                          setSearchSchemas(
                            produce(
                              (prev) =>
                                (prev[y()].urls[x()].replaceSpaceWith = (
                                  e.target as any
                                ).value)
                            )
                          );
                        }}
                      />
                    </div>
                    <div class={styles.final}>
                      {url.base}
                      <span>
                        {`${url.before.replaceAll(
                          ' ',
                          url.replaceSpaceWith
                        )}${'your search term'.replaceAll(
                          ' ',
                          url.replaceSpaceWith
                        )}${url.after.replaceAll(' ', url.replaceSpaceWith)}`}
                      </span>
                    </div>

                    <label>
                      switch to this tab
                      <input
                        type="radio"
                        name={`${searchSchema.name}-active`}
                        checked={url.active}
                        onInput={(e: InputEvent) => {
                          console.log((e.target as any).value);
                          // setSearchSchemas(
                          //   produce(
                          //     (prev) =>
                          //       (prev[y()].urls[x()].active = (
                          //         e.target as any
                          //       ).value)
                          //   )
                          // );
                        }}
                      />
                    </label>
                  </div>
                )}
              </For>
            </div>
          </div>
        )}
      </For>
      {/* <button
        onClick={() => {
          setSearchSchemas(initSearchSchemas());
        }}
      >
        restore to defaults
      </button> */}
    </>
  );
};

render(() => <Options />, element);
