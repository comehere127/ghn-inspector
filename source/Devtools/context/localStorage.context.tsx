import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

import browser from "webextension-polyfill";

import { Message, MessageCommand } from "../../types";
import { empty } from "../../utils/empty";
import { DEVTOOLS_LOCAL_MODULES_KEY } from "../constant";


interface LocalStorageContextProps {
	extensionStorage: Record<string, string>;
	setExtensionStorage: React.Dispatch<
		React.SetStateAction<Record<string, string>>
	>;

	activeTab: browser.Tabs.Tab | undefined;
	setActiveTab: React.Dispatch<
		React.SetStateAction<browser.Tabs.Tab | undefined>
	>;

	saveAppListToPortal: (value: unknown) => void;
	getAppListFromPortal: (data: string) => void;
	refreshAppList: () => void;
}

const LocalStorageContext = createContext<LocalStorageContextProps | undefined>(
	undefined,
);


export function LocalStorageProvider({
	children,
}:{ children: ReactNode }) {
	const [activeTab, setActiveTab] = useState<browser.Tabs.Tab | undefined>();
	const [extensionStorage, setExtensionStorage] = useState<
		Record<string, string>
		>({});
	const getAppListFromLocalStorage = useCallback(async ()=> {
		if (!activeTab || !activeTab.id) return;
		const result = await browser.runtime.sendMessage({
						command: MessageCommand.GET_PORTAL_MODULE,
						tabId: activeTab.id
		} as Message)
		setExtensionStorage(result)
	}, [activeTab])
	

	const saveAppListToPortal = useCallback(async (value: unknown) => {
		if (!activeTab || !activeTab.id) return;
		await browser.runtime.sendMessage({
						command: MessageCommand.SET_PORTAL_MODULE,
						tabId: activeTab.id,
						data: JSON.stringify(value)
		} as Message)
	},[activeTab]);

	const getAppListFromPortal = useCallback(async (data:string) =>{
		if (!activeTab || !activeTab.id) return;
		const result: Record<string, string> = {};

		try{
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const resp: any = JSON.parse(data)
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			resp?.data?.apps?.forEach((app: any) => {
				result[app?.alias] = `${app?.cdnUrl}/${app?.version}/mf-manifest.json`
			})
		} catch(error){
			console.error(error)
		}
		await browser.storage.local.set({ [DEVTOOLS_LOCAL_MODULES_KEY]: result });

		if (empty(extensionStorage)) {
			await saveAppListToPortal(result)
			await getAppListFromLocalStorage()
		}
		
	},[activeTab, extensionStorage, getAppListFromLocalStorage, saveAppListToPortal])

	const refreshAppList = useCallback(() => {
		if (!activeTab || !activeTab.id) return;
		browser.runtime.sendMessage({
			command: MessageCommand.ON_RELOAD,
			tabId: activeTab.id
		} as Message)
		
	},[activeTab])

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
				saveAppListToPortal,
				refreshAppList
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
