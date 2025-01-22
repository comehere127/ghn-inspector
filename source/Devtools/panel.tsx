import * as React from "react";
import ReactDOM from "react-dom";

import ErrorBoundary from "../Popup/ErrorBoundary";
import { DevTools } from "./components/DevTools";
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
