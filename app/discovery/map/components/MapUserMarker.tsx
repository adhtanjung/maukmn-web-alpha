"use client";

import { MapMarker, MarkerContent } from "@/components/ui/map";

export function MapUserMarker({
	location,
}: {
	location: { lat: number; lng: number };
}) {
	return (
		<MapMarker longitude={location.lng} latitude={location.lat}>
			<MarkerContent>
				<div className="flex flex-col items-center">
					<div className="relative">
						<div className="absolute inset-0 w-8 h-8 bg-blue-500/30 rounded-full animate-ping" />
						<div className="absolute inset-0 w-8 h-8 bg-blue-500/20 rounded-full animate-pulse" />
						<div className="relative w-8 h-8 flex items-center justify-center">
							<div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg" />
						</div>
					</div>
				</div>
			</MarkerContent>
		</MapMarker>
	);
}
