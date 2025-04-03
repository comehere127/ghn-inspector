// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import React from "react";

import { LOCAL_MODULES_KEY } from "../constant";
import { useConfigContext } from "../context/localConfigs.context";
import { useLocalStorageContext } from "../context/localStorage.context";

export function UpdateConfigBtn() {
  const { config, setNotify } = useConfigContext();
  const { saveAppListToPortal } = useLocalStorageContext();

  const handleOnClick = () => {
    saveAppListToPortal(LOCAL_MODULES_KEY, config);
    setNotify("Update config successful!")
  };

  return <button className="btn" onClick={handleOnClick}>Update</button>;
}