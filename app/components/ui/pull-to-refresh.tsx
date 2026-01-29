"use client";

import { useRef, useEffect, useState, ReactNode, forwardRef } from "react";
import { motion, useMotionValue, useTransform, animate } from "motion/react";

interface PullToRefreshProps {
	onRefresh: () => Promise<void>;
	children: ReactNode;
	className?: string;
}

export const PullToRefresh = forwardRef<HTMLDivElement, PullToRefreshProps>(
	({ onRefresh, children, className = "" }, ref) => {
		// Internal ref for the scroll logic if the parent doesn't provide one?
		// Actually, we must ensure we use the same ref for both our tracking and the parent.
		// We can use a local RefObject and useImperativeHandle, or just merge refs.
		// For simplicity, let's assume parent MIGHT pass a ref. We need our own access to it too.
		const internalRef = useRef<HTMLDivElement>(null);
		const containerRef =
			(ref as React.RefObject<HTMLDivElement>) || internalRef;

		const [isRefreshing, setIsRefreshing] = useState(false);
		const y = useMotionValue(0);

		// Transform y movement into rotation and opacity for the indicator
		// Indicator starts hidden above (-40) and enters view as we pull
		const indicatorY = useTransform(y, (latest) => latest - 50);
		const rotate = useTransform(y, [0, 80], [0, 180]);
		const opacity = useTransform(y, [0, 40], [0, 1]);

		useEffect(() => {
			const container = containerRef.current;
			if (!container) return;

			let startY = 0;
			let isDragging = false;
			// Threshold to trigger refresh
			const REFRESH_THRESHOLD = 80;

			const handleTouchStart = (e: TouchEvent) => {
				if (container.scrollTop === 0) {
					startY = e.touches[0].clientY;
					// IMPORTANT: We check this to avoiding interfering with normal scrolling
					// if we aren't at the top
				}
			};

			const handleTouchMove = (e: TouchEvent) => {
				const currentY = e.touches[0].clientY;
				const diff = currentY - startY;

				// If pulling down at the top
				if (container.scrollTop === 0 && diff > 0 && !isRefreshing) {
					// Prevent native scroll (overscroll)
					if (e.cancelable) {
						e.preventDefault();
					}
					isDragging = true;
					// Apply resistance (logarithmic-ish or simple division)
					// dampening the pull so it feels elastic
					y.set(Math.pow(diff, 0.8));
				} else {
					isDragging = false;
				}
			};

			const handleTouchEnd = async () => {
				if (!isDragging || isRefreshing) return;
				isDragging = false;

				const currentY = y.get();
				if (currentY > REFRESH_THRESHOLD) {
					// Trigger refresh
					setIsRefreshing(true);
					animate(y, REFRESH_THRESHOLD, {
						type: "spring",
						stiffness: 300,
						damping: 25,
					});

					try {
						await onRefresh();
					} finally {
						// Reset
						setIsRefreshing(false);
						animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
					}
				} else {
					// Spring back to 0 without refreshing
					animate(y, 0, { type: "spring", stiffness: 300, damping: 25 });
				}
			};

			// Passive: false is crucial for preventing default
			container.addEventListener("touchstart", handleTouchStart, {
				passive: true,
			});
			container.addEventListener("touchmove", handleTouchMove, {
				passive: false,
			});
			container.addEventListener("touchend", handleTouchEnd);

			return () => {
				container.removeEventListener("touchstart", handleTouchStart);
				container.removeEventListener("touchmove", handleTouchMove);
				container.removeEventListener("touchend", handleTouchEnd);
			};
		}, [onRefresh, y, isRefreshing, containerRef]);

		return (
			<div className="relative h-full w-full overflow-hidden">
				{/* Refresh Indicator */}
				<motion.div
					className="absolute left-0 right-0 z-50 flex justify-center pointer-events-none"
					style={{ top: indicatorY, opacity }}
				>
					<div className="bg-white dark:bg-zinc-800 text-primary rounded-full p-2.5 shadow-lg border border-border/10 flex items-center justify-center">
						{isRefreshing ? (
							<span className="material-symbols-outlined text-xl animate-spin text-primary">
								progress_activity
							</span>
						) : (
							<motion.span
								className="material-symbols-outlined text-xl text-primary"
								style={{ rotate }}
							>
								arrow_downward
							</motion.span>
						)}
					</div>
				</motion.div>

				{/* Scroll Container */}
				<motion.div
					ref={containerRef}
					style={{ y: isRefreshing ? 0 : y }} // Move container down? Or just keep it and show indicator?
					// Usually nicer to move content down slightly or just keep it static and overlay.
					// Let's simpler overlay: y is mostly for the indicator, but we can elastic pull the content too.
					// NOTE: transform on snap-container might be weird. Let's try just transforming the content wrapper if needed.
					// For now, let's keep the snap container STATIC and just overlay the indicator.
					// It's safer for 'snap' physics.
					className={`h-full w-full overflow-y-scroll snap-y snap-mandatory snap-always no-scrollbar scroll-smooth overscroll-contain ${className}`}
				>
					{children}
				</motion.div>
			</div>
		);
	},
);

PullToRefresh.displayName = "PullToRefresh";
