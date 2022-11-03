import browser from 'webextension-polyfill'
import type { ContentScriptRequest } from 'src/background/main'

export const browserRuntimeSendMessage = async (t: ContentScriptRequest): Promise<any> => {
    await browser.runtime.sendMessage(t)
}
