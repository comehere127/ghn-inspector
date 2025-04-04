import browser from 'webextension-polyfill';

import { MessageCommand, type Message, } from '../types';

/**
 * When we get a message from the browser, read out the command, exec it and return the result
 */
async function onMessage(message: Message) {
  switch(message.command) {
    case MessageCommand.GET_TAB_INFO:
      if (message.tabId) {
        return browser.tabs.get(message.tabId)
          .then(tab => tab)
          .catch(error => {
            console.error("Error getting tab:", error);
            return null;
          });
      }
      break;
    case MessageCommand.GET_LOCAL_DEVELOPMENT:
      if (message.tabId) {
        const result = await browser.scripting.executeScript({
          target: { tabId: message.tabId },
          func: () => {
            const isDevStored = localStorage.getItem("ghn_mfe_development") || ""
            return isDevStored === "true"
          },
        });
        if (result[0]) {
          return result[0].result;
        }
        return false
      }
      break;
    case MessageCommand.GET_PORTAL_MODULE:
      if (message.tabId) {
        const result = await browser.scripting.executeScript({
          target: { tabId: message.tabId },
          func: () => {
            let data: Record<string, string> = {};
            const modules = localStorage.getItem("ghn_mfe_local_modules") || ""
            try{
              data= JSON.parse(modules) as Record<string,string>
            } catch(error){
              console.error(error)
            }
            return data;
          },
        });
        if (result[0]) {
          return result[0].result
        }
        return {}
      }
      break;
    case MessageCommand.SET_PORTAL_MODULE:
      if (message.tabId) {
        await browser.scripting.executeScript({
          target: { tabId: message.tabId },
          func: (data) => localStorage.setItem("ghn_mfe_local_modules", data as string),
          args: [message.data],
        });
      }
      break;
    case MessageCommand.ON_RELOAD:
      if (message.tabId) {
        browser.scripting.executeScript({
          target: { tabId: message.tabId },
          func: () => {
            window.location.reload();
          },
        });
      }
      break;
  }

  return null;
}

/**
 * Service-worker entrypoint.
 */
(async function init() {
  console.clear();
  console.info('Inspector Service Worker is starting...');
  browser.runtime.onMessage.addListener(onMessage);
})();

export {};
