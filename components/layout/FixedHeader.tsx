"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FixedHeaderProps {
	/**
	 * Left slot content (e.g., back button)
	 */
	left?: ReactNode;
	/**
	 * Center slot content (e.g., title)
	 */
	center?: ReactNode;
	/**
	 * Right slot content (e.g., action buttons)
	 */
	right?: ReactNode;
	/**
	 * Full-width children (overrides left/center/right slots)
	 */
	children?: ReactNode;
	/**
	 * Whether the header should be transparent with blur. Default: false
	 */
	transparent?: boolean;
	/**
	 * Whether to show border at bottom. Default: true
	 */
	showBorder?: boolean;
	/**
	 * Additional classes for the header container
	 */
	className?: string;
}

/**
 * FixedHeader - Reusable sticky header component
 *
 * Features:
 * - Sticky positioning with safe-area-inset-top handling
 * - Glassmorphism backdrop blur
 * - Flexible slot-based content (left/center/right) or full-width children
 * - Optional transparency mode
 *
 * @example
 * ```tsx
 * // With slots
 * <FixedHeader
 *   left={<BackButton />}
 *   center={<h1>Page Title</h1>}
 *   right={<MenuButton />}
 * />
 *
 * // With children
 * <FixedHeader transparent>
 *   <CustomHeaderContent />
 * </FixedHeader>
 * ```
 */
export function FixedHeader({
	left,
	center,
	right,
	children,
	transparent = false,
	showBorder = true,
	className,
}: FixedHeaderProps) {
	return (
		<header
			className={cn(
				"sticky top-0 z-40 w-full",
				"pt-[env(safe-area-inset-top)]",
				transparent
					? "bg-background/80 backdrop-blur-xl"
					: "bg-background/95 backdrop-blur-md",
				showBorder && "border-b border-border/50",
				className,
			)}
		>
			{children ? (
				// Full-width children mode
				<div className="px-4 py-3">{children}</div>
			) : (
				// Slot-based mode
				<div className="flex items-center justify-between px-4 py-3 min-h-[56px]">
					{/* Left Slot */}
					<div className="flex items-center min-w-[48px]">{left}</div>

					{/* Center Slot - grows and centers content */}
					<div className="flex-1 flex items-center justify-center px-2">
						{center}
					</div>

					{/* Right Slot */}
					<div className="flex items-center justify-end min-w-[48px]">
						{right}
					</div>
				</div>
			)}
		</header>
	);
}

export default FixedHeader;
