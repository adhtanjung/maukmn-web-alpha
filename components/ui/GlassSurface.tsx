"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// =============================================================================
// GlassSurface Component
// =============================================================================
// A reusable glassmorphism surface component for the Maukemana design system.
// Provides consistent "smoked glass" styling with backdrop blur, subtle borders,
// and premium shadows that work in both light and dark modes.
// =============================================================================

type GlassSurfaceElement = "div" | "button" | "span";

interface GlassSurfaceProps extends React.HTMLAttributes<HTMLElement> {
	/** The HTML element to render. Defaults to "div". */
	as?: GlassSurfaceElement;
	/** Shape variant: "default" (rounded-2xl) or "pill" (rounded-full). */
	variant?: "default" | "pill";
	/** Enables hover and active press animations. */
	interactive?: boolean;
	/** Additional CSS classes. */
	className?: string;
	/** Child elements. */
	children?: React.ReactNode;
}

// Base glass effect styles (shared across all variants)
const glassBaseStyles = [
	// Background with transparency
	"bg-black/3 dark:bg-white/5",
	// Backdrop blur effect
	"backdrop-blur-lg backdrop-saturate-150",
	// Subtle border
	"border border-black/5 dark:border-white/10",
	// Premium shadow with inner highlight
	"shadow-[0_4px_24px_rgba(0,0,0,0.06),inset_0_1px_0_rgba(255,255,255,0.5)]",
	"dark:shadow-[0_4px_24px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.08)]",
].join(" ");

// Variant-specific styles
const variantStyles = {
	default: "rounded-2xl",
	pill: "rounded-full",
};

// Interactive styles (hover/active states)
const interactiveStyles = [
	"transition-all",
	"hover:bg-black/5 dark:hover:bg-white/5",
	"active:scale-[0.98]",
].join(" ");

/**
 * GlassSurface - A polymorphic glassmorphism container component.
 *
 * @example
 * // Basic usage
 * <GlassSurface className="p-4">Content</GlassSurface>
 *
 * @example
 * // Interactive button with pill shape
 * <GlassSurface as="button" variant="pill" interactive className="h-9 px-4">
 *   Click me
 * </GlassSurface>
 */
const GlassSurface = React.forwardRef<HTMLElement, GlassSurfaceProps>(
	(
		{
			as: Component = "div",
			variant = "default",
			interactive = false,
			className,
			children,
			...props
		},
		ref,
	) => {
		return React.createElement(
			Component,
			{
				ref,
				className: cn(
					glassBaseStyles,
					variantStyles[variant],
					interactive && interactiveStyles,
					className,
				),
				...props,
			},
			children,
		);
	},
);

GlassSurface.displayName = "GlassSurface";

export { GlassSurface };
export type { GlassSurfaceProps };
