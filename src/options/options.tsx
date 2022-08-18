import Entries from './entries';
import Entry from './entry';

import { searchSchemas, setSearchSchemas } from './schemas';
import { produce } from 'solid-js/store';

import { Component, Show } from 'solid-js';
import { For } from 'solid-js';

import styles from './index.module.css';
import { useSchemaPathContext } from './schema-path';
import { SearchSchema, Url } from 'src/background/store';

const Options: Component = () => {
  const [schemaPath, setSchemaPath] = useSchemaPathContext();

  let y = () => searchSchemas.findIndex((s) => s.name === schemaPath());

  return (
    <Entries
      add={
        schemaPath().length === 0
          ? (): void => {
              setSearchSchemas(
                produce((prev) => {
                  prev.push({
                    name: 'temp',
                    urls: [],
                    active: false,
                    shouldShiftFocus: true,
                  } as SearchSchema);
                })
              );
            }
          : (): void => {
              setSearchSchemas(
                produce((prev) => {
                  prev[y()].urls.push({
                    base: '',
                    before: '',
                    after: '',
                    replaceSpaceWith: ' ',
                    active: false,
                  } as Url);
                })
              );
            }
      }
    >
      <Show
        when={schemaPath().length === 0}
        fallback={
          // when a schema is selected, show the url
          // might be really inefficient tho, since this could potentially rerun on every change
          <For each={searchSchemas[y()].urls}>
            {(url, x) => (
              <Entry
                remove={() => {
                  setSearchSchemas(
                    produce((prev) => {
                      prev[y()].urls.splice(x(), 1);
                    })
                  );
                }}
              >
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
                    placeholder="before"
                    class={styles.before}
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
                    placeholder="after"
                    class={styles.before}
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
                  <input
                    placeholder="replace space with"
                    class={styles.space}
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
                    <input
                      type="radio"
                      name={`${searchSchemas[y()].name}-active`}
                      checked={url.active}
                      class={
                        searchSchemas[y()].shouldShiftFocus
                          ? ''
                          : styles.inactiveRadio
                      }
                      onInput={(_) => {
                        setSearchSchemas(
                          produce((prev) => {
                            for (let i = 0; i < prev[y()].urls.length; i++) {
                              if (i === x()) {
                                prev[y()].urls[x()].active = true;
                              } else {
                                prev[y()].urls[x()].active = false;
                              }
                            }
                          })
                        );
                      }}
                    />
                  </label>
                </div>
              </Entry>
            )}
          </For>
        }
      >
        {/* by default, show the folders of the schemas*/}
        <For each={searchSchemas}>
          {(searchSchema, y) => (
            <Entry
              remove={() => {
                setSearchSchemas(
                  produce((prev) => {
                    prev.splice(y(), 1);
                  })
                );
              }}
            >
              <div
                onClick={() => {
                  setSchemaPath(searchSchema.name);
                }}
              >
                <h2>{searchSchema.name}</h2>
                <label>
                  is active searcher
                  <input
                    type="radio"
                    name="active"
                    checked={searchSchema.active}
                    onInput={(_) => {
                      setSearchSchemas(
                        produce((prev) => {
                          for (let i = 0; i < prev.length; i++) {
                            if (i == y()) {
                              prev[y()].active = true;
                            } else {
                              prev[y()].active = false;
                            }
                          }
                        })
                      );
                    }}
                  />
                </label>
                <label>
                  should shift focus
                  <input
                    type="checkbox"
                    checked={searchSchema.shouldShiftFocus}
                    onInput={(_) => {
                      setSearchSchemas(
                        produce((prev) => {
                          prev[y()].shouldShiftFocus =
                            !prev[y()].shouldShiftFocus;
                        })
                      );
                    }}
                  />
                </label>
              </div>
            </Entry>
          )}
        </For>
      </Show>
    </Entries>
  );
};

export default Options;
