"use client";

import { useState, useMemo, useEffect, useSyncExternalStore } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { SmartImage } from "@/components/ui/smart-image";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { calculateWorkabilityScore } from "@/app/lib/utils/calculateWorkabilityScore";
import { getOpenStatus } from "@/app/lib/utils/getOpenStatus";
import { cn } from "@/lib/utils";
import { POI } from "@/app/hooks/usePOIs";
import { usePOIDetail } from "./POIDetailContext";

// Critical Imports (Immediate visibility)
import { POIHeader } from "./POIHeader";
import { ScoutBadgeOverlay } from "./ScoutBadgeOverlay";

// Lazy-loaded Imports (Hidden or below fold)
// Lazy-loaded Imports (Hidden or below fold)
import { WorkProductivityDetails } from "./WorkProductivityDetails";
import { AtmosphereDetails } from "./AtmosphereDetails";
import { FoodDrinkDetails } from "./FoodDrinkDetails";

const POIGallery = dynamic(
	() => import("./POIGallery").then((mod) => mod.POIGallery),
	{
		loading: () => (
			<div className="h-40 bg-muted/20 animate-pulse rounded-xl" />
		),
	},
);

// Skeleton Component - Exported so it can be used as Suspense Fallback
export function POIDetailSkeleton() {
	return (
		<div className="h-full bg-background animate-pulse flex flex-col">
			<div className="flex-1">
				<div className="h-[45vh] bg-muted w-full" />
				<div className="px-5 -mt-12 relative z-10 space-y-6">
					<div className="h-8 bg-muted rounded w-3/4" />
					<div className="h-4 bg-muted rounded w-1/2" />
					<div className="h-20 bg-muted rounded-xl" />
				</div>
			</div>
			<div className="p-4 h-24 bg-background border-t border-border" />
		</div>
	);
}

interface POIDetailContentProps {
	poi: POI; // Data passed from Server Component
	onClose?: () => void;
	className?: string;
}

