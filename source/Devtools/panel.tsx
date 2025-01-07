import * as React from "react";
import ReactDOM from "react-dom";

import ErrorBoundary from "../Popup/ErrorBoundary";
import Popup from "../Popup/Popup";
import { PopupProvider } from "../Popup/PopupContext";

ReactDOM.render(
  <ErrorBoundary>
    <PopupProvider>
      <Popup />
    </PopupProvider>
  </ErrorBoundary>,
  document.getElementById("panel-root"),
);
