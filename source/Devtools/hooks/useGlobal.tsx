import { useEffect, useState } from "react";

import browser from 'webextension-polyfill';

import { MessageCommand } from "../../types";

export const useGlobal = (activeTab?:browser.Tabs.Tab) => {
  const [isDev, setDev] = useState<boolean> (false)

  useEffect(()=>{
    if (activeTab && activeTab.id) {
      browser.runtime.sendMessage({
        command: MessageCommand.GET_LOCAL_DEVELOPMENT,
        tabId: activeTab.id
      }).then((result) => setDev(result))
    }
  },[activeTab])
  return { isDev };
};
