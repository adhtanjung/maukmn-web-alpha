"use client";

import { POI } from "@/app/hooks/usePOIs";
import { useSavedPOIs, useSaveToggle } from "@/app/hooks/useSavedPOIs";
import { calculateWorkabilityScore } from "@/app/lib/utils/calculateWorkabilityScore";
import {
	getDynamicBadges,
	getFeaturedBadge,
} from "@/app/lib/utils/getDynamicBadges";
import { getOpenStatus } from "@/app/lib/utils/getOpenStatus";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	type CarouselApi,
} from "@/components/ui/carousel";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { SmartImage } from "@/components/ui/smart-image";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import HeartAnimation from "./HeartAnimation";

/**
 * Internal sub-components to minimize re-renders of the main POICard
 */

const GalleryIndicators = memo(function GalleryIndicators({
	count,
	current,
}: {
	count: number;
	current: number;
}) {
	if (count <= 1) return null;
	return (
		<div className="absolute bottom-[calc(18rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
			{Array.from({ length: count }).map((_, idx) => (
				<div
					key={idx}
					className={cn(
						"h-1.5 rounded-full transition-all shadow-sm",
						idx === current ? "w-6 bg-white" : "w-1.5 bg-white/50",
					)}
				/>
			))}
		</div>
	);
});

const ActionCluster = memo(function ActionCluster({
	isSaved,
	onToggleSave,
	onDirections,
	moreUrl,
}: {
	isSaved: boolean;
	onToggleSave: () => void;
	onDirections?: string | null;
	moreUrl?: string;
}) {
	return (
		<div className="absolute right-4 bottom-[calc(9rem+env(safe-area-inset-bottom))] flex flex-col items-center gap-5 z-20">
			{/* SAVE (Heart) */}
			<div className="flex flex-col items-center gap-1">
				<GlassSurface
					as="button"
					variant="pill"
					interactive
					aria-label={isSaved ? "Unsave this place" : "Save this place"}
					className="w-12 h-12 flex items-center justify-center bg-black/20! dark:bg-black/20! backdrop-blur-md! border-white/20! group"
					onClick={(e: React.MouseEvent) => {
						e.stopPropagation();
						onToggleSave();
					}}
				>
					<span
						className={cn(
							"material-symbols-outlined text-[28px] transition-all duration-300",
							isSaved
								? "text-red-500 filled scale-110"
								: "text-white group-hover:text-red-400 group-active:scale-90",
						)}
					>
						favorite
					</span>
				</GlassSurface>
				<span className="text-[10px] font-bold text-white shadow-black/50 drop-shadow-md">
					Save
				</span>
			</div>

			{/* GO (Navigate) - Hero Action */}
			<div className="flex flex-col items-center gap-1">
				{onDirections ? (
					<Link
						href={onDirections}
						className="group"
						aria-label="Get directions"
						onClick={(e) => e.stopPropagation()}
					>
						<GlassSurface
							variant="pill"
							interactive
							className="w-14 h-14 flex items-center justify-center bg-primary! text-primary-foreground! border-primary/50! shadow-lg shadow-primary/20 scale-105"
						>
							<span className="material-symbols-outlined text-[32px] filled">
								near_me
							</span>
						</GlassSurface>
					</Link>
				) : (
					<GlassSurface
						as="button"
						variant="pill"
						interactive
						aria-label="Get directions (Disabled)"
						className="w-14 h-14 flex items-center justify-center bg-muted text-muted-foreground border-border/50 scale-105 opacity-50 cursor-not-allowed"
					>
						<span className="material-symbols-outlined text-[32px] filled">
							near_me
						</span>
					</GlassSurface>
				)}
				<span className="text-[11px] font-black text-white shadow-black/50 drop-shadow-md">
					GO
				</span>
			</div>

			<div className="flex flex-col items-center gap-1 opacity-90">
				{moreUrl ? (
					<Link
						href={moreUrl}
						className="group"
						aria-label="More options"
						onClick={(e) => e.stopPropagation()}
					>
						<GlassSurface
							variant="pill"
							interactive
							className="w-11 h-11 flex items-center justify-center bg-black/20! dark:bg-black/20! backdrop-blur-md! border-white/20!"
						>
							<span className="material-symbols-outlined text-white text-[24px]">
								more_horiz
							</span>
						</GlassSurface>
					</Link>
				) : (
					<GlassSurface
						as="button"
						variant="pill"
						interactive
						aria-label="More options"
						className="w-11 h-11 flex items-center justify-center bg-black/20! dark:bg-black/20! backdrop-blur-md! border-white/20!"
					>
						<span className="material-symbols-outlined text-white text-[24px]">
							more_horiz
						</span>
					</GlassSurface>
				)}
				<span className="text-[10px] font-bold text-white shadow-black/50 drop-shadow-md">
					More
				</span>
			</div>
		</div>
	);
});

interface BadgeInfo {
	label: string;
	featured?: boolean;
}

