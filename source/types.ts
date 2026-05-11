
export type Message = {
  command: MessageCommand;
  tabId: number;
  data?: string;
};

export type StorageClearResponse = boolean;


export const enum MessageCommand {
  GET_TAB_INFO = 'get-tab-info',
  GET_LOCAL_DEVELOPMENT = "get-local-development",
  SET_LOCAL_DEVELOPMENT = "set-local-development",
  GET_PORTAL_MODULE = "get-portal-module",
  SET_PORTAL_MODULE = "set-portal-module",
  ON_RELOAD = "on-reload"
}

/** Mirror of portal's GhnInspectorAPI. Kept in sync manually. */
export interface PortalInspectorAPI {
  isDevelopmentEnabled: () => boolean;
  enableDevelopment: () => void;
  disableDevelopment: () => void;
  getLocalModules: () => Record<string, string>;
  setLocalModules: (modules: Record<string, string>) => void;
  reload: () => void;
}