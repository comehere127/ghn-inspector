import * as React from "react";
import ReactDOM from "react-dom";

import ErrorBoundary from "../Popup/ErrorBoundary";
import { DevTools } from "./components/DevTools";
import { LocalStorageProvider } from "./context/localStorage.context";
import "./panel.css";

ReactDOM.render(
  <ErrorBoundary>
    <LocalStorageProvider>
      <DevTools />
    </LocalStorageProvider>
  </ErrorBoundary>,
  document.getElementById("panel-root"),
);
