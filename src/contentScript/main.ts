import browser from 'webextension-polyfill'
import type { BackgroundRequest } from '../background/main'

interface Win extends Window {
  hasRun?: boolean
  gallivant?: boolean
}

;(() => {
  /**
   * Check and set a global guard variable.
   * If this content script is injected into the same page again,
   * it will do nothing next time.
   */
  if ((window as Win).hasRun === undefined) {
    return
  }
  ;(window as Win).hasRun = true

  function insertSearch(searchBarURL: string) {
    if ((window as Win).gallivant === true) {
      removeSearch()
      ;(window as Win).gallivant = false
      return
    } else if ((window as Win).gallivant === false) {
      enableSearch()
      ;(window as Win).gallivant = true
      return
    }
    ;(window as Win).gallivant = true

    const iframe = document.createElement('iframe')

    iframe.setAttribute('fetchpriority', 'high')
    iframe.setAttribute('src', searchBarURL)

    // slightly slow....
    iframe.style.boxShadow = '0px 5px 30px 0px rgba(0,0,0,0.5)'

    iframe.style.margin = '0'
    iframe.style.padding = '0'
    iframe.style.border = '0'
    iframe.style.borderRadius = '0.5em'
    iframe.style.background = 'none'

    iframe.style.position = 'fixed'
    iframe.style.left = '10%'
    iframe.style.top = '40%'
    iframe.style.zIndex = '2147383647'
    iframe.style.colorScheme = 'normal'
    iframe.style.width = '80%'
    // hardcoding solves everything
    iframe.style.height = '68px'
    iframe.style.colorScheme = 'light'
    iframe.id = 'gallivant-search'

    document.body.appendChild(iframe)
  }

  /**
   * Remove every searchbar from the page.
   */
  function removeSearch() {
    const el = document.getElementById('gallivant-search')!

    el.style.opacity = '0%'
    el.style.pointerEvents = 'none'
  }

  function enableSearch() {
    const iframe = document.getElementById(
      'gallivant-search'
    )! as HTMLIFrameElement
    // iframe.style.display = "block";
    iframe.style.opacity = '100%'
    iframe.style.pointerEvents = 'all'

    // need to focus iframe first before the content in it
    iframe.focus()
    iframe.contentDocument?.getElementsByTagName('input')[0]!.focus()
  }

  /**
   * Listen for messages from the background script.
   */
  browser.runtime.onMessage.addListener((message: BackgroundRequest) => {
    switch (message.variant) {
      case 'toggleSearch': {
        insertSearch(message.searchBarSrc)
        break
      }
      default: {
        break
      }
    }
  })
})()