const POIInfo = memo(function POIInfo({
	poi,
	workabilityScore,
	badges,
	category,
	distance,
}: {
	poi: POI;
	workabilityScore: number | null;
	badges: BadgeInfo[];
	category: string;
	distance?: string;
}) {
	return (
		<div className="absolute bottom-[calc(6rem+env(safe-area-inset-bottom))] w-full px-5 z-10 flex flex-col gap-3">
			<div className="flex flex-col gap-1.5">
				{/* Title Row with Workability Score */}
				<div className="flex flex-col gap-2 pr-16">
					{poi.founding_user_username && (
						<div
							className="inline-flex max-w-fit items-center gap-2 bg-black/40 backdrop-blur-sm pl-0.5 pr-2.5 py-0.5 rounded-full border border-white/10 clickable active:scale-95 transition-transform"
							onClick={(e) => {
								e.stopPropagation();
								// router.push(`/profile/${poi.founding_user_username}`);
							}}
						>
							{poi.founding_user_avatar ? (
								<SmartImage
									src={poi.founding_user_avatar}
									alt={poi.founding_user_username || "Scout Avatar"}
									className="w-5 h-5 rounded-full object-cover border border-white/20"
								/>
							) : (
								<div className="w-5 h-5 rounded-full bg-linear-to-tr from-sky-500 to-indigo-500 flex items-center justify-center text-[8px] font-bold text-white uppercase">
									{poi.founding_user_username.slice(0, 2)}
								</div>
							)}
							<div className="flex flex-col leading-none">
								<span className="text-white/60 text-[9px] font-medium mb-0.5">
									Scouted by
								</span>
								<span className="text-white text-[11px] font-bold flex items-center gap-1">
									@{poi.founding_user_username}
									{/* Mock Level Badge */}
									<span className="px-1 py-0 bg-yellow-400/20 text-yellow-300 text-[9px] rounded-sm font-black tracking-tighter">
										Lv.3
									</span>
								</span>
							</div>
						</div>
					)}
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-2">
							<h1 className="text-3xl leading-tight font-extrabold tracking-tight text-white drop-shadow-lg line-clamp-2">
								{poi.name}
							</h1>
							{workabilityScore && (
								<Badge
									variant="outline"
									className="flex items-center gap-0.5 bg-amber-500/20 border-amber-500/30 px-1.5 py-0.5"
								>
									<span className="material-symbols-outlined text-amber-400 text-sm">
										bolt
									</span>
									<span className="text-amber-400 text-[11px] font-bold">
										{workabilityScore}
									</span>
								</Badge>
							)}
						</div>
					</div>
				</div>

				{/* Meta Row: Rating, Category, Distance, Status */}
				<div className="flex items-center flex-wrap gap-2 text-white/90 text-[13px] font-medium drop-shadow-md">
					<div className="flex items-center gap-1">
						<span className="material-symbols-outlined text-amber-400 text-base filled">
							star
						</span>
						<span className="font-bold text-amber-400">4.5</span>
					</div>
					{category && (
						<>
							<span className="text-white/60">•</span>
							<span>{category}</span>
						</>
					)}
					<span className="text-white/60">•</span>
					<span>{distance || "Nearby"}</span>
				</div>
			</div>

			{/* Smart Content Layer - "Why this matches you" */}
			<div className="flex flex-col gap-2">
				<p className="text-white/90 text-[13px] leading-relaxed line-clamp-2 max-w-[90%] font-medium drop-shadow-md">
					<span className="text-primary font-bold mr-1">Best for:</span>
					{poi.match_reason ||
						poi.description ||
						"Discover this amazing place."}
				</p>
			</div>

			{/* Context Chips */}
			<div className="flex gap-2 overflow-x-auto no-scrollbar pt-1 mask-linear-fade">
				{badges.map((badge, idx) => (
					<div
						key={idx}
						className={cn(
							"flex h-6 shrink-0 items-center justify-center gap-x-1.5 px-2.5 rounded-full border transition-colors",
							badge.featured
								? "bg-primary/20 border-primary/40 text-primary-foreground"
								: "bg-white/10 backdrop-blur-md border-white/20 text-white",
						)}
					>
						<span className="text-[11px] font-semibold tracking-wide">
							{badge.label}
						</span>
					</div>
				))}
			</div>

			{/* Quick Actions (visible when reservation required) */}
			{poi.reservation_required && (
				<div className="flex gap-2 pt-1">
					<Button
						size="sm"
						className="h-9 px-4 rounded-full bg-primary text-primary-foreground font-bold text-xs shadow-lg"
						onClick={() => {
							if (poi.website) window.open(poi.website, "_blank");
							else if (poi.phone) window.open(`tel:${poi.phone}`);
						}}
					>
						<span className="material-symbols-outlined text-base mr-1">
							calendar_month
						</span>
						Book Now
					</Button>
				</div>
			)}
		</div>
	);
});

interface POICardProps {
	poi: POI;
	distance?: string;
	moreUrl?: string;
	/** Mark as the first visible card to prioritize LCP image loading */
	isFirstCard?: boolean;
}

