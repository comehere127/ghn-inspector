import { useLocalStorageContext } from "../context/localStorage.context";

export const useApplicationListData = () => {
  const LOCAL_MODULES_KEY = "ghn_mfe_local_modules";
  const { localStorageData } = useLocalStorageContext();

  const localModules = localStorageData[LOCAL_MODULES_KEY] || null;
  if (!localModules) {
    return { data: null };
  }

  const localModulesData = JSON.parse(localModules as string) as Record<string, string>;

  return { data: localModulesData };
};