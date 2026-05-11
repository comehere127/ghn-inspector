import React from "react";

import browser from "webextension-polyfill";

import { MessageCommand, type Message } from "../../types";
import { useLocalStorageContext } from "../context/localStorage.context";

export function DevelopmentToggle() {
  const { activeTab, refreshAppList } = useLocalStorageContext();
  const [enabled, setEnabled] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  const fetchState = React.useCallback(async () => {
    if (!activeTab?.id) return;
    const result = await browser.runtime.sendMessage({
      command: MessageCommand.GET_LOCAL_DEVELOPMENT,
      tabId: activeTab.id,
    } as Message);
    setEnabled(Boolean(result));
    setLoading(false);
  }, [activeTab]);

  React.useEffect(() => {
    fetchState();
  }, [fetchState]);

  const onToggle = React.useCallback(
    async (next: boolean) => {
      if (!activeTab?.id) return;
      await browser.runtime.sendMessage({
        command: MessageCommand.SET_LOCAL_DEVELOPMENT,
        tabId: activeTab.id,
        data: next,
      } as unknown as Message);
      setEnabled(next);
    },
    [activeTab],
  );

  if (loading) return null;

  return (
    <div className="dev-toggle">
      <label>
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => onToggle(e.currentTarget.checked)}
        />
        <span>Enable development mode (overrides take effect)</span>
      </label>
      <button className="btn outline" onClick={refreshAppList}>
        Reload page
      </button>
    </div>
  );
}
