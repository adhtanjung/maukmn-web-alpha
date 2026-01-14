"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { motion } from "motion/react";
import { useEffect, useState } from "react";

interface NearbyPOI {
	poi_id: string;
	name: string;
	category_id: string;
	cover_image_url?: string;
	distance_meters: number;
	latitude: number;
	longitude: number;
}

interface NearbyPOICheckProps {
	latitude: number;
	longitude: number;
	onConfirmNew: () => void;
	onSelectExisting: (poiId: string) => void;
	onClose: () => void;
}

export default function NearbyPOICheck({
	latitude,
	longitude,
	onConfirmNew,
	onSelectExisting,
	onClose,
}: NearbyPOICheckProps) {
	const { getToken } = useAuth();
	const [isLoading, setIsLoading] = useState(true);
	const [nearbyPOIs, setNearbyPOIs] = useState<NearbyPOI[]>([]);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		async function checkNearby() {
			try {
				const token = await getToken();
				if (!token) throw new Error("No auth token");

				const API_URL =
					process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

				// Check within 50m radius
				const response = await fetch(
					`${API_URL}/api/v1/pois/nearby?lat=${latitude}&lng=${longitude}&radius=50&limit=5`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				const result = await response.json();

				if (!response.ok) {
					throw new Error(result.error || "Failed to check nearby POIs");
				}

				// API response structure: { success: true, data: { data: [...], count: N, ... } }
				// Extract the POI array from the nested response
				const poiData = result?.data?.data || result?.data || [];
				const poisArray = Array.isArray(poiData) ? poiData : [];
				setNearbyPOIs(poisArray);
			} catch (err) {
				console.error("Nearby check error:", err);
				setError(err instanceof Error ? err.message : "Unknown error");
			} finally {
				setIsLoading(false);
			}
		}

		checkNearby();
	}, [latitude, longitude, getToken]);

	// Auto-proceed if no nearby POIs found
	useEffect(() => {
		if (!isLoading && nearbyPOIs.length === 0 && !error) {
			onConfirmNew();
		}
	}, [isLoading, nearbyPOIs, error, onConfirmNew]);

	if (isLoading) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6"
			>
				<div className="flex flex-col items-center gap-4">
					<div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
					<p className="text-white text-lg font-bold">
						Checking for nearby spots...
					</p>
				</div>
			</motion.div>
		);
	}

	if (error) {
		return (
			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-30 p-6"
			>
				<div className="flex flex-col items-center gap-4 max-w-sm">
					<span className="material-symbols-outlined text-red-500 text-5xl">
						error
					</span>
					<p className="text-white text-center">{error}</p>
					<Button onClick={onConfirmNew} variant="secondary">
						Continue Anyway
					</Button>
				</div>
			</motion.div>
		);
	}

	if (nearbyPOIs.length === 0) {
		// Auto-proceeds via useEffect
		return null;
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: "100%" }}
			animate={{ opacity: 1, y: 0 }}
			className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-xl rounded-t-3xl p-6 pb-12 border-t border-white/10 shadow-2xl z-30 max-h-[85vh] overflow-y-auto"
		>
			{/* Close Button - Top Right Corner */}
			<Button
				variant="ghost"
				size="icon"
				className="absolute top-4 right-4 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50"
				onClick={onClose}
				aria-label="Close"
			>
				<span className="material-symbols-outlined">close</span>
			</Button>

			<div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 opacity-50" />

			<div className="space-y-6">
				<div>
					<h2 className="text-2xl font-black tracking-tight text-foreground">
						Did you mean?
					</h2>
					<p className="text-muted-foreground text-sm">
						We found {nearbyPOIs.length} spot{nearbyPOIs.length > 1 ? "s" : ""}{" "}
						nearby. Is this one of them?
					</p>
				</div>

				{/* List of nearby POIs */}
				<div className="space-y-3">
					{nearbyPOIs.map((poi) => (
						<button
							key={poi.poi_id}
							onClick={() => onSelectExisting(poi.poi_id)}
							className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-transparent bg-muted/50 hover:border-primary hover:bg-primary/5 transition-all text-left"
						>
							{poi.cover_image_url ? (
								// eslint-disable-next-line @next/next/no-img-element
								<img
									src={poi.cover_image_url}
									alt={poi.name}
									className="w-16 h-16 rounded-lg object-cover"
								/>
							) : (
								<div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
									<span className="material-symbols-outlined text-muted-foreground">
										location_on
									</span>
								</div>
							)}
							<div className="flex-1">
								<p className="font-bold text-foreground">{poi.name}</p>
								<p className="text-xs text-muted-foreground">
									{Math.round(poi.distance_meters)}m away
								</p>
							</div>
							<span className="material-symbols-outlined text-primary">
								chevron_right
							</span>
						</button>
					))}
				</div>

				{/* Confirm New Spot */}
				<Button
					onClick={onConfirmNew}
					variant="outline"
					className="w-full h-14 rounded-full text-lg font-bold border-2 border-dashed"
				>
					<span className="material-symbols-outlined mr-2">add_location</span>
					No, this is a new spot
				</Button>
			</div>
		</motion.div>
	);
}
