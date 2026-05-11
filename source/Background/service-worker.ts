import browser from "webextension-polyfill";

import { MessageCommand, type Message } from "../types";

async function execInPage<T>(
  tabId: number,
  func: (...args: unknown[]) => T,
  args: unknown[] = [],
): Promise<T | null> {
  try {
    const result = await browser.scripting.executeScript({
      target: { tabId },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      func: func as any,
      args,
      // Must run in MAIN world to read page-set globals like window.__ghnInspector.
      // The default ISOLATED world has its own `window` and cannot see them.
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      world: "MAIN" as any,
    });
    return (result[0]?.result as T) ?? null;
  } catch (error) {
    console.error("execInPage failed:", error);
    return null;
  }
}

async function onMessage(message: Message) {
  switch (message.command) {
    case MessageCommand.GET_TAB_INFO:
      if (message.tabId) {
        return browser.tabs
          .get(message.tabId)
          .then((tab) => tab)
          .catch((error) => {
            console.error("Error getting tab:", error);
            return null;
          });
      }
      break;

    case MessageCommand.GET_LOCAL_DEVELOPMENT:
      if (message.tabId) {
        return await execInPage<boolean | null>(message.tabId, () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const api = (window as any).__ghnInspector;
          return api ? api.isDevelopmentEnabled() : null;
        });
      }
      break;

    case MessageCommand.SET_LOCAL_DEVELOPMENT:
      if (message.tabId) {
        await execInPage<void>(
          message.tabId,
          (enabled) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const api = (window as any).__ghnInspector;
            if (!api) return;
            if (enabled) api.enableDevelopment();
            else api.disableDevelopment();
          },
          [Boolean(message.data)],
        );
      }
      break;

    case MessageCommand.GET_PORTAL_MODULE:
      if (message.tabId) {
        return await execInPage<Record<string, string> | null>(
          message.tabId,
          () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const api = (window as any).__ghnInspector;
            return api ? api.getLocalModules() : null;
          },
        );
      }
      break;

    case MessageCommand.SET_PORTAL_MODULE:
      if (message.tabId) {
        await execInPage<void>(
          message.tabId,
          (raw) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const api = (window as any).__ghnInspector;
            if (!api) return;
            try {
              const modules = JSON.parse(raw as string) as Record<
                string,
                string
              >;
              api.setLocalModules(modules);
            } catch (e) {
              console.error("SET_PORTAL_MODULE parse failed", e);
            }
          },
          [message.data],
        );
      }
      break;

    case MessageCommand.ON_RELOAD:
      if (message.tabId) {
        await execInPage<void>(message.tabId, () => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const api = (window as any).__ghnInspector;
          if (api) api.reload();
          else window.location.reload();
        });
      }
      break;
  }
  return null;
}

(async function init() {
  console.clear();
  console.info("Inspector Service Worker is starting...");
  browser.runtime.onMessage.addListener(onMessage);
})();

export {};
