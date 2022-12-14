import { createEffect, createResource, createSignal, onMount } from 'solid-js'
import browser from 'webextension-polyfill'
import { produce } from 'solid-js/store'
import { type ContentScriptRequest } from 'src/background/main'

type SearchTitles = { name: string; active: boolean; clear: boolean }

const getSearchSchemaNames = async (): Promise<SearchTitles[]> => {
  const res: { response: SearchTitles[] } = await browser.runtime.sendMessage({
    variant: 'getSearchSchemaNames',
  } as ContentScriptRequest)
  return res.response
}

export const Search = () => {
  let value = ''
  let bar: HTMLInputElement

  const [searchSchemas, { mutate }] = createResource(getSearchSchemaNames)

  const [active, setActive] = createSignal('')

  createEffect(() => {
    const ss = searchSchemas()
    if (ss) {
      setActive(ss.find((s) => s.active)!.name)
    }
  })

  onMount(() => {
    bar!.focus()
  })

  const processKey = (e: KeyboardEvent): void => {
    switch (e.code) {
      case 'Enter': {
        // in some cases it is beneficial for the user to make temporary searches
        // for example, a dictionary definition of a word might itself include definitions of
        // unknown words that must be searched
        // these should not be tracked, instead,
        // when one tab is deleted, the entire stack should be disposed
        if (e.ctrlKey) {
          browser.runtime.sendMessage({
            variant: 'lookupTermTemporary',
            query: bar.value,
          } as ContentScriptRequest)
        }
        // try searching!
        // this is actually very easy to do.
        // So we basically make an option page that binds to local storage, and whenever we init search below we load the search engines from local storage. It's pissfree!!!!!!
        // Actually, we'll have to load localstorage from
        browser.runtime.sendMessage({
          variant: 'lookupTerm',
          query: bar.value,
        } as ContentScriptRequest)

        browser.runtime.sendMessage({
          variant: 'toggleSearch',
        } as ContentScriptRequest)

        if (
          searchSchemas() &&
          searchSchemas()!.find((s) => s.name === active())?.clear
        ) {
          bar.value = ''
        }

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
          browser.runtime.sendMessage({
            variant: 'toggleSearch',
          } as ContentScriptRequest)
        }
        break
      }
      case 'KeyK': {
        if (e.ctrlKey) {
          e.preventDefault()
          const ss = searchSchemas()
          if (!ss) {
            return
          }
          const i = ss.findIndex((s) => s.active)!
          mutate(
            produce((old) => {
              old![i].active = false
              const inew = (i - 1 + ss.length) % ss.length
              old![inew].active = true
              setActive(old![inew].name)
              browser.runtime.sendMessage({
                variant: 'setActive',
                idx: inew,
              } as ContentScriptRequest)
            })
          )
        }
        break
      }
      case 'KeyJ': {
        if (e.ctrlKey) {
          e.preventDefault()
          const ss = searchSchemas()
          if (!ss) {
            return
          }
          const i = ss.findIndex((s) => s.active)!
          mutate(
            produce((old) => {
              old![i].active = false
              const inew = (i + 1) % ss.length
              old![inew].active = true
              setActive(old![inew].name)
              browser.runtime.sendMessage({
                variant: 'setActive',
                idx: inew,
              } as ContentScriptRequest)
            })
          )
        }
        break
      }
      case 'Escape': {
        e.preventDefault()
        browser.runtime.sendMessage({
          variant: 'toggleSearch',
        } as ContentScriptRequest)
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
        onKeyDown={processKey}
        onInput={(e: InputEvent) => {
          value = (e.target as any).value
        }}
      />
      <div>{active()}</div>
    </>
  )
}
