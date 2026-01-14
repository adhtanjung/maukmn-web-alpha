"use client";

import { Button } from "@/components/ui/button";

export function MapControls({
	onLocateUser,
	isLocating,
}: {
	onLocateUser: () => void;
	isLocating: boolean;
}) {
	return (
		<div className="absolute right-4 bottom-52 z-30 flex flex-col gap-3">
			<Button
				size="icon"
				className="w-12 h-12 bg-card/90 backdrop-blur-md rounded-full border border-border hover:bg-accent hover:text-accent-foreground text-foreground shadow-sm"
				onClick={onLocateUser}
			>
				{isLocating ? (
					<span className="material-symbols-outlined animate-spin">
						progress_activity
					</span>
				) : (
					<span className="material-symbols-outlined">my_location</span>
				)}
			</Button>
		</div>
	);
}
