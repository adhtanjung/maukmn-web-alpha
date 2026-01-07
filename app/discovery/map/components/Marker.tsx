"use client";

import { MapMarker, MarkerContent } from "@/components/ui/map";
import { cn } from "@/lib/utils";

interface MapPinProps {
	longitude: number;
	latitude: number;
	type?: "number" | "cafe" | "restaurant" | "ramen";
	value?: string | number;
	rating?: number | string;
	active?: boolean;
	onClick?: () => void;
	delay?: number;
}

export function MapPin({
	longitude,
	latitude,
	type = "restaurant",
	value,
	rating,
	active = false,
	onClick,
	delay = 0,
}: MapPinProps) {
	return (
		<MapMarker longitude={longitude} latitude={latitude} onClick={onClick}>
			<MarkerContent>
				<div
					className={cn(
						"flex flex-col items-center cursor-pointer hover:scale-110 transition-transform pin-bounce",
						active && "scale-110 z-20"
					)}
					style={{ animationDelay: `${delay}s` }}
				>
					{type === "number" && (
						<div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.4)] border-2 border-background-dark">
							<span className="text-black font-bold text-sm">{value}</span>
						</div>
					)}

					{type === "cafe" && (
						<div className="w-8 h-8 bg-surface-dark border border-primary rounded-full flex items-center justify-center shadow-md">
							<span className="material-symbols-outlined text-primary text-[18px]">
								local_cafe
							</span>
						</div>
					)}

					{type === "restaurant" && (
						<>
							<div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-[0_4px_10px_rgba(0,0,0,0.3)] z-10 transition-all group-hover:shadow-[0_0_20px_rgba(16,185,129,0.5)]">
								<span className="material-symbols-outlined text-black filled text-[20px]">
									restaurant
								</span>
							</div>
							{rating && (
								<div className="bg-surface-dark/90 px-2 py-0.5 rounded-full mt-1 border border-surface-light/50">
									<span className="text-[10px] font-bold text-white">
										{rating} ★
									</span>
								</div>
							)}
						</>
					)}

					{type === "ramen" && (
						<div className="flex flex-col items-center">
							<div className="relative">
								<div className="absolute inset-0 bg-primary/30 rounded-full animate-ping"></div>
								<div className="relative w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(16,185,129,0.4)] ring-4 ring-white/10">
									<span className="material-symbols-outlined text-black filled text-[28px]">
										ramen_dining
									</span>
								</div>
							</div>
							<div className="w-0 h-0 border-l-8 border-l-transparent border-r-8 border-r-transparent border-t-12 border-t-primary -mt-1"></div>
						</div>
					)}
				</div>
			</MarkerContent>
		</MapMarker>
	);
}
