import { useEffect, useState } from "react";

import browser from 'webextension-polyfill';

export const useGlobal = (activeTab?:browser.Tabs.Tab) => {
  const [isDev, setDev] = useState<boolean> (false)

  useEffect(()=>{
		if (activeTab  && activeTab.id) {
      browser.scripting.executeScript({
          target: { tabId: activeTab.id! },
          func: () => {
            const isDevStored = localStorage.getItem("ghn_mfe_development") || ""
            return isDevStored==="true"
          },
      }).then((result) => {
        if (result[0]) {
            setDev(result[0].result)
        }
      })
    }
  },[activeTab])
  return { isDev };
};
