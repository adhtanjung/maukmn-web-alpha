"use client";

import React, { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface FixedFooterProps {
	/**
	 * Footer content
	 */
	children: ReactNode;
	/**
	 * Whether the footer should be transparent with blur. Default: false
	 */
	transparent?: boolean;
	/**
	 * Whether to show border at top. Default: true
	 */
	showBorder?: boolean;
	/**
	 * Additional classes for the footer container
	 */
	className?: string;
	/**
	 * Additional classes for the content wrapper
	 */
	contentClassName?: string;
}

/**
 * FixedFooter - Reusable fixed footer component for action bars
 *
 * Features:
 * - Fixed positioning at bottom with safe-area-inset-bottom handling
 * - Glassmorphism backdrop blur
 * - Used for action bars in overlays (e.g., CreatePOIOverlay)
 *
 * @example
 * ```tsx
 * <FixedFooter>
 *   <Button onClick={handleCancel}>Cancel</Button>
 *   <Button onClick={handleSubmit}>Submit</Button>
 * </FixedFooter>
 * ```
 */
export function FixedFooter({
	children,
	transparent = false,
	showBorder = true,
	className,
	contentClassName,
}: FixedFooterProps) {
	return (
		<footer
			className={cn(
				"flex-none z-50 w-full",
				"pb-[env(safe-area-inset-bottom)]",
				transparent
					? "bg-background/80 backdrop-blur-xl"
					: "bg-background border-t",
				showBorder && "border-border",
				className,
			)}
		>
			<div className={cn("p-4", contentClassName)}>{children}</div>
		</footer>
	);
}

export default FixedFooter;
