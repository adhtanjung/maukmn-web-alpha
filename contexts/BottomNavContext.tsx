"use client";

import React, {
	createContext,
	useContext,
	useState,
	useCallback,
	useRef,
	useEffect,
	ReactNode,
} from "react";

interface BottomNavContextValue {
	/** Whether BottomNav should be visible */
	showBottomNav: boolean;
	/** Set BottomNav visibility */
	setShowBottomNav: (show: boolean) => void;
	/** Optional handler for home button click */
	onHomeClick?: () => void | Promise<void>;
	/** Register a home click handler (used by pages like Feed) */
	registerHomeClickHandler: (handler: () => void | Promise<void>) => void;
	/** Unregister the home click handler */
	unregisterHomeClickHandler: () => void;
}

const BottomNavContext = createContext<BottomNavContextValue | undefined>(
	undefined,
);

export function BottomNavProvider({ children }: { children: ReactNode }) {
	const [showBottomNav, setShowBottomNav] = useState(true);
	const onHomeClickRef = useRef<(() => void | Promise<void>) | undefined>(
		undefined,
	);

	const registerHomeClickHandler = useCallback(
		(handler: () => void | Promise<void>) => {
			onHomeClickRef.current = handler;
		},
		[],
	);

	const unregisterHomeClickHandler = useCallback(() => {
		onHomeClickRef.current = undefined;
	}, []);

	const onHomeClick = useCallback(() => {
		if (onHomeClickRef.current) {
			onHomeClickRef.current();
		}
	}, []);

	return (
		<BottomNavContext.Provider
			value={{
				showBottomNav,
				setShowBottomNav,
				onHomeClick,
				registerHomeClickHandler,
				unregisterHomeClickHandler,
			}}
		>
			{children}
		</BottomNavContext.Provider>
	);
}

export function useBottomNav() {
	const context = useContext(BottomNavContext);
	if (!context) {
		throw new Error("useBottomNav must be used within BottomNavProvider");
	}
	return context;
}

/**
 * Hook to automatically hide BottomNav on mount and restore on unmount.
 * Useful for fullscreen pages or overlays.
 */
export function useHideBottomNav() {
	const { setShowBottomNav } = useBottomNav();

	useEffect(() => {
		setShowBottomNav(false);
		return () => setShowBottomNav(true);
	}, [setShowBottomNav]);
}
