"use client";

import { createContext, useContext } from "react";

interface POIDetailContextType {
	close: (skipNavigation?: boolean) => void;
}

const POIDetailContext = createContext<POIDetailContextType | undefined>(
	undefined,
);

export function POIDetailProvider({
	children,
	onClose,
}: {
	children: React.ReactNode;
	onClose: (skipNavigation?: boolean) => void;
}) {
	return (
		<POIDetailContext.Provider value={{ close: (skip) => onClose(skip) }}>
			{children}
		</POIDetailContext.Provider>
	);
}

export function usePOIDetail() {
	const context = useContext(POIDetailContext);
	return context;
}
