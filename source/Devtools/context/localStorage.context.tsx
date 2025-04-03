import React, {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type ReactNode,
} from "react";

import browser from "webextension-polyfill";

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

	saveAppListToPortal: (key: string, value: unknown) => void;
	getAppListFromPortal: (data:string) => void;
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
		browser.storage.local.set({ [DEVTOOLS_LOCAL_MODULES_KEY]: result });
	},[activeTab])

	const  getAppListFromLocalStorage = useCallback(async ()=> {
		if (!activeTab || !activeTab.id) return;

		const result = await browser.scripting.executeScript({
			target: { tabId: activeTab.id! },
			func: () => {
				let data: Record<string, string> = {};
				const modules = localStorage.getItem("ghn_mfe_local_modules") || ""
				try{
					data= JSON.parse(modules) as Record<string,string>
				} catch(error){
					console.error(error)
				}
				return data;
			},
		});

		if (result[0]) {
			setExtensionStorage(result[0].result as Record<string, string>);
		}
	},[activeTab])

	const saveAppListToPortal = async (key: string, value: unknown) => {
		if (!activeTab || !activeTab.id) return;

		await browser.scripting.executeScript({
			target: { tabId: activeTab.id! },
			func: (key, value) => localStorage.setItem(key, JSON.stringify(value)),
			args: [key, value],
		});
	};


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
