import React from "react";

import browser from "webextension-polyfill";

import { DEVTOOLS_LOCAL_MODULES_KEY, LOCAL_MODULES_KEY } from "../constant/constant";
import { useConfigContext } from "../context/localConfigs.context";
import { useLocalStorageContext } from "../context/localStorage.context";

export function ResetConfigBtn() {
  const { saveToLocalStorage, extractLocalStorageData } = useLocalStorageContext();
  const { dispatch } = useConfigContext();

  const handleOnClick = async () => {
    const dataObj = await browser.storage.local.get([DEVTOOLS_LOCAL_MODULES_KEY]);
    const valueStr = dataObj[DEVTOOLS_LOCAL_MODULES_KEY] as string;

    // save to the original value
    saveToLocalStorage(LOCAL_MODULES_KEY, JSON.parse(valueStr));
    extractLocalStorageData();

    dispatch({
      type: "OVERRIDE_CONFIG",
      value: JSON.parse(valueStr) as Record<string, string>,
    });
  };

  return <button className="btn" onClick={handleOnClick}>Reset Config</button>;
}