"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { cn } from "@/lib/utils";
import BottomNav from "./BottomNav";

// Height constants for layout calculations
export const BOTTOM_NAV_HEIGHT = 80; // px, not including safe area
export const HEADER_HEIGHT = 56; // px, not including safe area

// Context for controlling layout visibility
interface MobileShellContextValue {
	showBottomNav: boolean;
}

const MobileShellContext = createContext<MobileShellContextValue>({
	showBottomNav: true,
});

export const useMobileShell = () => useContext(MobileShellContext);

export interface MobileShellProps {
	/**
	 * Optional header content. Use FixedHeader component for consistent styling.
	 */
	header?: ReactNode;
	/**
	 * Main scrollable content
	 */
	children: ReactNode;
	/**
	 * Whether to show the bottom navigation. Default: true
	 */
	showBottomNav?: boolean;
	/**
	 * Props to pass to BottomNav component
	 */
	bottomNavProps?: {
		onHomeClick?: () => void;
	};
	/**
	 * Additional classes for the shell container
	 */
	className?: string;
	/**
	 * Additional classes for the content area
	 */
	contentClassName?: string;
	/**
	 * Whether to add bottom padding for the nav. Default: true when showBottomNav is true
	 */
	addBottomPadding?: boolean;
	/**
	 * Generic footer slot.
	 * If provided, this will be rendered at the bottom fixed position.
	 * Can be used for custom action bars in wizards/forms.
	 */
	footer?: ReactNode;
}

/**
 * MobileShell - Professional mobile layout wrapper
 *
 * Provides a consistent layout structure with:
 * - Fixed/sticky header slot
 * - Scrollable content area with proper safe-area handling
 * - Fixed bottom navigation (optional)
 * - Generic footer slot (optional)
 *
 * @example
 * ```tsx
 * <MobileShell
 *   header={<TopHeader />}
 *   footer={<CustomFooter />}
 *   showBottomNav={false}
 * >
 *   <YourContent />
 * </MobileShell>
 * ```
 */
export function MobileShell({
	header,
	children,
	showBottomNav = true,
	bottomNavProps,
	className,
	contentClassName,
	addBottomPadding,
	footer,
}: MobileShellProps) {
	// Default addBottomPadding to match showBottomNav status, but allow override
	// If custom footer is present, we might want padding too, but that depends on the footer height.
	// For now, let consumer handle padding for custom footer via contentClassName if needed,
	// or we could add a `footerHeight` prop later.
	// But usually FixedFooter handles its own spacing/padding needs on the body via "pb-..." usage?
	// Actually MobileShell `main` handles padding for BottomNav.
	// For custom footer, we leave it to the consumer or assume FixedFooter is used which might need manual padding on main.
	const shouldAddBottomPadding = addBottomPadding ?? (showBottomNav && !footer);

	return (
		<MobileShellContext.Provider value={{ showBottomNav }}>
			<div
				className={cn(
					"relative h-dvh w-full flex flex-col overflow-hidden bg-background",
					className,
				)}
			>
				{/* Header Slot */}
				{header}

				{/* Scrollable Content Area */}
				<main
					className={cn(
						"flex-1 min-h-0 overflow-y-auto overscroll-contain",
						shouldAddBottomPadding &&
							"pb-[calc(80px+1rem+env(safe-area-inset-bottom))]",
						contentClassName,
					)}
				>
					{children}
				</main>

				{/* Footer Slot (Custom) */}
				{footer}

				{/* Fixed Bottom Navigation (Standard) */}
				{showBottomNav && !footer && <BottomNav {...bottomNavProps} />}
			</div>
		</MobileShellContext.Provider>
	);
}

export default MobileShell;
