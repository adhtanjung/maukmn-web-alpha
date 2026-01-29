"use client";

import { useRef, useState, useCallback } from "react";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { cn } from "@/lib/utils";

interface VoteRailProps {
	score: number;
	userVote: number; // -1 | 0 | 1
	onVote: (type: "up" | "down") => void;
	className?: string;
}

export default function VoteRail({
	score,
	userVote,
	onVote,
	className,
}: VoteRailProps) {
	const [isPressing, setIsPressing] = useState(false);
	const longPressTimer = useRef<NodeJS.Timeout | null>(null);
	const DOWNVOTE_THRESHOLD_MS = 800;

	// Handle Upvote (Simple Tap)
	const handleUpvote = (e: React.MouseEvent | React.TouchEvent) => {
		e.stopPropagation();
		// Haptic feedback
		if (navigator.vibrate) navigator.vibrate(10);
		onVote("up");
	};

	// Handle Downvote Start (Touch/Click)
	const handleDownStart = useCallback(
		(e: React.MouseEvent | React.TouchEvent) => {
			e.stopPropagation();
			setIsPressing(true);

			longPressTimer.current = setTimeout(() => {
				// Long press successful
				if (navigator.vibrate) navigator.vibrate([20, 50, 20]); // Heavy feedback
				onVote("down");
				setIsPressing(false);
			}, DOWNVOTE_THRESHOLD_MS);
		},
		[onVote],
	);

	// Handle Downvote End (Touch/Click Release)
	const handleDownEnd = useCallback(
		(e: React.MouseEvent | React.TouchEvent) => {
			e.stopPropagation();
			setIsPressing(false);

			if (longPressTimer.current) {
				clearTimeout(longPressTimer.current);
				longPressTimer.current = null;
				// If released too early, show warning
				// Only if we haven't already voted down (managed by timer execution)
				// Since timer clears self, if it's still running it wasn't triggered
				// toast.info("Long press to downvote", {
				// 	duration: 1500,
				// 	className: "bg-background/80 backdrop-blur-md text-foreground",
				// });
				console.log("Long press to downvote");
				if (navigator.vibrate) navigator.vibrate(50); // Warning buzz
			}
		},
		[],
	);

	const handleDownCancel = useCallback(() => {
		setIsPressing(false);
		if (longPressTimer.current) {
			clearTimeout(longPressTimer.current);
			longPressTimer.current = null;
		}
	}, []);

	return (
		<div
			className={cn("flex flex-col items-center gap-1", className)}
			onClick={(e) => e.stopPropagation()}
		>
			{/* UPVOTE */}
			<GlassSurface
				as="button"
				interactive
				variant="pill"
				aria-label="Upvote"
				className={cn(
					"w-12 h-12 flex items-center justify-center backdrop-blur-md! border-white/20! transition-all duration-200",
					userVote === 1
						? "bg-emerald-500/40! text-emerald-400 border-emerald-400/50!"
						: "bg-black/20! text-white hover:bg-black/40!",
				)}
				onClick={handleUpvote}
			>
				<span
					className={cn(
						"material-symbols-outlined text-[32px] transition-transform",
						userVote === 1 ? "filled scale-110" : "",
					)}
				>
					arrow_upward
				</span>
			</GlassSurface>

			{/* SCORE */}
			<div className="flex flex-col items-center justify-center min-h-[24px]">
				<span
					className={cn(
						"text-sm font-black shadow-black/50 drop-shadow-md transition-colors leading-none",
						userVote === 1
							? "text-emerald-400"
							: userVote === -1
								? "text-red-400"
								: "text-white",
					)}
				>
					{score > 0 ? `+${score}` : score}
				</span>
			</div>

			{/* DOWNVOTE */}
			<GlassSurface
				as="button"
				interactive
				variant="pill"
				aria-label="Downvote (Long Press)"
				className={cn(
					"relative w-12 h-12 flex items-center justify-center backdrop-blur-md! border-white/20! transition-all duration-200 overflow-hidden",
					userVote === -1
						? "bg-red-500/40! text-red-400 border-red-400/50!"
						: "bg-black/20! text-white hover:bg-black/40!",
					isPressing && userVote !== -1 && "scale-95 border-red-400/30!",
				)}
				// Touch Events for Mobile
				onTouchStart={handleDownStart}
				onTouchEnd={handleDownEnd}
				onTouchCancel={handleDownCancel}
				// Mouse Events for Desktop
				onMouseDown={handleDownStart}
				onMouseUp={handleDownEnd}
				onMouseLeave={handleDownCancel}
			>
				{/* Progress Fill for Long Press */}
				{isPressing && userVote !== -1 && (
					<div
						className="absolute inset-0 bg-red-500/30 origin-bottom"
						style={{
							animation: `fillUp ${DOWNVOTE_THRESHOLD_MS}ms linear forwards`,
						}}
					/>
				)}

				<span
					className={cn(
						"material-symbols-outlined text-[32px] transition-transform z-10",
						userVote === -1 ? "filled scale-110" : "",
					)}
				>
					arrow_downward
				</span>
			</GlassSurface>

			<style jsx>{`
				@keyframes fillUp {
					from {
						transform: scaleY(0);
					}
					to {
						transform: scaleY(1);
					}
				}
			`}</style>
		</div>
	);
}
