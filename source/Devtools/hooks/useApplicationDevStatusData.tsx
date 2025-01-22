import { LOCAL_MODULES_DEV_STATUS_KEY } from "../constant/constant";
import { useLocalStorageContext } from "../context/localStorage.context";

export const useApplicationDevStatusData = () => {
  const { localStorageData } = useLocalStorageContext();

  const localModules = localStorageData[LOCAL_MODULES_DEV_STATUS_KEY] === "true";
  return { data: localModules };
};