export default memo(function POICard({
	poi,
	distance = "Nearby",
	moreUrl,
	isFirstCard = false,
}: POICardProps) {
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);
	const [showHeart, setShowHeart] = useState(false);
	const lastTap = useRef<number>(0);

	// Integrate Save Hooks
	const { isSaved } = useSavedPOIs();
	const { toggleSave } = useSaveToggle();
	const isPoiSaved = isSaved(poi.poi_id);

	// Get all images (cover + gallery)
	// Prioritize gallery_images objects if available
	const allImages = useMemo(
		() =>
			poi.gallery_images && poi.gallery_images.length > 0
				? poi.gallery_images
				: ([poi.cover_image_url, ...(poi.gallery_image_urls || [])].filter(
						Boolean,
					) as string[]),
		[poi.gallery_images, poi.cover_image_url, poi.gallery_image_urls],
	);

	useEffect(() => {
		if (!api) {
			return;
		}

		const onSelect = () => {
			setCurrent(api.selectedScrollSnap());
		};

		onSelect();
		api.on("select", onSelect);
		api.on("reInit", onSelect);

		return () => {
			api.off("select", onSelect);
			api.off("reInit", onSelect);
		};
	}, [api]);

	// Calculate derived data
	const workabilityScore = useMemo(() => calculateWorkabilityScore(poi), [poi]);
	const openStatus = useMemo(
		() => getOpenStatus(poi.open_hours),
		[poi.open_hours],
	);
	const dynamicBadges = useMemo(() => getDynamicBadges(poi), [poi]);
	const allBadges = useMemo(() => {
		const featured = getFeaturedBadge(openStatus.isOpen, openStatus.statusText);
		return featured ? [featured, ...dynamicBadges.slice(0, 2)] : dynamicBadges;
	}, [openStatus, dynamicBadges]);

	// Handle double tap for like
	const handleImageTap = useCallback(() => {
		const now = Date.now();
		const DOUBLE_TAP_DELAY = 300;

		if (now - lastTap.current < DOUBLE_TAP_DELAY) {
			// Double tap detected
			setShowHeart(true);
			if (!isPoiSaved) {
				toggleSave(poi.poi_id);
			}
			if (navigator.vibrate) navigator.vibrate(50);
			setTimeout(() => setShowHeart(false), 1000);
		}
		lastTap.current = now;
	}, [isPoiSaved, toggleSave, poi.poi_id]);

	// Calculate directions URL for instant navigation
	const directionsUrl = useMemo(() => {
		if (poi.latitude && poi.longitude) {
			return `/discovery/map?navigate=${poi.poi_id}&lat=${poi.latitude}&lng=${
				poi.longitude
			}&name=${encodeURIComponent(poi.name)}`;
		}
		return null;
	}, [poi.latitude, poi.longitude, poi.poi_id, poi.name]);

	const category = poi.category_names?.[0] || poi.brand || "Place";

	return (
		<div className="relative w-full h-full snap-start shrink-0 overflow-hidden bg-card">
			{/* Rank Badge removed from main view as per Phase 2 feedback */}
			{/* <div className="absolute top-[calc(1rem+env(safe-area-inset-top))] left-4 z-40">...</div> */}

			{/* Hero Image with Tap Zones for Gallery */}
			<div className="absolute inset-0 w-full h-full">
				<Carousel setApi={setApi} className="w-full h-full">
					<CarouselContent className="h-full ml-0">
						{allImages.length > 0 ? (
							allImages.map((src) => {
								const key = typeof src === "string" ? src : src.photo_id;
								return (
									<CarouselItem
										key={key}
										className="relative w-full h-full pl-0 cursor-pointer"
										onClick={handleImageTap}
									>
										<SmartImage
											src={typeof src === "string" ? src : src.url}
											alt={poi.name}
											fill
											className="object-cover"
											containerClassName="h-full w-full"
											sizes="(max-width: 768px) 100vw, 430px"
											priority={
												isFirstCard &&
												key ===
													(typeof allImages[0] === "string"
														? allImages[0]
														: allImages[0].photo_id)
											}
										/>
									</CarouselItem>
								);
							})
						) : (
							<CarouselItem className="relative w-full h-full pl-0">
								<SmartImage
									src="https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800"
									alt={poi.name}
									fill
									className="object-cover"
									containerClassName="h-full w-full"
									sizes="(max-width: 768px) 100vw, 430px"
									priority={isFirstCard}
								/>
							</CarouselItem>
						)}
					</CarouselContent>
				</Carousel>
			</div>

			<HeartAnimation isVisible={showHeart} />

			{/* Gallery Indicators */}
			<GalleryIndicators count={allImages.length} current={current} />

			{/* Gradient Overlay - Stronger for legibility */}
			<div className="absolute bottom-0 left-0 w-full h-[70%] bg-(image:--image-gradient-fade) pointer-events-none opacity-80" />

			{/* Action Cluster - Simplified Phase 2 */}
			<ActionCluster
				isSaved={isPoiSaved}
				onToggleSave={() => toggleSave(poi.poi_id)}
				onDirections={directionsUrl}
				moreUrl={moreUrl}
			/>

			{/* POI Info */}
			<POIInfo
				poi={poi}
				workabilityScore={workabilityScore}
				badges={allBadges}
				category={category}
				distance={distance}
			/>
		</div>
	);
});
