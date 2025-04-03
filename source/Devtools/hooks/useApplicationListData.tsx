import { useMemo } from "react";

import browser from "webextension-polyfill";

import { DEVTOOLS_LOCAL_MODULES_KEY, LOCAL_MODULES_KEY } from "../constant/constant";
import { useLocalStorageContext } from "../context/localStorage.context";

/**
 * Hook to extract modules out of localStorage data
 */
export const useApplicationListData = () => {
  const { localStorageData } = useLocalStorageContext();

  const localModules = useMemo(() => localStorageData[LOCAL_MODULES_KEY] || null, [localStorageData]);
  if (!localModules) {
    return { data: null };
  }

  // Save the original value to browser devtools storage for debugging
  browser.storage.local.set({ [DEVTOOLS_LOCAL_MODULES_KEY]: localModules });

  const localModulesData = JSON.parse(localModules as string) as Record<string, string>;


  return { data: localModulesData };
};