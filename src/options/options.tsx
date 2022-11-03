import Entries from './entries';
import Entry from './entry';

import { searchSchemas, setSearchSchemas } from './schemas';
import { produce, unwrap } from 'solid-js/store';

import { Component, createSignal, Show } from 'solid-js';
import { For } from 'solid-js';

import styles from './index.module.scss';
import { useSchemaPathContext } from './schema-path';
import { SearchSchema, Url } from 'src/background/store';

import browser from 'webextension-polyfill';
import type { ContentScriptRequest } from 'src/background/main';

const Options: Component = () => {
  const [schemaPath, setSchemaPath] = useSchemaPathContext();

  const [selected, setSelected] = createSignal(-1);

  const [modified, setModified] = createSignal(false);

  let input: HTMLInputElement;

  let y = () => searchSchemas.findIndex((s) => s.name === schemaPath());

  return (
    <Entries
      add={
        schemaPath().length === 0
          ? (): void => {
              setSearchSchemas(
                produce((prev) => {
                  prev.push({
                    name: '',
                    urls: [],
                    active: false,
                    clear: false,
                    shouldShiftFocus: true,
                  } as SearchSchema);
                })
              );
              setModified(true);
            }
          : (): void => {
              setSearchSchemas(
                produce((prev) => {
                  prev[y()].urls.push({
                    base: '',
                    before: '',
                    after: '',
                    replaceSpaceWith: ' ',
                    active: prev[y()].urls.length === 0 ? true : false,
                  } as Url);
                })
              );
              setModified(true);
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
                moveUp={() => {
                  setSearchSchemas(
                    produce((prev) => {
                      const prevIdx = x() - 1;
                      if (prevIdx >= 0) {
                        const temp = prev[y()].urls[prevIdx];
                        prev[y()].urls[prevIdx] = prev[y()].urls[x()];
                        prev[y()].urls[x()] = temp;
                      }
                    })
                  );
                  setModified(true);
                }}
                moveDown={() => {
                  setSearchSchemas(
                    produce((prev) => {
                      const prevIdx = x() + 1;
                      if (prevIdx < 8) {
                        const temp = prev[y()].urls[prevIdx];
                        prev[y()].urls[prevIdx] = prev[y()].urls[x()];
                        prev[y()].urls[x()] = temp;
                      }
                    })
                  );
                  setModified(true);
                }}
                remove={() => {
                  setSearchSchemas(
                    produce((prev) => {
                      prev[y()].urls.splice(x(), 1);
                    })
                  );
                  setModified(true);
                }}
              >
                <div class={styles.url}>
                  <label class={styles.base}>
                    <input
                      value={url.base}
                      placeholder="your search url"
                      onInput={(e: InputEvent) => {
                        setSearchSchemas(
                          produce(
                            (prev) =>
                              (prev[y()].urls[x()].base = (
                                e.target as any
                              ).value)
                          )
                        );
                        setModified(true);
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
                      setModified(true);
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
                      setModified(true);
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
                      setModified(true);
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
                    switch to this tab
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
                        setModified(true);
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
              moveUp={() => {
                setSearchSchemas(
                  produce((prev) => {
                    const prevIdx = y() - 1;
                    if (prevIdx >= 0) {
                      const temp = prev[prevIdx];
                      prev[prevIdx] = prev[y()];
                      prev[y()] = temp;
                    }
                  })
                );
                setModified(true);
              }}
              moveDown={() => {
                setSearchSchemas(
                  produce((prev) => {
                    const prevIdx = y() + 1;
                    if (prevIdx < searchSchemas.length) {
                      const temp = prev[prevIdx];
                      prev[prevIdx] = prev[y()];
                      prev[y()] = temp;
                    }
                  })
                );
                setModified(true);
              }}
              remove={() => {
                setSearchSchemas(
                  produce((prev) => {
                    prev.splice(y(), 1);
                  })
                );
                setModified(true);
              }}
            >
              <div
                onClick={(_) => {
                  if (selected() === y()) {
                    setSchemaPath(searchSchema.name);
                    setSelected(-1);
                  } else {
                    setSelected(y());
                  }
                }}
                class={`${styles.schema} ${
                  selected() === y() ? styles.selected : ''
                }`}
              >
                <input
                  class={styles.final}
                  value={searchSchema.name}
                  placeholder="required search engine name"
                  onClick={(e: MouseEvent) => e.stopPropagation()}
                  onInput={(e: InputEvent) => {
                    setSearchSchemas(
                      produce(
                        (prev) => (prev[y()].name = (e.target as any).value)
                      )
                    );
                    setModified(true);
                  }}
                />

                <hr></hr>
                <label onClick={(e) => e.stopPropagation()}>
                  is active searcher
                  <input
                    type="radio"
                    name="active"
                    checked={searchSchema.active}
                    onInput={(_) => {
                      setSearchSchemas(
                        produce((prev) => {
                          // for some reason, (probably because clicking label causes two click events to be sent, sometimes there's a bug where it double toggles, leaving none. This is BAD, so we're putting a guard here)
                          if (!prev[y()].active) {
                            for (let i = 0; i < prev.length; i++) {
                              if (i == y()) {
                                prev[y()].active = true;
                              } else {
                                prev[y()].active = false;
                              }
                            }
                          }
                        })
                      );
                      setModified(true);
                    }}
                  />
                </label>
                <label onClick={(e) => e.stopPropagation()}>
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
                      setModified(true);
                    }}
                  />
                </label>
                <label onClick={(e) => e.stopPropagation()}>
                  should clear search bar after focus out
                  <input
                    type="checkbox"
                    checked={searchSchema.clear}
                    onInput={(_) => {
                      setSearchSchemas(
                        produce((prev) => {
                          prev[y()].clear =
                            !prev[y()].clear;
                        })
                      );
                      setModified(true);
                    }}
                  />
                </label>
              </div>
            </Entry>
          )}
        </For>
      </Show>
      <div>
        <button
          onClick={(e) => {
            // generate dialog for user to supply their json
            e.preventDefault();
            input.click();
          }}
        >
          import
        </button>
        <input
          onChange={async () => {
            // update the store with our new file.
            const content = JSON.parse(await input.files![0].text());
            setSearchSchemas(content);
            setModified(true);
          }}
          ref={input!}
          style="display: none"
          type="file"
          accept="application/json"
        />
        <button
          onClick={() => {
            // generate json of object
            const file = new File(
              [JSON.stringify(searchSchemas)],
              'schemas.json',
              {
                type: 'application/json',
              }
            );

            const url = URL.createObjectURL(file);

            browser.downloads.download({
              url,
              filename: 'schemas.json',
              saveAs: true,
            });
          }}
        >
          export
        </button>
        <Show when={modified()}>
          <button
            onClick={async () => {
              // send the current search schemas to the browser
              await browser.runtime.sendMessage({
                variant: 'setSearchSchemas',
                searchSchemas: unwrap(searchSchemas),
              } as ContentScriptRequest);
              setModified(false);
            }}
          >
            save modified
          </button>
        </Show>
      </div>
    </Entries>
  );
};

export default Options;
