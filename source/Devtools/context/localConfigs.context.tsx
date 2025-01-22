import React, { createContext, useReducer, ReactNode, useContext } from "react";

type ConfigState = Record<string, string>;

type ConfigAction =
  | { type: "OVERRIDE_CONFIG"; value: ConfigState }
  | { type: "SET_CONFIG"; key: string; value: string }
  | { type: "REMOVE_CONFIG"; key: string };

const ConfigContext = createContext<{
  config: ConfigState;
  dispatch: React.Dispatch<ConfigAction>;
} | undefined>(undefined);

const configReducer = (state: ConfigState, action: ConfigAction): ConfigState => {
  switch (action.type) {
    case "OVERRIDE_CONFIG":
      return { ...action.value };

    case "SET_CONFIG":
      return { ...state, [action.key]: action.value };

    case "REMOVE_CONFIG":
      // eslint-disable-next-line no-unused-vars,no-case-declarations
      const { [action.key]: _removedKey, ...rest } = state;
      return rest;

    default:
      return state;
  }
};

interface ConfigProviderProps {
  children: ReactNode;
}

export function ConfigContextProvider({ children }: ConfigProviderProps) {
  const [config, dispatch] = useReducer(configReducer, {});

  return (
    <ConfigContext.Provider value={{ config, dispatch }}>
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