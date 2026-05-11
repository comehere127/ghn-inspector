import React from "react";

import browser from "webextension-polyfill";

import { Message, MessageCommand } from "../../types";
import { useLocalStorageContext } from "../context/localStorage.context";
import { ApplicationList } from "./ApplicationList";
import { DevelopmentToggle } from "./DevelopmentToggle";
import { Notify } from "./Notify";
import VersionBadge from "./VersionBadge";

export function DevTools() {
  const {
    setActiveTab,
    getAppListFromPortal,
    refreshAppList,
    apiAvailable,
  } = useLocalStorageContext();
  const [currentPath, setCurrentPath] = React.useState("");

  const onCapturedRequest = React.useCallback(
    async (resp) => {
      const { request, response } = resp || {};
      if (request.url?.includes("/api/app?") && response.status === 200) {
        const [data] = await resp.getContent();
        getAppListFromPortal(data);
      }
    },
    [getAppListFromPortal],
  );

  const onExtensionStorageChanged = React.useCallback((changes) => {
    console.log("onExtensionStorageChanged", changes);
  }, []);

  React.useEffect(() => {
    browser.devtools.network.onRequestFinished.addListener(onCapturedRequest);
    browser.storage.onChanged.addListener(onExtensionStorageChanged);
    return () => {
      browser.devtools.network.onRequestFinished.removeListener(
        onCapturedRequest,
      );
      browser.storage.onChanged.removeListener(onExtensionStorageChanged);
    };
  }, [onCapturedRequest, onExtensionStorageChanged]);

  React.useEffect(() => {
    let mounted = true;
    const validateTab = async () => {
      if (!mounted) return;
      try {
        const tabId = browser.devtools.inspectedWindow.tabId;
        const tabInfo = await browser.runtime.sendMessage({
          command: MessageCommand.GET_TAB_INFO,
          tabId,
        } as Message);
        setActiveTab(tabInfo);
        setCurrentPath(tabInfo?.url || "");
      } catch (err) {
        console.log({ err });
      }
    };
    validateTab();
    return () => {
      mounted = false;
    };
  }, [setActiveTab]);

  if (!currentPath) {
    return (
      <div>
        <h1>Waiting for inspected tab…</h1>
      </div>
    );
  }

  if (apiAvailable === false) {
    return (
      <div>
        <h1 className="title">GHN Inspector</h1>
        <VersionBadge />
        <div className="api-missing">
          <h2>Portal API not exposed on this host</h2>
          <p>
            The inspected page does not expose <code>window.__ghnInspector</code>. Either:
          </p>
          <ul>
            <li>
              This host is not in the portal's <code>GHN_MFE_INSPECTOR_HOSTS</code>
              allowlist (production intentionally omits it).
            </li>
            <li>
              The portal build predates this feature — update to a portal version that exposes the inspector API.
            </li>
          </ul>
          <button className="btn" onClick={refreshAppList}>
            Reload page
          </button>
        </div>
      </div>
    );
  }

  return (
    <React.Fragment>
      <h1 className="title">GHN Inspector</h1>
      <VersionBadge />
      <DevelopmentToggle />
      <ApplicationList />
      <Notify />
    </React.Fragment>
  );
}
