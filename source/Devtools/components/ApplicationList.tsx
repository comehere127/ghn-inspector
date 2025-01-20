import React from "react";

import { useApplicationListData } from "../hooks/useApplicationListData";

/**
 * ApplicationList component
 * @param localStorageData
 * @constructor
 * Show the list of applications
 * @return {JSX.Element} ApplicationList component
 */
export function ApplicationList() {
  const { data } = useApplicationListData();

  if (!data) {
    return <h2>No data</h2>;
  }

  return (
    <div>
      <ul>
        {Object.entries(data).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {value}
          </li>
        ))}
      </ul>
    </div>
  );
}