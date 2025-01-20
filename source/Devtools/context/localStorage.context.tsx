import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

import browser from "webextension-polyfill";

interface LocalStorageContextProps {
  localStorageData: Record<string, unknown>;
  setLocalStorageData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;

  activeTab: browser.Tabs.Tab | undefined;
  setActiveTab: React.Dispatch<React.SetStateAction<browser.Tabs.Tab | undefined>>;
}

const LocalStorageContext = createContext<LocalStorageContextProps | undefined>(undefined);

export const LocalStorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<browser.Tabs.Tab | undefined>();
  const [localStorageData, setLocalStorageData] = useState<Record<string, unknown>>({});

  useEffect(() => {
    async function extractLocalStorageData() {
      if (!activeTab || !activeTab.id) return;

      console.log("Extracting local storage data");

      const result = await browser.scripting.executeScript({
        target: { tabId: activeTab.id! },
        func: () => {
          const keys = Object.keys(localStorage);
          console.log({ keys });
          const data: Record<string, string> = {};
          keys.forEach((key) => {
            data[key] = localStorage.getItem(key) || "";
          });

          return [data];
        },
      });

      console.log({ result });

      if (result[0] && result[0].result?.length > 0) {
        setLocalStorageData(result[0].result[0] as Record<string, unknown>);
      }
    }

    extractLocalStorageData();
  }, [activeTab]);

  useEffect(() => {
    console.log({ localStorageData });
  }, [localStorageData]);

  return (
    <LocalStorageContext.Provider value={{ localStorageData, setLocalStorageData, activeTab, setActiveTab }}>
      {children}
    </LocalStorageContext.Provider>
  );
};

export const useLocalStorageContext = () => {
  const context = useContext(LocalStorageContext);
  if (!context) {
    throw new Error("useLocalStorageContext must be used within a LocalStorageProvider");
  }
  return context;
};