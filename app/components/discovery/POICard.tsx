"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { POI } from "@/app/hooks/usePOIs";
import { calculateWorkabilityScore } from "@/app/lib/utils/calculateWorkabilityScore";
import { getOpenStatus } from "@/app/lib/utils/getOpenStatus";
import {
	getDynamicBadges,
	getFeaturedBadge,
} from "@/app/lib/utils/getDynamicBadges";

interface POICardProps {
	poi: POI;
	distance?: string;
	likes?: number;
	comments?: number;
	onMoreClick?: () => void;
}

const swipeConfidenceThreshold = 10000;
const swipePower = (offset: number, velocity: number) => {
	return Math.abs(offset) * velocity;
};

export default function POICard({
	poi,
	distance = "Nearby",
	likes = 0,
	comments = 0,
	onMoreClick,
}: POICardProps) {
	const router = useRouter();
	const [currentImageIndex, setCurrentImageIndex] = useState(0);
	const [direction, setDirection] = useState(0);
	const isDragging = useRef(false);

	// Helper to handle navigation
	const paginate = (newDirection: number) => {
		const nextIndex = currentImageIndex + newDirection;
		if (nextIndex >= 0 && nextIndex < allImages.length) {
			setDirection(newDirection);
			setCurrentImageIndex(nextIndex);
		}
	};

	// Get all images (cover + gallery)
	const allImages = [
		poi.cover_image_url,
		...(poi.gallery_image_urls || []),
	].filter(Boolean) as string[];

	const currentImage =
		allImages[currentImageIndex] ||
		"https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800";

	// Calculate derived data
	const workabilityScore = calculateWorkabilityScore(poi);
	const openStatus = getOpenStatus(poi.open_hours);
	const dynamicBadges = getDynamicBadges(poi);
	const featuredBadge = getFeaturedBadge(
		openStatus.isOpen,
		openStatus.statusText
	);

	// Combine badges: featured first, then dynamic
	const allBadges = featuredBadge
		? [featuredBadge, ...dynamicBadges.slice(0, 2)]
		: dynamicBadges;

	const handleImageTap = (e: React.MouseEvent<HTMLDivElement>) => {
		if (isDragging.current) return;
		if (allImages.length <= 1) return;

		const rect = e.currentTarget.getBoundingClientRect();
		const tapX = e.clientX - rect.left;
		const isLeftTap = tapX < rect.width / 3;
		const isRightTap = tapX > (rect.width * 2) / 3;

		if (isLeftTap) {
			paginate(-1);
		} else if (isRightTap) {
			paginate(1);
		}
	};

	// Navigate to map with directions mode
	const handleDirections = () => {
		if (poi.latitude && poi.longitude) {
			router.push(
				`/discovery/map?navigate=${poi.poi_id}&lat=${poi.latitude}&lng=${
					poi.longitude
				}&name=${encodeURIComponent(poi.name)}`
			);
		}
	};

	const category = poi.category_names?.[0] || poi.brand || "Place";

	return (
		<div className="relative w-full h-full snap-start shrink-0 overflow-hidden bg-card">
			{/* Hero Image with Tap Zones for Gallery */}
			<div
				className="absolute inset-0 w-full h-full cursor-pointer group bg-muted"
				onClick={handleImageTap}
				role="button"
				tabIndex={0}
				onKeyDown={(e) => {
					if (e.key === "ArrowLeft") {
						setDirection(-1);
						setCurrentImageIndex(Math.max(0, currentImageIndex - 1));
					}
					if (e.key === "ArrowRight") {
						setDirection(1);
						setCurrentImageIndex(
							Math.min(allImages.length - 1, currentImageIndex + 1)
						);
					}
				}}
			>
				<AnimatePresence initial={false} custom={direction}>
					<motion.div
						key={currentImage}
						custom={direction}
						variants={{
							enter: (direction: number) => ({
								x: direction > 0 ? "100%" : "-100%",
								opacity: 0,
							}),
							center: {
								zIndex: 1,
								x: 0,
								opacity: 1,
							},
							exit: (direction: number) => ({
								zIndex: 0,
								x: direction < 0 ? "100%" : "-100%",
								opacity: 0,
							}),
						}}
						initial="enter"
						animate="center"
						exit="exit"
						transition={{
							x: { type: "spring", stiffness: 300, damping: 30 },
							opacity: { duration: 0.2 },
						}}
						className="absolute inset-0 w-full h-full"
						drag="x"
						dragConstraints={{ left: 0, right: 0 }}
						dragElastic={1}
						onDragStart={() => {
							isDragging.current = true;
						}}
						onDragEnd={(e, { offset, velocity }) => {
							const swipe = swipePower(offset.x, velocity.x);

							if (swipe < -swipeConfidenceThreshold) {
								paginate(1);
							} else if (swipe > swipeConfidenceThreshold) {
								paginate(-1);
							}

							setTimeout(() => {
								isDragging.current = false;
							}, 50);
						}}
					>
						<Image
							src={currentImage}
							alt={poi.name}
							fill
							className="object-cover"
							sizes="(max-width: 768px) 100vw, 430px"
							priority={distance === "Nearby"}
						/>
					</motion.div>
				</AnimatePresence>
			</div>

			{/* Gallery Indicators */}
			{allImages.length > 1 && (
				<div className="absolute top-44 left-1/2 -translate-x-1/2 flex gap-1.5 z-30">
					{allImages.map((_, idx) => (
						<div
							key={idx}
							className={`h-1 rounded-full transition-all ${
								idx === currentImageIndex ? "w-6 bg-white" : "w-1.5 bg-white/40"
							}`}
						/>
					))}
				</div>
			)}

			{/* Gradient Overlay */}
			<div className="absolute bottom-0 left-0 w-full h-[40%] bg-(image:--image-gradient-fade) pointer-events-none" />

			{/* Action Buttons */}
			<div className="absolute right-4 bottom-24 flex flex-col items-center gap-5 z-20">
				<div className="flex flex-col items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						aria-label="Toggle favorite"
						className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 active:scale-90 transition-all shadow-lg hover:bg-white/10 group"
					>
						<span className="material-symbols-outlined text-white text-3xl group-hover:text-destructive transition-colors">
							favorite
						</span>
					</Button>
					<span className="text-xs font-semibold text-white/90 drop-shadow-md">
						{likes}
					</span>
				</div>
				<div className="flex flex-col items-center gap-1">
					<Button
						variant="ghost"
						size="icon"
						aria-label="View comments"
						className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm border border-white/10 active:scale-90 transition-all shadow-lg hover:bg-white/10"
					>
						<span className="material-symbols-outlined text-white text-3xl">
							chat_bubble
						</span>
					</Button>
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
					>
						<span className="material-symbols-outlined text-white text-3xl">
							share
						</span>
					</Button>
				</div>
			</div>

			{/* POI Info */}
			<div className="absolute bottom-24 w-full px-5 z-10 flex flex-col gap-3">
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
									className={`${
										openStatus.isOpen ? "text-primary" : "text-destructive"
									}`}
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
				</p>

				{/* Dynamic Amenity Chips */}
				<div className="flex gap-2.5 overflow-x-auto no-scrollbar pt-1 mask-linear-fade">
					{allBadges.map((badge, idx) => (
						<Badge
							key={idx}
							variant={badge.featured ? "default" : "outline"}
							className={`flex h-7 shrink-0 items-center justify-center gap-x-1.5 pl-2.5 pr-3 ${
								badge.featured
									? "bg-primary/90 shadow-[0_0_15px_rgba(10,92,68,0.4)] border-primary/50"
									: "bg-white/10 backdrop-blur-md border-white/10"
							}`}
						>
							<span
								className={`material-symbols-outlined text-base ${
									badge.featured ? "text-primary-foreground" : "text-primary"
								}`}
							>
								{badge.icon}
							</span>
							<p
								className={`text-[11px] ${
									badge.featured
										? "text-primary-foreground font-bold"
										: "text-white font-semibold"
								}`}
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
