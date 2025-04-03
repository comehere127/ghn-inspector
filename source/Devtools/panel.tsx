// eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
import React from 'react';
import ReactDOM from "react-dom";

import { DevTools } from "./components/DevTools";
import ErrorBoundary from "./components/ErrorBoundary";
import { ConfigContextProvider } from "./context/localConfigs.context";
import { LocalStorageProvider } from "./context/localStorage.context";
import "./panel.css";



ReactDOM.render(
  <ErrorBoundary>
    <LocalStorageProvider>
      <ConfigContextProvider>
        <DevTools />
      </ConfigContextProvider>
    </LocalStorageProvider>
  </ErrorBoundary>,
  document.getElementById("panel-root"),
);