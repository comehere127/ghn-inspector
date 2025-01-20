import React, { useEffect, useState } from "react";

import browser from "webextension-polyfill";

import { useLocalStorageContext } from "../context/localStorage.context";
import { ApplicationList } from "./ApplicationList";

/**
 * DevTools component
 * @constructor
 * Check if the domain is valid
 * if it is, show the domain and the list of results
 * if it is not, show the error message
 * @return {JSX.Element} DevTools component
 */
export function DevTools() {
  const { setActiveTab, localStorageData } = useLocalStorageContext();
  const [currentPath, setCurrentPath] = useState("");

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
  }, []);

  if (!currentPath) {
    return <h1>This extension only worked in development environment</h1>;
  }

  return <React.Fragment>
    <h1>GHN Inspector</h1>
    <ApplicationList localStorageData={localStorageData} />
  </React.Fragment>;
}