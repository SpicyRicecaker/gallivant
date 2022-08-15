import type { Component } from 'solid-js';
import { For } from 'solid-js';
import { render } from 'solid-js/web';
import { produce } from 'solid-js/store';

const element = document.getElementById('app');
if (!element) {
  throw new Error('No app element found');
}

const Options: Component = () => {
  return (
    <div>
      <For each={searchSchemas}>
        {(searchSchema, y) => (
          <div>
            <div>{searchSchema.name}</div>
            <label>
              is active searcher
              <input type="radio" name="active" checked={searchSchema.active} />
            </label>
            <label>
              should shift focus
              <input type="checkbox" checked={searchSchema.shouldShiftFocus} />
            </label>
            <div>
              <For each={searchSchema.urls}>
                {(url, x) => (
                  <div>
                    <label>
                      before
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
                    </label>
                    <label>
                      base
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
                    <label>
                      after
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
                    </label>
                    <label>
                      replace space with
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
                    </label>
                    <label>
                      focus this tab when searching
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
      <button
        onClick={() => {
          setSearchSchemas(initSearchSchemas());
        }}
      >
        restore to defaults
      </button>
    </div>
  );
};

render(() => <Options />, element);
