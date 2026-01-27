"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "@/components/ui/button";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { calculateWorkabilityScore } from "@/app/lib/utils/calculateWorkabilityScore";
import { getOpenStatus } from "@/app/lib/utils/getOpenStatus";
import { cn } from "@/lib/utils";
import { POI } from "@/app/hooks/usePOIs"; // Assuming POI type is exported here like in the hook usage

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
	onClose,
	className,
}: POIDetailContentProps) {
	const router = useRouter();
	const [selectedImage, setSelectedImage] = useState<string | null>(null);

	if (!poi) return null;

	// Helpers
	const workabilityScore = calculateWorkabilityScore(poi);
	const openStatus = getOpenStatus(poi?.open_hours);
	const category = poi?.category_names?.[0] || poi?.brand || "Place";
	const priceDisplay = poi?.price_range ? "$".repeat(poi.price_range) : "$$";

	// Mappers for Progress Bars
	const getWifiPercent = (quality?: string) => {
		switch (quality) {
			case "excellent":
				return 100;
			case "fast":
				return 85;
			case "moderate":
				return 50;
			case "slow":
				return 25;
			default:
				return 0;
		}
	};

	const getPowerPercent = (amount?: string) => {
		switch (amount) {
			case "plenty":
				return 90;
			case "moderate":
				return 60;
			case "limited":
				return 30;
			default:
				return 0;
		}
	};

	const getNoisePercent = (level?: string) => {
		// Representing "intensity"
		switch (level) {
			case "loud":
				return 90;
			case "lively":
				return 70;
			case "moderate":
				return 50;
			case "quiet":
				return 25;
			case "silent":
				return 10;
			default:
				return 0;
		}
	};

	// Image Handling
	const allImages = [
		poi.cover_image_url,
		...(poi.gallery_image_urls || []),
	].filter(Boolean) as string[];

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
			router.push(
				`/discovery/map?navigate=${poi.poi_id}&lat=${poi.latitude}&lng=${
					poi.longitude
				}&name=${encodeURIComponent(poi.name)}`,
			);
		}
	};

	return (
		<div
			className={cn(
				"flex flex-col h-full bg-background font-sans overflow-hidden",
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
						className="fixed inset-0 z-100 bg-black/95 flex items-center justify-center p-4"
						onClick={() => setSelectedImage(null)}
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="relative w-full max-w-4xl max-h-[90vh] aspect-4/3"
							onClick={(e) => e.stopPropagation()}
						>
							<Image
								src={selectedImage}
								alt="Full screen view"
								fill
								className="object-contain"
							/>
							<button
								onClick={() => setSelectedImage(null)}
								className="absolute top-4 right-4 bg-black/50 text-white rounded-full p-2 hover:bg-black/70 transition-colors"
							>
								<span className="material-symbols-outlined">close</span>
							</button>
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			{/* Scrollable Content */}
			<div className="flex-1 overflow-y-auto no-scrollbar relative">
				{/* Hero Section */}
				<div
					className="relative h-[45vh] min-h-[400px] w-full group/hero cursor-pointer"
					onClick={() =>
						poi.cover_image_url && setSelectedImage(poi.cover_image_url)
					}
				>
					<div className="absolute inset-0 bg-zinc-900">
						{poi.cover_image_url ? (
							<Image
								src={poi.cover_image_url}
								alt={poi.name}
								fill
								className="object-cover opacity-90 transition-transform duration-700 group-hover/hero:scale-105"
								priority
							/>
						) : (
							<div className="w-full h-full bg-zinc-800 flex items-center justify-center">
								<span className="material-symbols-outlined text-6xl text-white/20">
									image_not_supported
								</span>
							</div>
						)}
						<div className="absolute inset-0 bg-linear-to-t from-background via-background/40 to-transparent pointer-events-none" />
					</div>

					{/* Top Actions */}
					<div className="absolute top-0 left-0 right-0 p-4 pt-6 flex justify-between items-center z-20 pointer-events-none">
						<button
							onClick={(e) => {
								e.stopPropagation();
								if (onClose) onClose();
								else router.back();
							}}
							className="pointer-events-auto h-10 w-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-black/40 transition-colors"
						>
							<span className="material-symbols-outlined">
								{onClose ? "close" : "arrow_back"}
							</span>
						</button>
						<div className="flex gap-3 pointer-events-auto">
							<button
								onClick={(e) => {
									e.stopPropagation();
									handleShare();
								}}
								className="h-10 w-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-black/40 transition-colors"
							>
								<span className="material-symbols-outlined">share</span>
							</button>
							<button
								onClick={(e) => e.stopPropagation()}
								className="h-10 w-10 flex items-center justify-center rounded-full bg-black/20 backdrop-blur-md border border-white/10 text-white hover:bg-black/40 transition-colors"
							>
								<span className="material-symbols-outlined">favorite</span>
							</button>
						</div>
					</div>

					{/* Scout Badge Overlay */}
					<div className="absolute bottom-16 right-5 z-20">
						<div className="flex items-center gap-3 bg-zinc-900/40 backdrop-blur-xl border border-white/10 rounded-full p-1.5 pr-4 shadow-[0_8px_32px_rgba(0,0,0,0.4)] ring-1 ring-white/5 hover:bg-zinc-900/60 transition-colors cursor-default">
							<div className="relative">
								{/* Placeholder Scout Image - In real app, this would come from user data */}
								<div className="w-10 h-10 rounded-full bg-zinc-700 border-2 border-primary shadow-lg shadow-primary/20 flex items-center justify-center overflow-hidden">
									<span className="material-symbols-outlined text-white">
										person
									</span>
								</div>
								<div className="absolute -bottom-1 -right-1 bg-zinc-900 rounded-full p-0.5 border border-white/10">
									<div className="bg-primary/20 rounded-full p-0.5">
										<span className="material-symbols-outlined text-[10px] text-primary block">
											verified
										</span>
									</div>
								</div>
							</div>
							<div className="flex flex-col">
								<span className="text-[10px] font-extrabold text-primary uppercase tracking-wider leading-none mb-0.5 drop-shadow-sm">
									Founding Scout
								</span>
								<span className="text-xs font-semibold text-white leading-none tracking-wide">
									Discovered by <span className="opacity-90">@user</span>
								</span>
							</div>
						</div>
					</div>
				</div>

				{/* Main Content Container */}
				<div className="relative px-5 -mt-12 z-10 flex flex-col gap-6 pb-6">
					{/* Header Info */}
					<div className="flex flex-col gap-2">
						<div className="flex items-start justify-between">
							<div>
								<h1 className="text-3xl font-bold tracking-tight text-foreground leading-tight shadow-black drop-shadow-lg">
									{poi.name}
								</h1>
								<div className="flex items-center gap-2 mt-1">
									<p className="text-zinc-300 font-medium text-sm">
										{category}
									</p>
									<span className="h-1 w-1 rounded-full bg-zinc-500" />
									{openStatus.isOpen ? (
										<div className="flex items-center gap-1 text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20">
											<span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
											<span className="text-xs font-bold uppercase tracking-wide">
												Open Now
											</span>
										</div>
									) : (
										<div className="flex items-center gap-1 text-destructive bg-destructive/10 px-2 py-0.5 rounded-full border border-destructive/20">
											<span className="text-xs font-bold uppercase tracking-wide">
												Closed
											</span>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* Badges Row */}
						<div className="flex items-center gap-4 mt-2">
							<div className="flex items-center gap-1.5 bg-card/50 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-white/5">
								<span className="text-foreground font-black text-lg">4.5</span>
								<div className="flex text-amber-400">
									<span className="material-symbols-outlined text-[18px] fill-current">
										star
									</span>
								</div>
								<span className="text-muted-foreground text-xs ml-1">
									(120)
								</span>
							</div>
							<div className="flex items-center gap-1 text-muted-foreground text-sm">
								<span className="material-symbols-outlined text-[18px]">
									sell
								</span>
								<span>{priceDisplay}</span>
							</div>
							<div className="flex items-center gap-1 text-muted-foreground text-sm">
								<span className="material-symbols-outlined text-[18px]">
									location_on
								</span>
								<span>1.2mi</span>
							</div>
						</div>

						{/* Description */}
						<p className="text-muted-foreground text-sm leading-relaxed mt-2 line-clamp-3">
							{poi.description}
						</p>
					</div>

					{/* Accordion Details */}
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
									<div className="absolute inset-0 bg-zinc-800 flex items-center justify-center text-muted-foreground">
										<span className="material-symbols-outlined text-4xl">
											map
										</span>
									</div>
									<div className="absolute inset-0 bg-black/20 flex items-center justify-center">
										<button
											onClick={handleDirections}
											className="bg-background/90 text-foreground text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm flex items-center gap-1"
										>
											<span className="material-symbols-outlined text-[14px]">
												near_me
											</span>{" "}
											View Map
										</button>
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

						{/* Work & Productivity */}
						<AccordionItem
							value="work"
							className="bg-card rounded-xl border border-border px-0 overflow-hidden"
						>
							<AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-accent/50 transition-colors">
								<div className="flex items-center gap-3">
									<div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
										<span className="material-symbols-outlined text-[20px]">
											laptop_mac
										</span>
									</div>
									<div className="flex flex-col text-left">
										<span className="font-semibold text-foreground">
											Work & Productivity
										</span>
									</div>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<div className="bg-background/50 p-5 rounded-2xl border border-border/50 shadow-sm mt-2">
									<div className="flex items-center justify-between mb-5">
										<h3 className="text-foreground font-bold text-base flex items-center gap-2">
											<span className="material-symbols-outlined text-primary text-[20px]">
												verified
											</span>
											Work Ready
										</h3>
										{workabilityScore && (
											<span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded border border-primary/20">
												{workabilityScore}/5
											</span>
										)}
									</div>

									<div className="space-y-5">
										{/* WiFi */}
										{poi.wifi_quality && (
											<div>
												<div className="flex justify-between items-end mb-2">
													<span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
														Wi-Fi
													</span>
													<span className="text-foreground font-bold text-sm capitalize">
														{poi.wifi_quality}
													</span>
												</div>
												<Progress
													value={getWifiPercent(poi.wifi_quality)}
													className="h-2"
													indicatorColor="bg-primary"
												/>
											</div>
										)}

										{/* Power */}
										{poi.power_outlets && (
											<div>
												<div className="flex justify-between items-end mb-2">
													<span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
														Power
													</span>
													<span className="text-foreground font-bold text-sm capitalize">
														{poi.power_outlets}
													</span>
												</div>
												<Progress
													value={getPowerPercent(poi.power_outlets)}
													className="h-2"
													indicatorColor="bg-primary"
												/>
											</div>
										)}

										{/* Noise */}
										{poi.noise_level && (
											<div>
												<div className="flex justify-between items-end mb-2">
													<span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
														Noise
													</span>
													<span className="text-foreground font-bold text-sm capitalize">
														{poi.noise_level}
													</span>
												</div>
												<Progress
													value={getNoisePercent(poi.noise_level)}
													className="h-2"
													indicatorColor="bg-yellow-500"
												/>
											</div>
										)}
									</div>

									<div className="h-px bg-border w-full my-5" />

									<div>
										<div className="flex flex-wrap gap-2">
											{poi.has_ac && (
												<span className="text-xs text-foreground bg-accent px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5">
													<span className="material-symbols-outlined text-[14px] text-primary">
														ac_unit
													</span>
													AC Available
												</span>
											)}
											{poi.outdoor_seating && (
												<span className="text-xs text-foreground bg-accent px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5">
													<span className="material-symbols-outlined text-[14px] text-primary">
														deck
													</span>
													Outdoor Seating
												</span>
											)}
										</div>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>

						{/* Atmosphere */}
						<AccordionItem
							value="atmosphere"
							className="bg-card rounded-xl border border-border px-0 overflow-hidden"
						>
							<AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-accent/50 transition-colors">
								<div className="flex items-center gap-3">
									<div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
										<span className="material-symbols-outlined text-[20px]">
											nightlife
										</span>
									</div>
									<span className="font-semibold text-foreground">
										Atmosphere
									</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<div className="mt-4 space-y-3">
									<div className="flex items-center justify-between py-2 border-b border-white/5">
										<span className="text-muted-foreground text-sm">Vibe</span>
										<span className="text-foreground text-sm font-medium capitalize">
											{poi.vibes?.[0] || "Chill"}
										</span>
									</div>
									<div className="flex items-center justify-between py-2 border-b border-white/5">
										<span className="text-muted-foreground text-sm">
											Noise Level
										</span>
										<div className="flex items-center gap-1">
											<span className="material-symbols-outlined text-[16px] text-green-400">
												volume_mute
											</span>
											<span className="text-foreground text-sm font-medium capitalize">
												{poi.noise_level || "Unknown"}
											</span>
										</div>
									</div>
								</div>
							</AccordionContent>
						</AccordionItem>

						{/* Food & Drink */}
						<AccordionItem
							value="food"
							className="bg-card rounded-xl border border-border px-0 overflow-hidden"
						>
							<AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-accent/50 transition-colors">
								<div className="flex items-center gap-3">
									<div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
										<span className="material-symbols-outlined text-[20px]">
											restaurant
										</span>
									</div>
									<span className="font-semibold text-foreground">
										Food & Drink
									</span>
								</div>
							</AccordionTrigger>
							<AccordionContent className="px-4 pb-4">
								<div className="mt-4 flex gap-2 flex-wrap">
									{poi.cuisine && (
										<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-xs text-foreground border border-border">
											<span className="material-symbols-outlined text-[14px] text-green-400">
												check_circle
											</span>
											{poi.cuisine}
										</span>
									)}
									{poi.happy_hour_info && (
										<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-xs text-foreground border border-border">
											<span className="material-symbols-outlined text-[14px] text-green-400">
												celebration
											</span>
											Happy Hour
										</span>
									)}
									{!poi.cuisine && !poi.happy_hour_info && (
										<span className="text-muted-foreground text-sm">
											No specific food info available.
										</span>
									)}
								</div>
							</AccordionContent>
						</AccordionItem>
					</Accordion>

					{/* Gallery Section */}
					<div className="py-4">
						<div className="flex items-center justify-between mb-3 px-1">
							<h3 className="text-lg font-bold text-foreground">Gallery</h3>
						</div>
						<div className="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x">
							{allImages.length > 0 ? (
								allImages.map((src, idx) => (
									<div
										key={idx}
										className="flex-none w-40 h-40 rounded-xl overflow-hidden snap-center ring-1 ring-white/10 relative cursor-pointer active:scale-95 transition-transform"
										onClick={() => setSelectedImage(src)}
									>
										<Image
											src={src}
											alt={`Gallery ${idx + 1}`}
											fill
											className="object-cover"
										/>
									</div>
								))
							) : (
								<p className="text-muted-foreground text-sm p-4">
									No photos available
								</p>
							)}
						</div>
					</div>
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
