import React, { useEffect } from "react";

import { useConfigContext } from "../context/localConfigs.context";
import { useApplicationListData } from "../hooks/useApplicationListData";
import { ResetConfigBtn } from "./ResetConfigBtn";
import { UpdateConfigBtn } from "./UpdateConfigBtn";

/**
 * ApplicationList component
 * @constructor
 * Show the list of applications
 * @return {JSX.Element} ApplicationList component
 */
export function ApplicationList() {
  const { data } = useApplicationListData();
  const { config, dispatch } = useConfigContext();

  useEffect(() => {
    if (!data) return;
    dispatch({
      type: "OVERRIDE_CONFIG",
      value: data,
    });
  }, []);

  const handleInputChange = (key: string, value: string) => {
    dispatch({
      type: "SET_CONFIG",
      key,
      value,
    });
  };

  if (!data) {
    return <h2>No data</h2>;
  }

  return (
    <React.Fragment>
      <div className="mb-4 devtools-btn-group">
        <UpdateConfigBtn />
        <ResetConfigBtn />
      </div>

      <table className="app-list">
        <thead>
        <tr>
          <th>App</th>
          <th>URL</th>
        </tr>
        </thead>
        <tbody>
        {Object.entries(config).map(([key, value]) => (
          <tr key={key}>
            <td><strong>{key}</strong></td>
            <td>
              <input
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