"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { NavigationDestination, RouteInfo, TravelMode } from "@/app/types/map";

const formatDuration = (seconds: number) => {
	const minutes = Math.round(seconds / 60);
	if (minutes < 60) return `${minutes} min`;
	const hours = Math.floor(minutes / 60);
	const remainingMins = minutes % 60;
	return `${hours}h ${remainingMins}m`;
};

const formatDistance = (meters: number) => {
	if (meters < 1000) return `${Math.round(meters)}m`;
	return `${(meters / 1000).toFixed(1)} km`;
};

export function NavigationOverlay({
	destination,
	routeInfo,
	isLoadingRoute,
	travelMode,
	onTravelModeChange,
}: {
	destination: NavigationDestination;
	routeInfo: RouteInfo | null;
	isLoadingRoute: boolean;
	travelMode: TravelMode;
	onTravelModeChange: (mode: TravelMode) => void;
}) {
	const openInMap = (type: "google" | "waze") => {
		const url =
			type === "google"
				? `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}`
				: `https://waze.com/ul?ll=${destination.lat},${destination.lng}&navigate=yes`;
		window.open(url, "_blank");
	};

	return (
		<div className="absolute top-20 left-0 right-0 z-30 p-4 flex flex-col gap-3 pointer-events-none">
			{/* Mode Switcher */}
			<div className="flex justify-center gap-2 pointer-events-auto">
				{(["driving", "walking", "cycling"] as TravelMode[]).map((mode) => (
					<Button
						key={mode}
						onClick={() => onTravelModeChange(mode)}
						className={cn(
							"h-10 px-4 rounded-full flex items-center gap-2 transition-all border",
							travelMode === mode
								? "bg-primary text-black font-bold border-primary"
								: "bg-black/90 text-white border-white/10"
						)}
					>
						<span className="material-symbols-outlined text-[18px]!">
							{mode === "driving"
								? "directions_car"
								: mode === "walking"
								? "directions_walk"
								: "directions_bike"}
						</span>
						<span className="text-sm capitalize">{mode}</span>
					</Button>
				))}
			</div>

			{/* Info Pill */}
			{routeInfo && (
				<div className="flex justify-center">
					<div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 flex items-center gap-3 pointer-events-auto">
						{isLoadingRoute ? (
							<span className="material-symbols-outlined text-primary animate-spin text-[18px]">
								progress_activity
							</span>
						) : (
							<>
								<span className="material-symbols-outlined text-primary text-[18px]">
									schedule
								</span>
								<span className="text-white font-bold">
									{formatDuration(routeInfo.duration)}
								</span>
								<span className="text-muted-foreground">•</span>
								<span className="text-white">
									{formatDistance(routeInfo.distance)}
								</span>
							</>
						)}
					</div>
				</div>
			)}

			{/* External Actions */}
			<div className="flex justify-center gap-2 pointer-events-auto">
				<Button
					onClick={() => openInMap("google")}
					className="h-9 px-3 rounded-full bg-black/90 text-white border border-white/10 text-xs font-medium gap-1.5 hover:bg-white/10"
				>
					<span className="material-symbols-outlined text-[16px]!">
						open_in_new
					</span>
					Google Maps
				</Button>
				<Button
					onClick={() => openInMap("waze")}
					className="h-9 px-3 rounded-full bg-black/90 text-white border border-white/10 text-xs font-medium gap-1.5 hover:bg-white/10"
				>
					<span className="material-symbols-outlined text-[16px]!">
						open_in_new
					</span>
					Waze
				</Button>
			</div>
		</div>
	);
}
