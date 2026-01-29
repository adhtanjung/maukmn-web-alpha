"use client";

import { useState, useEffect, useCallback, useRef, useMemo, memo } from "react";
import { useRouter } from "next/navigation";
import { SmartImage } from "@/components/ui/smart-image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
	Carousel,
	CarouselContent,
	CarouselItem,
	type CarouselApi,
} from "@/components/ui/carousel";
import { GlassSurface } from "@/components/ui/GlassSurface";
import { POI } from "@/app/hooks/usePOIs";
import { calculateWorkabilityScore } from "@/app/lib/utils/calculateWorkabilityScore";
import { getOpenStatus } from "@/app/lib/utils/getOpenStatus";
import {
	getDynamicBadges,
	getFeaturedBadge,
} from "@/app/lib/utils/getDynamicBadges";
import { cn } from "@/lib/utils";
import HeartAnimation from "./HeartAnimation";
import { useSavedPOIs, useSaveToggle } from "@/app/hooks/useSavedPOIs";
import { CommentDrawer } from "@/app/components/comments/CommentDrawer";
import { usePhotoVoting } from "@/app/hooks/usePhotoVoting";
import { Photo } from "@/app/hooks/usePOIs";
// import VoteRail from "./VoteRail";
// import RankBadge from "./RankBadge";

interface POICardProps {
	poi: POI;
	distance?: string;
	likes?: number;
	comments?: number;
	onMoreClick?: () => void;
	/** Mark as the first visible card to prioritize LCP image loading */
	isFirstCard?: boolean;
}

