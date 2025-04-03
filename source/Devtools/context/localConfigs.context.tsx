import React, { createContext, useReducer, ReactNode, useContext, useState } from "react";

type ConfigState = Record<string, string>;

type ConfigAction =
  | { type: "OVERRIDE_CONFIG"; value: ConfigState }
  | { type: "SET_CONFIG"; key: string; value: string };

const ConfigContext = createContext<{
  config: ConfigState;
  dispatch: React.Dispatch<ConfigAction>;
  message:string;
  setNotify: React.Dispatch<React.SetStateAction<string>>;
} | undefined>(undefined);

const configReducer = (state: ConfigState, action: ConfigAction): ConfigState => {
  switch (action.type) {
    case "OVERRIDE_CONFIG":
      return { ...action.value };

    case "SET_CONFIG":
      return { ...state, [action.key]: action.value };

    default:
      return state;
  }
};

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigContextProvider({ children }: ConfigProviderProps) {
  const [config, dispatch] = useReducer(configReducer, {});
  const [message, setNotify] = useState<string>("")

  return (
    <ConfigContext.Provider value={{ config, dispatch,
      message, setNotify
     }}>
      {children}
    </ConfigContext.Provider>
  );
}

export const useConfigContext = () => {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error("useConfig must be used within a ConfigProvider");
  }
  return context;
};