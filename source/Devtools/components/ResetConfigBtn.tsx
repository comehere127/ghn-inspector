// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import React from "react";

import browser from "webextension-polyfill";

import { DEVTOOLS_LOCAL_MODULES_KEY,LOCAL_MODULES_KEY } from "../constant";
import { useConfigContext } from "../context/localConfigs.context";
import { useLocalStorageContext } from "../context/localStorage.context";

export function ResetConfigBtn() {
  const { saveAppListToPortal, setExtensionStorage } = useLocalStorageContext();
  const {setNotify} = useConfigContext()

  const handleOnClick = async () => {
    const stored=await browser.storage.local.get()||{}
    saveAppListToPortal(LOCAL_MODULES_KEY, stored[DEVTOOLS_LOCAL_MODULES_KEY])
    setExtensionStorage(stored[DEVTOOLS_LOCAL_MODULES_KEY])
    setNotify("Restore config successful!")
  };

  return <button className="btn" onClick={handleOnClick}>Restore</button>;
}