import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

import browser from "webextension-polyfill";

interface LocalStorageContextProps {
  localStorageData: Record<string, unknown>;
  setLocalStorageData: React.Dispatch<React.SetStateAction<Record<string, unknown>>>;

  activeTab: browser.Tabs.Tab | undefined;
  setActiveTab: React.Dispatch<React.SetStateAction<browser.Tabs.Tab | undefined>>;

  saveToLocalStorage: (key: string, value: unknown) => void;
  extractLocalStorageData: () => void;
}

const LocalStorageContext = createContext<LocalStorageContextProps | undefined>(undefined);

export const LocalStorageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<browser.Tabs.Tab | undefined>();
  const [localStorageData, setLocalStorageData] = useState<Record<string, unknown>>({});

  async function extractLocalStorageData() {
    if (!activeTab || !activeTab.id) return;

    const result = await browser.scripting.executeScript({
      target: { tabId: activeTab.id! },
      func: () => {
        const keys = Object.keys(localStorage);
        const data: Record<string, string> = {};
        keys.forEach((key) => {
          data[key] = localStorage.getItem(key) || "";
        });

        return [data];
      },
    });

    if (result[0] && result[0].result?.length > 0) {
      setLocalStorageData(result[0].result[0] as Record<string, unknown>);
    }
  }

  useEffect(() => {
    extractLocalStorageData();
  }, [activeTab]);


  const saveToLocalStorage = async (key: string, value: unknown) => {
    if (!activeTab || !activeTab.id) return;

    await browser.scripting.executeScript({
      target: { tabId: activeTab.id! },
      func: (key, value) => {
        localStorage.setItem(key, JSON.stringify(value));
      },
      args: [key, value],
    });
  };

  return (
    <LocalStorageContext.Provider
      value={{
        extractLocalStorageData,
        localStorageData,
        setLocalStorageData,
        activeTab,
        setActiveTab,
        saveToLocalStorage,
      }}>
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