"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { POI } from "@/app/types/map";

export function POIDetailCard({
	poi,
	onClose,
}: {
	poi: POI;
	onClose: () => void;
}) {
	const router = useRouter();

	return (
		<div className="absolute bottom-28 left-4 right-4 z-40 animate-in slide-in-from-bottom-4 fade-in duration-300">
			<div className="bg-card/95 backdrop-blur-xl rounded-lg p-4 shadow-lg border border-border flex gap-4 items-center relative">
				<button
					onClick={onClose}
					className="absolute -top-2 -right-2 w-8 h-8 bg-card border border-border rounded-full flex items-center justify-center hover:bg-accent hover:text-accent-foreground shadow-lg"
				>
					<span className="material-symbols-outlined text-foreground text-[18px]">
						close
					</span>
				</button>

				<div className="flex-1 min-w-0 flex flex-col gap-1">
					<div className="flex items-center gap-2 mb-1">
						{poi.category_names?.[0] && (
							<span className="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
								{poi.category_names[0]}
							</span>
						)}
						<span className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
							{poi.cuisine || "Place"}
						</span>
					</div>
					<h3 className="text-foreground text-lg font-bold truncate">
						{poi.name}
					</h3>
					<div className="mt-3 flex items-center gap-3">
						<Button
							onClick={() => router.push(`/poi/${poi.poi_id}`)}
							className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-bold px-5 py-2.5 h-auto rounded-full"
						>
							View Details
						</Button>
					</div>
				</div>
				<div className="w-24 h-24 shrink-0 rounded-lg relative overflow-hidden border border-border">
					<Image
						src={
							poi.cover_image_url ||
							"https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=400"
						}
						alt={poi.name}
						fill
						className="object-cover"
					/>
				</div>
			</div>
		</div>
	);
}
