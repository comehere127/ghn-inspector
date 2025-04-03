import { useMemo } from "react";


import { useLocalStorageContext } from "../context/localStorage.context";

export const useApplicationListData = () => {
  const { extensionStorage } = useLocalStorageContext();

  const localModules:Record<string, string> | null = useMemo(() => {
    if(!extensionStorage){
      return null
    }
    return extensionStorage
  }, [extensionStorage]);
  return {
     data: localModules 
  };
};