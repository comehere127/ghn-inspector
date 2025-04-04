import React from "react";

import browser from "webextension-polyfill";

import { Message, MessageCommand } from '../../types';
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
  const { setActiveTab , getAppListFromPortal, activeTab, refreshAppList} = useLocalStorageContext();
  const { isDev } = useGlobal(activeTab);
  const [currentPath, setCurrentPath] = React.useState("");
  const onCapturedRequest = React.useCallback(async (resp)=>{
    const { request, response } = resp || {}
    if (request.url?.includes("/api/app?") && response.status === 200) {
      const [data] = await resp.getContent()
      getAppListFromPortal(data)
    }
  },[getAppListFromPortal])

  const onExtensionStorageChanged = React.useCallback((changes)=>{
    console.log("onExtensionStorageChanged",changes)
  },[])

  
  React.useEffect(()=>{
      browser.devtools.network.onRequestFinished.addListener(onCapturedRequest)
      browser.storage.onChanged.addListener(onExtensionStorageChanged)
      return ()=>{
        browser.devtools.network.onRequestFinished.removeListener(onCapturedRequest)
        browser.storage.onChanged.removeListener(onExtensionStorageChanged)
      }
  },[onCapturedRequest, onExtensionStorageChanged])

  React.useEffect(() => {
    let mounted = true;
    const abortController = new AbortController();

    const validateTab = async () => {
      if (!mounted) return;

      try {
        const tabId = browser.devtools.inspectedWindow.tabId;
        
        const tabInfo = await browser.runtime.sendMessage({
          command: MessageCommand.GET_TAB_INFO,
          tabId
        } as Message)
        setActiveTab(tabInfo);
        setCurrentPath(tabInfo?.url || "");
      } catch (err) {
        console.log({err})
      } 
    };

    validateTab();
    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [setActiveTab]);

  if (!currentPath || !isDev) {
    return <div>
      <h1>This extension only worked in development environment</h1>
      {currentPath && <button className="btn" onClick={refreshAppList}>Refresh</button>}
    </div>;
  }

  return <React.Fragment>
    <h1 className="title">GHN Inspector</h1>
    <VersionBadge />
    <ApplicationList />
    <Notify />
  </React.Fragment>;
}