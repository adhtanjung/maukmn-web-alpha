"use client";

import { GlassSurface } from "@/components/ui/GlassSurface";
import { cn } from "@/lib/utils";

interface RankBadgeProps {
	rank?: number; // 1-5 for Top 5
	votesNeeded?: number; // For nominees
	className?: string; // Additional positioning
}

export default function RankBadge({
	rank,
	votesNeeded = 5,
	className,
}: RankBadgeProps) {
	const isRanked = rank && rank <= 5;

	return (
		<div className={cn("flex flex-col items-start gap-1", className)}>
			<GlassSurface
				variant="pill"
				className={cn(
					"px-3 py-1.5 flex items-center gap-2 backdrop-blur-xl!",
					isRanked
						? "bg-black/40! border-white/10!"
						: "bg-black/30! border-white/30!",
				)}
			>
				{isRanked ? (
					<>
						<div className="flex items-center justify-center w-5 h-5 rounded-full bg-amber-400 text-black text-[11px] font-black leading-none shadow-sm">
							{rank}
						</div>
						<span className="text-white font-bold text-xs tracking-wide">
							Top 5
						</span>
					</>
				) : (
					<>
						<span className="material-symbols-outlined text-white/70 text-[16px]">
							how_to_vote
						</span>
						<div className="flex flex-col">
							<span className="text-white font-bold text-xs tracking-wide">
								Nominee
							</span>
						</div>
					</>
				)}
			</GlassSurface>

			{/* Sub-label for nominees */}
			{!isRanked && (
				<span className="ml-2 text-[10px] font-medium text-white/80 drop-shadow-md">
					Needs {votesNeeded} more votes
				</span>
			)}
		</div>
	);
}
