import React from "react";

interface ApplicationListProps {
  localStorageData: Record<string, unknown>;
}

export function ApplicationList({ localStorageData }: ApplicationListProps) {
  return (
    <div>
      <h1>Application List</h1>
      <ul>
        {Object.entries(localStorageData).map(([key, value]) => (
          <li key={key}>
            <strong>{key}:</strong> {value}
          </li>
        ))}
      </ul>
    </div>
  );
}