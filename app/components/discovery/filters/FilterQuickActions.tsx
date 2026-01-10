"use client";

import { Button } from "@/components/ui/button";

interface FilterQuickActionsProps {
	onQuickFilter: (presetId: string) => void;
}

export function FilterQuickActions({ onQuickFilter }: FilterQuickActionsProps) {
	return (
		<div>
			<div className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 pb-1">
				<Button
					variant="default"
					size="sm"
					onClick={() => onQuickFilter("deep_work")}
					className="shrink-0 rounded-full shadow-[0_4px_12px_rgba(16,185,129,0.3)] border border-primary flex items-center gap-1.5 transition-transform active:scale-95"
				>
					<span className="material-symbols-outlined text-[18px]!">
						rocket_launch
					</span>{" "}
					Deep Work
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onQuickFilter("client_meeting")}
					className="shrink-0 rounded-full border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 transition-all active:scale-95 border"
				>
					<span className="material-symbols-outlined text-[16px]!">
						handshake
					</span>{" "}
					Client Meeting
				</Button>
				<Button
					variant="outline"
					size="sm"
					onClick={() => onQuickFilter("date_night")}
					className="shrink-0 rounded-full border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground flex items-center gap-1.5 transition-all active:scale-95 border"
				>
					<span className="material-symbols-outlined text-[16px]!">
						wine_bar
					</span>{" "}
					Date Night
				</Button>
			</div>
		</div>
	);
}
