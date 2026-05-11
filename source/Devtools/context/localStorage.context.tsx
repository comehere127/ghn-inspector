import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

import browser from "webextension-polyfill";

import { MessageCommand, type Message } from "../../types";
import { empty } from "../../utils/empty";
import {
	EXTENSION_API_DEFAULTS_KEY,
	EXTENSION_OVERRIDES_KEY,
	getHostnameFromUrl,
} from "../constant";

interface LocalStorageContextProps {
	extensionStorage: Record<string, string>;
	setExtensionStorage: React.Dispatch<
		React.SetStateAction<Record<string, string>>
	>;

	activeTab: browser.Tabs.Tab | undefined;
	setActiveTab: React.Dispatch<
		React.SetStateAction<browser.Tabs.Tab | undefined>
	>;

	apiAvailable: boolean | null;
	saveAppListToPortal: (value: unknown) => void;
	getAppListFromPortal: (data: string) => void;
	refreshAppList: () => void;
}

const LocalStorageContext = createContext<LocalStorageContextProps | undefined>(
	undefined,
);

export function LocalStorageProvider({ children }: { children: ReactNode }) {
	const [activeTab, setActiveTab] = useState<browser.Tabs.Tab | undefined>();
	const [extensionStorage, setExtensionStorage] = useState<
		Record<string, string>
	>({});
	const [apiAvailable, setApiAvailable] = useState<boolean | null>(null);
	const getAppListFromLocalStorage = useCallback(async () => {
		if (!activeTab || !activeTab.id) return;
		const hostname = getHostnameFromUrl(activeTab.url);

		// Probe the page first so we can set apiAvailable correctly.
		const pageResult = await browser.runtime.sendMessage({
			command: MessageCommand.GET_PORTAL_MODULE,
			tabId: activeTab.id,
		} as Message);

		if (pageResult === null) {
			setApiAvailable(false);
			setExtensionStorage({});
			return;
		}
		setApiAvailable(true);

		// Try to restore from hostname-keyed extension memory.
		if (hostname) {
			const stored = (await browser.storage.local.get(EXTENSION_OVERRIDES_KEY)) || {};
			const allOverrides =
				(stored[EXTENSION_OVERRIDES_KEY] as Record<string, Record<string, string>>) ||
				{};
			const hostSlice = allOverrides[hostname];
			if (hostSlice && !empty(hostSlice)) {
				// Push memorized config back into the page's localStorage so useLoadModule sees it.
				await browser.runtime.sendMessage({
					command: MessageCommand.SET_PORTAL_MODULE,
					tabId: activeTab.id,
					data: JSON.stringify(hostSlice),
				} as Message);
				setExtensionStorage(hostSlice);
				return;
			}
		}

		// No memorized config for this hostname — fall back to whatever the page already has.
		setExtensionStorage(pageResult);
	}, [activeTab]);

	const saveAppListToPortal = useCallback(
		async (value: unknown) => {
			if (!activeTab || !activeTab.id) return;
			const hostname = getHostnameFromUrl(activeTab.url);

			// Write through to the page.
			await browser.runtime.sendMessage({
				command: MessageCommand.SET_PORTAL_MODULE,
				tabId: activeTab.id,
				data: JSON.stringify(value),
			} as Message);

			// Persist in extension memory under the hostname.
			if (hostname) {
				const stored = (await browser.storage.local.get(EXTENSION_OVERRIDES_KEY)) || {};
				const allOverrides =
					(stored[EXTENSION_OVERRIDES_KEY] as Record<string, unknown>) || {};
				allOverrides[hostname] = value;
				await browser.storage.local.set({
					[EXTENSION_OVERRIDES_KEY]: allOverrides,
				});
			}
		},
		[activeTab],
	);

	const getAppListFromPortal = useCallback(
		async (data: string) => {
			if (!activeTab || !activeTab.id) return;
			const hostname = getHostnameFromUrl(activeTab.url);
			const result: Record<string, string> = {};

			try {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				const resp: any = JSON.parse(data);
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				resp?.data?.apps?.forEach((app: any) => {
					result[app?.alias] =
						`${app?.cdnUrl}/${app?.version}/mf-manifest.json`;
				});
			} catch (error) {
				console.error(error);
			}

			// Save API defaults keyed by hostname.
			if (hostname) {
				const stored =
					(await browser.storage.local.get(EXTENSION_API_DEFAULTS_KEY)) || {};
				const allDefaults =
					(stored[EXTENSION_API_DEFAULTS_KEY] as Record<string, unknown>) || {};
				allDefaults[hostname] = result;
				await browser.storage.local.set({
					[EXTENSION_API_DEFAULTS_KEY]: allDefaults,
				});
			}

			// Seed the page only if the user hasn't already set anything.
			if (empty(extensionStorage)) {
				await saveAppListToPortal(result);
				await getAppListFromLocalStorage();
			}
		},
		[
			activeTab,
			extensionStorage,
			getAppListFromLocalStorage,
			saveAppListToPortal,
		],
	);

	const refreshAppList = useCallback(() => {
		if (!activeTab || !activeTab.id) return;
		browser.runtime.sendMessage({
			command: MessageCommand.ON_RELOAD,
			tabId: activeTab.id,
		} as Message);
	}, [activeTab]);

	useEffect(() => {
		getAppListFromLocalStorage();
	}, [activeTab, getAppListFromLocalStorage]);

	return (
		<LocalStorageContext.Provider
			value={{
				getAppListFromPortal,
				extensionStorage,
				setExtensionStorage,
				activeTab,
				setActiveTab,
				apiAvailable,
				saveAppListToPortal,
				refreshAppList,
			}}
		>
			{children}
		</LocalStorageContext.Provider>
	);
}

export const useLocalStorageContext = () => {
	const context = useContext(LocalStorageContext);
	if (!context) {
		throw new Error(
			"useLocalStorageContext must be used within a LocalStorageProvider",
		);
	}
	return context;
};
