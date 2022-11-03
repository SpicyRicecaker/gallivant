import { createEffect, createResource, createSignal, onMount } from 'solid-js'
import browser from 'webextension-polyfill'
import { produce } from 'solid-js/store'
import { type ContentScriptRequest } from 'src/background/main'
import { Monad } from 'src/lib'
import { browserRuntimeSendMessage } from 'src/lib2'

interface SearchTitles {
  name: string
  active: boolean
  clear: boolean
}

const getSearchSchemaNames = async (): Promise<SearchTitles[]> => {
  const req: ContentScriptRequest = { variant: 'getSearchSchemaNames' }
  const res: { response: SearchTitles[] } = await browser.runtime.sendMessage(
    req
  )
  return res.response
}

export const Search = () => {
  let bar: HTMLInputElement

  const [searchSchemas, { mutate }] = createResource(getSearchSchemaNames)

  const [active, setActive] = createSignal('')

  createEffect(() => {
    Monad.unit(searchSchemas())
      .map((s) => s.find((s) => s.active))
      .each((t) => setActive(t.name))
  })

  onMount(() => {
    bar.focus()
  })

  const processKey = async (e: KeyboardEvent): Promise<void> => {
    switch (e.code) {
      case 'Enter': {
        // in some cases it is beneficial for the user to make temporary searches
        // for example, a dictionary definition of a word might itself include definitions of
        // unknown words that must be searched
        // these should not be tracked, instead,
        // when one tab is deleted, the entire stack should be disposed
        if (e.ctrlKey) {
          await browserRuntimeSendMessage({
            variant: 'lookupTermTemporary',
            query: bar.value
          })
        }
        // try searching!
        // this is actually very easy to do.
        // So we basically make an option page that binds to local storage, and whenever we init search below we load the search engines from local storage. It's pissfree!!!!!!
        // Actually, we'll have to load localstorage from
        await browserRuntimeSendMessage({
          variant: 'lookupTerm',
          query: bar.value
        })

        await browserRuntimeSendMessage({
          variant: 'toggleSearch'
        })

        Monad.unit(searchSchemas())
          .map((s) => Monad.unit(s.find((s) => s.name === active())))
          .map((s) => Monad.unit(s.clear))
          .each((clear) => {
            if (clear) {
              bar.value = ''
            }
          })

        break
      }
      // TODO currently bugged with IMES, where 1) closing the search causes the
      // user to be unable to type using ime, and 2) prevent default does not
      // work for ime characters. Check `compositionstart` and
      // `compositionupdate` events
      // opacity 0 + pointerevents none fixes 1) but feels hacky
      case 'KeyG': {
        if (e.ctrlKey) {
          e.preventDefault()
          await browserRuntimeSendMessage({
            variant: 'toggleSearch'
          })
        }
        break
      }
      case 'KeyK': {
        if (e.ctrlKey) {
          e.preventDefault()
          Monad.unit(searchSchemas()).each((ss) => {
            Monad.unit(ss.findIndex((s) => s.active)).each((i) => {
              mutate(
                produce((old) => {
                  Monad.unit(old).each((old) => {
                    old[i].active = false
                    const inew = (i - 1 + ss.length) % ss.length
                    old[inew].active = true
                    setActive(old[inew].name)
                    browserRuntimeSendMessage({
                      variant: 'setActive',
                      idx: inew
                    }).catch((e) => console.error(e))
                  })
                })
              )
            })
          })
        }
        break
      }
      case 'KeyJ': {
        if (e.ctrlKey) {
          e.preventDefault()
          Monad.unit(searchSchemas()).each((ss) => {
            Monad.unit(ss.findIndex((s) => s.active)).each((i) => {
              mutate(
                produce((old) => {
                  Monad.unit(old).each((old) => {
                    old[i].active = false
                    const inew = ((i + 1) % ss.length) % ss.length
                    old[inew].active = true
                    setActive(old[inew].name)
                    browserRuntimeSendMessage({
                      variant: 'setActive',
                      idx: inew
                    }).catch((e) => console.error(e))
                  })
                })
              )
            })
          })
        }
        break
      }
      case 'Escape': {
        e.preventDefault()
        await browserRuntimeSendMessage({
          variant: 'toggleSearch'
        })
        break
      }
      default: {
        break
      }
    }
  }

  return (
    <>
      <input
        ref={bar!}
        onKeyDown={(e) => {
          processKey(e).catch((e) => console.error(e))
        }}
        onInput={(e: InputEvent) => {
          value = (e.target as any).value
        }}
      />
      <div>{active()}</div>
    </>
  )
}
