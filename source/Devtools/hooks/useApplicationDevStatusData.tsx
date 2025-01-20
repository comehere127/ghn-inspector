import { useLocalStorageContext } from "../context/localStorage.context";

export const useApplicationDevStatusData = () => {
  const LOCAL_MODULES_DEV_STATUS_KEY = "ghn_mfe_development";
  const { localStorageData } = useLocalStorageContext();

  const localModules = localStorageData[LOCAL_MODULES_DEV_STATUS_KEY] === "true";
  return { data: localModules };
};