export default function POIDetailContent({
	poi,
	onClose: onCloseProp,
	className,
}: POIDetailContentProps) {
	const router = useRouter();
	const poiDetail = usePOIDetail();
	const [selectedImage, setSelectedImage] = useState<string | null>(null);
	const [prevPoiId, setPrevPoiId] = useState<string | number | undefined>(
		poi?.poi_id,
	);
	const [calculatedDistance, setCalculatedDistance] = useState<number | null>(
		null,
	);
	const [geoError, setGeoError] = useState(false);

	// Reset state when POI changes (Render-pass update to avoid effect sync warning)
	if (poi?.poi_id !== prevPoiId) {
		setPrevPoiId(poi?.poi_id);
		setCalculatedDistance(null);
		setGeoError(false);
	}

	// Use useSyncExternalStore for hydration-safe client detection
	const mounted = useSyncExternalStore(
		() => () => {},
		() => true,
		() => false,
	);

	const hasGeolocation = useSyncExternalStore(
		() => () => {},
		() => typeof window !== "undefined" && !!navigator.geolocation,
		() => true,
	);

	const showDistanceLoading =
		!poi?.distance && !calculatedDistance && hasGeolocation && !geoError;

	useEffect(() => {
		if (showDistanceLoading) {
			const options = {
				enableHighAccuracy: false,
				timeout: 20000,
				maximumAge: 60000,
			};

			navigator.geolocation.getCurrentPosition(
				(position) => {
					console.log("[POIDetailContent] Position received");
					const userLat = position.coords.latitude;
					const userLng = position.coords.longitude;
					const R = 6371e3; // metres
					const φ1 = (userLat * Math.PI) / 180;
					const φ2 = (poi.latitude! * Math.PI) / 180;
					const Δφ = ((poi.latitude! - userLat) * Math.PI) / 180;
					const Δλ = ((poi.longitude! - userLng) * Math.PI) / 180;

					const a =
						Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
						Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
					const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
					const d = R * c; // in metres
					console.log("[POIDetailContent] Calculated distance:", d);
					setCalculatedDistance(d);
				},
				(error) => {
					console.warn("[POIDetailContent] Geolocation failed:", error.message);
					setGeoError(true);
				},
				options,
			);
		}
	}, [showDistanceLoading, poi]);

	// Memoized Computations
	const workabilityScore = useMemo(
		() => (poi ? calculateWorkabilityScore(poi) : 0),
		[poi],
	);
	const openStatus = useMemo(() => getOpenStatus(poi?.open_hours), [poi]);
	const category = useMemo(
		() => poi?.category_names?.[0] || poi?.brand || "Place",
		[poi],
	);
	const priceDisplay = useMemo(
		() => (poi?.price_range ? "$".repeat(poi.price_range) : "$$"),
		[poi],
	);

	const allImages = useMemo(() => {
		if (!poi) return [];
		return [poi.cover_image_url, ...(poi.gallery_image_urls || [])].filter(
			Boolean,
		) as string[];
	}, [poi]);

	if (!poi) return null;

	const handleShare = async () => {
		const url = `${window.location.origin}/poi/${poi.poi_id}`;
		if (navigator.share) {
			try {
				await navigator.share({
					title: poi.name,
					text: poi.description || `Check out ${poi.name} on Maukemana`,
					url,
				});
			} catch {
				// User cancelled
			}
		} else {
			await navigator.clipboard.writeText(url);
		}
	};

	const handleDirections = () => {
		if (poi.latitude && poi.longitude) {
			// Trigger the close animation/handler first
			if (onCloseProp) onCloseProp();
			if (poiDetail) poiDetail.close(true); // Skip default back navigation

			// Use replace to ensure we swap the POI detail URL with the map URL
			router.replace(
				`/discovery/map?navigate=${poi.poi_id}&lat=${poi.latitude}&lng=${
					poi.longitude
				}&name=${encodeURIComponent(poi.name)}`,
			);
		}
	};

	return (
		<div
			className={cn(
				"flex flex-col h-[calc(100%+1.5rem)] -mt-6 bg-background font-sans overflow-hidden",
				className,
			)}
		>
			{/* Lightbox */}
			<AnimatePresence>
				{selectedImage && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
						onClick={() => setSelectedImage(null)}
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="relative w-full max-w-4xl max-h-[90vh] aspect-4/3"
							onClick={(e) => e.stopPropagation()}
						>
							<SmartImage
								src={selectedImage}
								alt="Full screen view"
								fill
								className="object-contain"
								containerClassName="w-full h-full"
							/>
							<Button
								variant="ghost"
								size="icon"
								onClick={() => setSelectedImage(null)}
								className="absolute top-4 right-4 bg-black/50 text-white rounded-full hover:bg-black/70 hover:text-white transition-colors h-10 w-10"
								aria-label="Close lightbox"
							>
								<span className="material-symbols-outlined">close</span>
							</Button>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto no-scrollbar relative">
				{/* Drawer Handle - visible on top of image */}
				<div className="absolute top-0 left-0 right-0 z-30 flex justify-center pt-3 pointer-events-none">
					<div className="w-12 h-1.5 rounded-full bg-white/40 backdrop-blur-sm" />
				</div>
				{/* Hero Section */}
				<div
					className="relative h-[55vh] min-h-[400px] w-full group/hero cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
					role="button"
					tabIndex={0}
					aria-label="View full cover image"
					onKeyDown={(e) => {
						if (e.key === "Enter" || e.key === " ") {
							e.preventDefault();
							if (poi.cover_image_url) {
								setSelectedImage(poi.cover_image_url);
							}
						}
					}}
					onClick={() => {
						if (poi.cover_image_url) {
							setSelectedImage(poi.cover_image_url);
						}
					}}
				>
					<div className="absolute inset-0">
						{poi.cover_image_url ? (
							<SmartImage
								src={poi.cover_image_url}
								alt={poi.name}
								fill
								className="object-cover opacity-90 transition-transform duration-700"
								containerClassName="w-full h-full"
								priority
								sizes="(max-width: 768px) 100vw, 450px"
							/>
						) : (
							<div className="w-full h-full bg-zinc-800 flex items-center justify-center">
								<span className="material-symbols-outlined text-6xl text-white/20">
									image_not_supported
								</span>
							</div>
						)}
						<div className="absolute inset-0 bg-linear-to-t from-background via-background/20 to-transparent pointer-events-none" />
					</div>

					{/* Top Actions */}
					<div className="absolute top-0 left-0 right-0 p-4 pt-12 flex justify-between items-center z-20 pointer-events-none">
						<Button
							variant="ghost"
							size="icon"
							onClick={(e) => {
								e.stopPropagation();
								if (onCloseProp) onCloseProp();
								else if (poiDetail) poiDetail.close();
								else router.back();
							}}
							className="pointer-events-auto h-10 w-10 rounded-full bg-background/20 backdrop-blur-md border border-white/10 text-white hover:bg-background/40 hover:text-white transition-colors"
							aria-label={onCloseProp || poiDetail ? "Close detail" : "Go back"}
						>
							<span className="material-symbols-outlined">
								{onCloseProp || poiDetail ? "close" : "arrow_back"}
							</span>
						</Button>
						<div className="flex gap-3 pointer-events-auto">
							<Button
								variant="ghost"
								size="icon"
								onClick={(e) => {
									e.stopPropagation();
									handleShare();
								}}
								className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-black/40 hover:text-white transition-colors"
								aria-label="Share"
							>
								<span className="material-symbols-outlined">share</span>
							</Button>
							<Button
								variant="ghost"
								size="icon"
								onClick={(e) => e.stopPropagation()}
								className="h-10 w-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-black/40 hover:text-white transition-colors"
								aria-label="Add to favorites"
							>
								<span className="material-symbols-outlined">favorite</span>
							</Button>
						</div>
					</div>

					<ScoutBadgeOverlay
						foundingUser={poi.founding_user_username || "Maukemana Scout"}
					/>
				</div>

				{/* Main Content Container */}
				<div className="relative px-5 -mt-12 z-10 flex flex-col gap-6 pb-6">
					<POIHeader
						name={poi.name}
						category={category}
						openStatus={openStatus}
						priceDisplay={priceDisplay}
						description={poi.description || ""}
						rating={poi.rating}
						reviewCount={poi.reviews_count}
						distance={
							poi.distance
								? `${(poi.distance / 1000).toFixed(1)}km`
								: calculatedDistance
									? `${(calculatedDistance / 1000).toFixed(1)}km`
									: undefined
						}
						isLoadingDistance={showDistanceLoading}
					/>

					{/* Accordion Details - Only render after mount to prevent hydration mismatch */}
					{mounted ? (
						<Accordion
							type="single"
							collapsible
							className="w-full flex flex-col gap-3"
						>
							{/* Location */}
							<AccordionItem
								value="location"
								className="bg-card rounded-xl border border-border px-0 overflow-hidden"
							>
								<AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-accent/50 transition-colors">
									<div className="flex items-center gap-3">
										<div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
											<span className="material-symbols-outlined text-[20px]">
												map
											</span>
										</div>
										<span className="font-semibold text-foreground">
											Location
										</span>
									</div>
								</AccordionTrigger>
								<AccordionContent className="px-4 pb-4">
									<div className="mt-4 rounded-xl overflow-hidden h-32 w-full relative bg-muted">
										<div className="absolute inset-0 bg-muted flex items-center justify-center text-muted-foreground">
											<span className="material-symbols-outlined text-4xl">
												map
											</span>
										</div>
										<div className="absolute inset-0 bg-black/20 flex items-center justify-center">
											<Button
												variant="ghost"
												size="sm"
												onClick={handleDirections}
												className="bg-background/90 text-foreground text-xs font-bold px-3 py-1.5 h-auto rounded-full shadow-lg backdrop-blur-sm hover:bg-background"
											>
												<span className="material-symbols-outlined text-[14px]">
													near_me
												</span>{" "}
												View Map
											</Button>
										</div>
									</div>
									<div className="mt-3 space-y-1">
										<p className="text-foreground text-sm font-medium">
											{poi.name} Location
										</p>
										<p className="text-muted-foreground text-xs">
											Lat: {poi.latitude?.toFixed(4)}, Lng:{" "}
											{poi.longitude?.toFixed(4)}
										</p>
									</div>
								</AccordionContent>
							</AccordionItem>

							<WorkProductivityDetails
								poi={poi}
								workabilityScore={workabilityScore}
							/>

							<AtmosphereDetails poi={poi} />

							<FoodDrinkDetails poi={poi} />
						</Accordion>
					) : (
						<div className="w-full flex flex-col gap-3">
							{[1, 2, 3, 4].map((i) => (
								<div
									key={i}
									className="h-16 bg-card rounded-xl animate-pulse"
								/>
							))}
						</div>
					)}

					<POIGallery images={allImages} onImageClick={setSelectedImage} />
				</div>
			</div>

			{/* Sticky Footer */}
			<div className="p-4 pb-8 bg-background/95 backdrop-blur-xl border-t border-border z-50 shrink-0">
				<Button
					onClick={handleDirections}
					className="w-full h-14 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl flex items-center justify-center gap-2 transition-colors shadow-lg shadow-primary/20 text-lg"
				>
					<span className="material-symbols-outlined">directions</span>
					Get Directions
				</Button>
			</div>
		</div>
	);
}
