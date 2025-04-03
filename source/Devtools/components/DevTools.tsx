import React, { useCallback, useEffect, useState } from "react";

import browser from "webextension-polyfill";

import { useLocalStorageContext } from "../context/localStorage.context";
import { useGlobal } from "../hooks/useGlobal";
import { ApplicationList } from "./ApplicationList";
import { Notify } from "./Notify";
import VersionBadge from "./VersionBadge";

/**
 * DevTools component
 * @constructor
 * Check if the domain is valid
 * if it is, show the domain and the list of results
 * if it is not, show the error message
 * @return {JSX.Element} DevTools component
 */

  
export function DevTools() {
  const { setActiveTab , getAppListFromPortal, activeTab} = useLocalStorageContext();
  const { isDev } = useGlobal(activeTab);
  const [currentPath, setCurrentPath] = useState("");
  const onCapturedRequest = useCallback(async (resp)=>{
    const {request,response}=resp||{}
    if ( request.url?.includes("/api/app?") && response.status === 200 ){
      const [data] = await resp.getContent()
      getAppListFromPortal(data)
    }
  },[getAppListFromPortal])

  const onExtensionStorageChanged = useCallback((changes)=>{
    console.log("onExtensionStorageChanged",changes)
  },[])

  
  useEffect(()=>{
      browser.devtools.network.onRequestFinished.addListener(onCapturedRequest)
      browser.storage.onChanged.addListener(onExtensionStorageChanged)
      return ()=>{
        browser.devtools.network.onRequestFinished.removeListener(onCapturedRequest)
        browser.storage.onChanged.removeListener(onExtensionStorageChanged)
      }
  },[onCapturedRequest, onExtensionStorageChanged])

  useEffect(() => {
    async function getCurrentTab() {
      const tabs = await browser.tabs.query({ active: true, currentWindow: true });
      if (!tabs.length) return;
      setActiveTab(tabs[0]);

      const url = tabs[0]?.url || "";
      setCurrentPath(url);

      if (!url.includes("localhost")) return;
    }

    getCurrentTab();
  }, [setActiveTab]);

  const onReload = useCallback(() => {
    if(activeTab){
      browser.scripting.executeScript({
        target: { tabId: activeTab.id! },
        func: () => {
          window.location.reload();
        },
      });
    }
  }, [activeTab]);

  if (!currentPath || !isDev) {
    return <div>
      <h1>This extension only worked in development environment</h1>
      {currentPath && <button className="btn" onClick={onReload}>Refresh</button>}
    </div>;
  }

  return <React.Fragment>
    <h1 className="title">GHN Inspector</h1>
    <VersionBadge />
    <ApplicationList />
    <Notify />
  </React.Fragment>;
}