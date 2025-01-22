import React from "react";

import { LOCAL_MODULES_KEY } from "../constant/constant";
import { useConfigContext } from "../context/localConfigs.context";
import { useLocalStorageContext } from "../context/localStorage.context";

export function UpdateConfigBtn() {
  const { config } = useConfigContext();
  const { saveToLocalStorage } = useLocalStorageContext();

  const handleOnClick = () => {
    saveToLocalStorage(LOCAL_MODULES_KEY, config);
  };

  return <button className="btn" onClick={handleOnClick}>Update Config</button>;
}