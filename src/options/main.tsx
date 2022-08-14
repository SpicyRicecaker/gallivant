import type { Component } from 'solid-js';
import { For } from 'solid-js';
import { searchSchemas } from '../background/store';
import { render } from 'solid-js/web';

const element = document.getElementById('app');
if (!element) {
  throw new Error('No app element found');
}

const Options: Component = () => {
  return (
    <div>
      <For each={searchSchemas}>
        {(searchSchema) => (
          <div>
            <div>{searchSchema.name}</div>
            <label>
              is active searcher
              <input type="radio" checked={searchSchema.active} />
            </label>
            <label>
              should shift focus
              <input
                type="radio"
                checked={searchSchema.shouldShiftFocus}
               />
            </label>
            <div>
              <For each={searchSchema.urls}>
                {(url) => (
                  <div>
                    <label>
                      before
                      <input value={url.before} />
                    </label>
                    <label>
                      base
                      <input value={url.base} />
                    </label>
                    <label>
                      after
                      <input value={url.after} />
                    </label>
                    <label>
                      replace space with
                      <input value={url.replaceSpaceWith} />
                    </label>
                    <label>
                      focus this tab when searching
                      <input type="radio" checked={url.active} />
                    </label>
                  </div>
                )}
              </For>
            </div>
          </div>
        )}
      </For>
    </div>
  );
};

render(() => <Options />, element);
