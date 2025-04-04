import React from "react";

import browser from 'webextension-polyfill';

import { empty } from "../../utils/empty";
import { DEVTOOLS_LOCAL_MODULES_KEY } from "../constant";
import { useConfigContext } from "../context/localConfigs.context";
import { useLocalStorageContext } from "../context/localStorage.context";
import { useApplicationListData } from "../hooks/useApplicationListData";
export function ApplicationList() {
  const { data } = useApplicationListData();
  const { config, dispatch, setNotify } = useConfigContext();
    const { saveAppListToPortal, setExtensionStorage, refreshAppList} = useLocalStorageContext();

  React.useEffect(() => {
    if (!data) return;
    dispatch({
      type: "OVERRIDE_CONFIG",
      value: data,
    });
  }, [data, dispatch]);

  const handleInputChange = (key: string, value: string) => {
    dispatch({
      type: "SET_CONFIG",
      key,
      value,
    });
  };

  const onReset = React.useCallback(async () => {
    const stored= await browser.storage.local.get()||{}
    saveAppListToPortal(stored[DEVTOOLS_LOCAL_MODULES_KEY])
    setExtensionStorage(stored[DEVTOOLS_LOCAL_MODULES_KEY])
    setNotify("Restore config successful!")
  }, [saveAppListToPortal, setExtensionStorage, setNotify])
  
  const onUpdate = React.useCallback(() => {
    saveAppListToPortal(config);
    setNotify("Update config successful!")
  }, [config, saveAppListToPortal, setNotify]);

  if (empty(data)) {
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    return <h2>No data. <a onClick={refreshAppList} href="javascript:void(0)">Click here to get applications</a></h2>;
  }

  return (
    <React.Fragment>
      <div className="mb-4 devtools-btn-group">
         <button className="btn" onClick={onUpdate}>Update</button>
        <button className="btn" onClick={onReset}>Reset</button>
        {empty(config) && <button className="btn outline" onClick={refreshAppList}>Refresh</button>}
      </div>
      <table className="app-list">
        <thead>
        <tr>
          <th>Application</th>
          <th>URL</th>
        </tr>
        </thead>
        <tbody>
        {Object.entries(config).map(([key, value]) => (
          <tr key={key}>
            <td className="tbl-key"><strong>{key}</strong></td>
            <td>
              <input
                className="input"
                type="text"
                value={value}
                onChange={(event) => handleInputChange(key, event.currentTarget.value)}
              />
            </td>
          </tr>
        ))}
        </tbody>
      </table>
    </React.Fragment>
  );
}