"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
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

interface POICardProps {
	poi: POI;
	distance?: string;
	likes?: number;
	comments?: number;
	onMoreClick?: () => void;
	/** Mark as the first visible card to prioritize LCP image loading */
	isFirstCard?: boolean;
}

export default function POICard({
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
			} else {
				// Single tap navigation (only if not double tap)
				// We wait a bit to see if it becomes a double tap?
				// For carousel navigation, immediate response is better.
				// We can process carousel nav immediately and just overlay heart if double tap happens.

				if (!api) return;
				if (allImages.length <= 1) return;

				const rect = e.currentTarget.getBoundingClientRect();
				const tapX = e.clientX - rect.left;
				const isLeftTap = tapX < rect.width / 3;
				const isRightTap = tapX > (rect.width * 2) / 3;

				if (isLeftTap) {
					api.scrollPrev();
				} else if (isRightTap) {
					api.scrollNext();
				}
			}
			lastTap.current = now;
		},
		[api, allImages.length, isPoiSaved, toggleSave, poi.poi_id],
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
			<Button
				variant="ghost"
				size="icon"
				aria-label="View comments"
				className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 active:scale-90 transition-all shadow-lg hover:bg-white/10"
				onClick={(e) => e.stopPropagation()}
			>
				<span className="material-symbols-outlined text-white text-3xl">
					chat_bubble
				</span>
			</Button>
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
				<div className="absolute top-44 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
					{allImages.map((_, idx) => (
						<div
							key={idx}
							className={cn(
								"h-1 rounded-full transition-all",
								idx === current ? "w-6 bg-white" : "w-1.5 bg-white/40",
							)}
						/>
					))}
				</div>
			)}

			{/* Gradient Overlay */}
			<div className="absolute bottom-0 left-0 w-full h-[40%] bg-(image:--image-gradient-fade) pointer-events-none" />

			{/* Photo Voting - Bottom Left Horizontal Pill */}
			{currentPhoto && (
				<div className="absolute bottom-[calc(10rem+env(safe-area-inset-bottom))] left-4 flex items-center bg-black/30 backdrop-blur-md rounded-full py-1.5 px-2 gap-2 z-20 border border-white/10 shadow-lg animate-in fade-in zoom-in duration-300">
					<Button
						variant="ghost"
						size="icon"
						aria-label="Upvote photo"
						className={cn(
							"w-7 h-7 rounded-full transition-all duration-200",
							userVotes[currentPhoto.photo_id] === 1
								? "bg-emerald-500/30 text-emerald-400 hover:bg-emerald-500/40 scale-110"
								: "hover:bg-white/20 text-white active:scale-90",
						)}
						onClick={(e) => {
							e.stopPropagation();
							handleVote(currentPhoto.photo_id, "up");
						}}
					>
						<span className="material-symbols-outlined text-lg">
							arrow_upward
						</span>
					</Button>
					<span
						className={cn(
							"text-sm font-bold drop-shadow-md min-w-8 text-center transition-colors duration-200",
							userVotes[currentPhoto.photo_id] === 1
								? "text-emerald-400"
								: userVotes[currentPhoto.photo_id] === -1
									? "text-red-400"
									: "text-white",
						)}
					>
						{localScores[currentPhoto.photo_id] ?? currentPhoto.score ?? 0}
					</span>
					<Button
						variant="ghost"
						size="icon"
						aria-label="Downvote photo"
						className={cn(
							"w-7 h-7 rounded-full transition-all duration-200",
							userVotes[currentPhoto.photo_id] === -1
								? "bg-red-500/30 text-red-400 hover:bg-red-500/40 scale-110"
								: "hover:bg-white/20 text-white active:scale-90",
						)}
						onClick={(e) => {
							e.stopPropagation();
							handleVote(currentPhoto.photo_id, "down");
						}}
					>
						<span className="material-symbols-outlined text-lg">
							arrow_downward
						</span>
					</Button>
				</div>
			)}

			{/* Action Buttons */}
			<div className="absolute right-4 bottom-[calc(6rem+env(safe-area-inset-bottom))] flex flex-col items-center gap-5 z-20">
				<div className="flex flex-col items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						aria-label={isPoiSaved ? "Unsave this place" : "Save this place"}
						className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 active:scale-90 transition-all shadow-lg hover:bg-white/10 group"
						onClick={(e) => {
							e.stopPropagation();
							toggleSave(poi.poi_id);
						}}
					>
						<span
							className={cn(
								"material-symbols-outlined text-3xl transition-colors",
								isPoiSaved
									? "text-red-500 fill-current"
									: "text-white group-hover:text-red-400",
							)}
							style={
								isPoiSaved ? { fontVariationSettings: "'FILL' 1" } : undefined
							}
						>
							favorite
						</span>
					</Button>
					<span className="text-xs font-semibold text-white/90 drop-shadow-md">
						{likes + (isPoiSaved ? 1 : 0)}
					</span>
				</div>
				<div className="flex flex-col items-center gap-1">
					<CommentDrawer poiId={poi.poi_id} trigger={commentTrigger} />
					<span className="text-xs font-semibold text-white/90 drop-shadow-md">
						{comments}
					</span>
				</div>
				<div className="flex flex-col items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						aria-label="Get directions"
						className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 active:scale-90 transition-all shadow-lg hover:bg-white/10"
						onClick={handleDirections}
					>
						<span className="material-symbols-outlined text-white text-3xl">
							directions
						</span>
					</Button>
				</div>
				<div className="flex flex-col items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						aria-label="Share"
						className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 active:scale-90 transition-all shadow-lg hover:bg-white/10"
						onClick={handleShare}
					>
						<span className="material-symbols-outlined text-white text-3xl">
							share
						</span>
					</Button>
				</div>
			</div>

			{/* POI Info */}
			<div className="absolute bottom-[calc(6rem+env(safe-area-inset-bottom))] w-full px-5 z-10 flex flex-col gap-3">
				<div className="flex flex-col gap-1.5">
					{/* Title Row with Workability Score */}
					<div className="flex items-start justify-between pr-16">
						<div className="flex items-center gap-2">
							<h1 className="text-3xl leading-tight font-extrabold tracking-tight text-white drop-shadow-lg">
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

					{/* Meta Row: Rating, Category, Distance, Status */}
					<div className="flex items-center flex-wrap gap-2 text-white/90 text-[13px] font-medium drop-shadow-md">
						<div className="flex items-center gap-1">
							<span className="material-symbols-outlined text-primary text-base">
								star
							</span>
							<span className="font-bold">4.5</span>
						</div>
						<span className="text-white/60">•</span>
						<span>{category}</span>
						<span className="text-white/60">•</span>
						<span>{distance}</span>
						{openStatus.statusText !== "Hours unavailable" && (
							<>
								<span className="text-white/60">•</span>
								<span
									className={cn(
										openStatus.isOpen ? "text-primary" : "text-destructive",
									)}
								>
									{openStatus.isOpen ? "Open" : "Closed"}
								</span>
							</>
						)}
					</div>
				</div>

				{/* Description */}
				<p className="text-white/80 text-[13px] leading-relaxed line-clamp-2 max-w-[95%] font-medium drop-shadow-md">
					{poi.description || "Discover this amazing place."}
				</p>

				{poi.founding_user_username && (
					<div className="flex items-center gap-1.5 text-white/70 text-xs font-medium drop-shadow-md mt-0.5">
						<span className="material-symbols-outlined text-[16px] text-sky-400">
							verified
						</span>
						<span>
							Scouted by{" "}
							<span className="text-white hover:underline cursor-pointer">
								@{poi.founding_user_username}
							</span>
						</span>
					</div>
				)}

				<div className="flex items-center">
					<Button
						variant="link"
						size="sm"
						onClick={(e) => {
							e.stopPropagation();
							onMoreClick?.();
						}}
						className="p-0 h-auto font-bold text-white underline decoration-white/30 underline-offset-2 ml-1 cursor-pointer hover:text-primary transition-colors focus:outline-hidden"
					>
						more
					</Button>
				</div>

				{/* Dynamic Amenity Chips */}
				<div className="flex gap-2.5 overflow-x-auto no-scrollbar pt-1 mask-linear-fade">
					{allBadges.map((badge, idx) => (
						<Badge
							key={idx}
							variant={badge.featured ? "default" : "outline"}
							className={cn(
								"flex h-7 shrink-0 items-center justify-center gap-x-1.5 pl-2.5 pr-3",
								badge.featured
									? "bg-primary/90 shadow-[0_0_15px_rgba(10,92,68,0.4)] border-primary/50"
									: "bg-white/10 backdrop-blur-md border-white/10",
							)}
						>
							<span
								className={cn(
									"material-symbols-outlined text-base",
									badge.featured ? "text-primary-foreground" : "text-primary",
								)}
							>
								{badge.icon}
							</span>
							<p
								className={cn(
									"text-[11px]",
									badge.featured
										? "text-primary-foreground font-bold"
										: "text-white font-semibold",
								)}
							>
								{badge.label}
							</p>
						</Badge>
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
}