export default memo(function POICard({
	poi,
	distance = "Nearby",
	likes = 0,
	comments = 0,
	onMoreClick,
	isFirstCard = false,
}: POICardProps) {
	const router = useRouter();
	const [api, setApi] = useState<CarouselApi>();
	const [current, setCurrent] = useState(0);
	const [showHeart, setShowHeart] = useState(false);
	const lastTap = useRef<number>(0);

	// Alert states
	const [showVoteError, setShowVoteError] = useState(false);
	const [showCopied, setShowCopied] = useState(false);

	// Integrate Save Hooks
	const { isSaved } = useSavedPOIs();
	const { toggleSave } = useSaveToggle();
	const isPoiSaved = isSaved(poi.poi_id);

	// Integrate Voting Hook
	const { votePhoto } = usePhotoVoting();

	// Get all images (cover + gallery)
	// Prioritize gallery_images objects if available
	const allImages =
		poi.gallery_images && poi.gallery_images.length > 0
			? poi.gallery_images
			: ([poi.cover_image_url, ...(poi.gallery_image_urls || [])].filter(
					Boolean,
				) as string[]);

	const currentImage = allImages[current];
	const isPhotoObject = (img: string | Photo): img is Photo =>
		typeof img !== "string";
	const currentPhoto = isPhotoObject(currentImage) ? currentImage : null;

	// Local state for optimistic updates
	const [localScores, setLocalScores] = useState<Record<string, number>>({});
	// Track user's vote state per photo: 1 = upvoted, -1 = downvoted, 0 = no vote
	const [userVotes, setUserVotes] = useState<Record<string, number>>({});

	// Keep handleVote for future use or remove if fully deprecated
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const handleVote = async (photoId: string, type: "up" | "down") => {
		const voteInt = type === "up" ? 1 : -1;
		const currentUserVote = userVotes[photoId] || 0;

		// Predict new vote state (Reddit toggle logic)
		let predictedUserVote: number;
		let scoreDelta: number;
		if (currentUserVote === voteInt) {
			// Same vote = remove vote
			predictedUserVote = 0;
			scoreDelta = -voteInt;
		} else if (currentUserVote === 0) {
			// No vote = add vote
			predictedUserVote = voteInt;
			scoreDelta = voteInt;
		} else {
			// Opposite vote = switch (counts as 2)
			predictedUserVote = voteInt;
			scoreDelta = voteInt * 2;
		}

		try {
			// Optimistic update
			setLocalScores((prev) => ({
				...prev,
				[photoId]: (prev[photoId] ?? (currentPhoto?.score || 0)) + scoreDelta,
			}));
			setUserVotes((prev) => ({ ...prev, [photoId]: predictedUserVote }));

			const result = await votePhoto(photoId, type);

			// Update with actual result
			setLocalScores((prev) => ({ ...prev, [photoId]: result.new_score }));
			setUserVotes((prev) => ({ ...prev, [photoId]: result.user_vote }));
		} catch {
			// Revert optimistic updates
			setLocalScores((prev) => {
				const newScores = { ...prev };
				delete newScores[photoId];
				return newScores;
			});
			setUserVotes((prev) => ({ ...prev, [photoId]: currentUserVote }));
			setShowVoteError(true);
			setTimeout(() => setShowVoteError(false), 3000);
		}
	};

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
	const workabilityScore = calculateWorkabilityScore(poi);
	const openStatus = getOpenStatus(poi.open_hours);
	const dynamicBadges = getDynamicBadges(poi);
	const featuredBadge = getFeaturedBadge(
		openStatus.isOpen,
		openStatus.statusText,
	);

	// Combine badges: featured first, then dynamic
	const allBadges = featuredBadge
		? [featuredBadge, ...dynamicBadges.slice(0, 2)]
		: dynamicBadges;

	// Handle double tap for like
	const handleImageTap = useCallback(
		(e: React.MouseEvent<HTMLDivElement>) => {
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
			// Removed tap-to-navigate logic in favor of native swipe
			lastTap.current = now;
		},
		[isPoiSaved, toggleSave, poi.poi_id],
	);

	// Share functionality
	const handleShare = useCallback(async () => {
		const shareData = {
			title: poi.name,
			text: poi.description || `Check out ${poi.name} on Maukemana`,
			url: `${window.location.origin}/poi/${poi.poi_id}`,
		};

		try {
			if (navigator.share) {
				await navigator.share(shareData);
			} else {
				await navigator.clipboard.writeText(shareData.url);
				setShowCopied(true);
				setTimeout(() => setShowCopied(false), 2000);
			}
		} catch (err) {
			// User cancelled or error
			console.debug("Share cancelled", err);
		}
	}, [poi.name, poi.description, poi.poi_id]);

	// Navigate to map with directions mode
	const handleDirections = useCallback(() => {
		if (poi.latitude && poi.longitude) {
			router.push(
				`/discovery/map?navigate=${poi.poi_id}&lat=${poi.latitude}&lng=${
					poi.longitude
				}&name=${encodeURIComponent(poi.name)}`,
			);
		}
	}, [poi.latitude, poi.longitude, poi.poi_id, poi.name, router]);

	// Memoize comment trigger to prevent re-renders
	const commentTrigger = useMemo(
		() => (
			<GlassSurface
				as="button"
				variant="pill"
				interactive
				aria-label="View comments"
				className="w-11 h-11 flex items-center justify-center bg-black/20! dark:bg-black/20! backdrop-blur-md! border-white/20! group"
				onClick={(e: React.MouseEvent) => e.stopPropagation()}
			>
				<span className="material-symbols-outlined text-white text-[24px] filled group-hover:text-primary transition-colors">
					chat_bubble
				</span>
			</GlassSurface>
		),
		[],
	);

	const category = poi.category_names?.[0] || poi.brand || "Place";

	return (
		<div className="relative w-full h-full snap-start shrink-0 overflow-hidden bg-card">
			{/* Alert Notifications */}
			{showVoteError && (
				<Alert
					variant="destructive"
					className="absolute top-4 left-4 right-16 z-50"
				>
					<AlertDescription>Failed to submit vote</AlertDescription>
				</Alert>
			)}
			{showCopied && (
				<Alert className="absolute top-4 left-4 right-16 z-50 bg-primary border-primary">
					<AlertDescription className="text-primary-foreground">
						Link copied!
					</AlertDescription>
				</Alert>
			)}

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
			{allImages.length > 1 && (
				<div className="absolute bottom-[calc(18rem+env(safe-area-inset-bottom))] left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
					{allImages.map((_, idx) => (
						<div
							key={idx}
							className={cn(
								"h-1.5 rounded-full transition-all shadow-sm",
								idx === current ? "w-6 bg-white" : "w-1.5 bg-white/50",
							)}
						/>
					))}
				</div>
			)}

			{/* Gradient Overlay - Stronger for legibility */}
			<div className="absolute bottom-0 left-0 w-full h-[70%] bg-(image:--image-gradient-fade) pointer-events-none opacity-80" />

			{/* Action Cluster - Simplified Phase 2 */}
			<div className="absolute right-4 bottom-[calc(9rem+env(safe-area-inset-bottom))] flex flex-col items-center gap-5 z-20">
				{/* SAVE (Heart) */}
				<div className="flex flex-col items-center gap-1">
					<GlassSurface
						as="button"
						variant="pill"
						interactive
						aria-label={isPoiSaved ? "Unsave this place" : "Save this place"}
						className="w-12 h-12 flex items-center justify-center bg-black/20! dark:bg-black/20! backdrop-blur-md! border-white/20! group"
						onClick={(e: React.MouseEvent) => {
							e.stopPropagation();
							toggleSave(poi.poi_id);
						}}
					>
						<span
							className={cn(
								"material-symbols-outlined text-[28px] transition-all duration-300",
								isPoiSaved
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

				{/* COMMENT (Restored) */}
				<div className="flex flex-col items-center gap-1 opacity-90">
					<CommentDrawer poiId={poi.poi_id} trigger={commentTrigger} />
					<span className="text-[10px] font-bold text-white shadow-black/50 drop-shadow-md">
						{comments > 0 ? comments : "Chat"}
					</span>
				</div>

				{/* GO (Navigate) - Hero Action */}
				<div className="flex flex-col items-center gap-1">
					<GlassSurface
						as="button"
						variant="pill"
						interactive
						aria-label="Get directions"
						className="w-14 h-14 flex items-center justify-center bg-primary! text-primary-foreground! border-primary/50! shadow-lg shadow-primary/20 scale-105"
						onClick={handleDirections}
					>
						<span className="material-symbols-outlined text-[32px] filled">
							near_me
						</span>
					</GlassSurface>
					<span className="text-[11px] font-black text-white shadow-black/50 drop-shadow-md">
						GO
					</span>
				</div>

				{/* MORE (Bottom Sheet Trigger) */}
				<div className="flex flex-col items-center gap-1 opacity-90">
					<GlassSurface
						as="button"
						variant="pill"
						interactive
						aria-label="More options"
						className="w-11 h-11 flex items-center justify-center bg-black/20! dark:bg-black/20! backdrop-blur-md! border-white/20!"
						onClick={(e: React.MouseEvent) => {
							e.stopPropagation();
							onMoreClick?.();
						}}
					>
						<span className="material-symbols-outlined text-white text-[24px]">
							more_horiz
						</span>
					</GlassSurface>
					<span className="text-[10px] font-bold text-white shadow-black/50 drop-shadow-md">
						More
					</span>
				</div>
			</div>

			{/* POI Info */}
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
						<span>12 min walk</span>
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
					{allBadges.map((badge, idx) => (
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
		</div>
	);
});
