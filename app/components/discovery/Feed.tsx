"use client";

import { useRef, useCallback, useEffect } from "react";
import {
	useFilteredPOIs,
	useFilters,
	FilterState,
} from "@/app/hooks/useFilters";
import { POI } from "@/app/hooks/usePOIs";
import TopHeader from "./TopHeader";
import POICard from "./POICard";
import FeedSeparator from "./FeedSeparator";
import EndOfFeedCard from "./EndOfFeedCard";
import { useRouter } from "next/navigation";
import { PullToRefresh } from "@/app/components/ui/pull-to-refresh";
import { useBottomNav } from "@/contexts/BottomNavContext";

// Loading skeleton component
function POICardSkeleton() {
	return (
		<div className="relative w-full h-full snap-start shrink-0 overflow-hidden bg-card animate-pulse">
			<div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
			<div className="absolute bottom-0 w-full px-5 pb-[calc(100px+env(safe-area-inset-bottom))] z-10 flex flex-col gap-3">
				<div className="h-8 w-3/4 bg-white/10 rounded" />
				<div className="h-4 w-1/2 bg-white/10 rounded" />
				<div className="h-12 w-full bg-white/10 rounded" />
				<div className="flex gap-2">
					<div className="h-7 w-20 bg-white/10 rounded-full" />
					<div className="h-7 w-20 bg-white/10 rounded-full" />
				</div>
			</div>
		</div>
	);
}

// Empty state component
function EmptyState() {
	return (
		<div className="w-full h-full flex flex-col items-center justify-center gap-4 px-8 text-center bg-background">
			<span className="material-symbols-outlined text-6xl text-muted-foreground">
				explore_off
			</span>
			<h2 className="text-xl font-bold text-foreground">No places found</h2>
			<p className="text-muted-foreground text-sm">
				Try adjusting your filters to see more results.
			</p>
		</div>
	);
}

interface FeedProps {
	initialPOIs: POI[];
	initialTotal: number;
}

export default function Feed({ initialPOIs, initialTotal }: FeedProps) {
	const router = useRouter();
	// Use Ref instead of State to track active index to avoid re-rendering entire list on scroll
	const activeIndexRef = useRef(0);

	// Use filter hook
	const { filters, updateFilter, resetFilters, queryString } = useFilters({
		sortBy: "recommended",
		priceRange: 2,
		wifiQuality: "",
		noiseLevel: "",
		powerOutlets: "",
		vibes: [],
		crowdType: [],
		dietaryOptions: [],
		seatingOptions: [],
		parkingOptions: [],
		hasAC: null,
		cuisine: null,
	});

	// Use filtered POIs hook with initial data
	const { pois, loading, error, total, loadMore, hasMore, refetch } =
		useFilteredPOIs(queryString, true, initialPOIs, initialTotal);

	const observer = useRef<IntersectionObserver | null>(null);
	const lastPoiElementRef = useCallback(
		(node: HTMLDivElement) => {
			if (loading) return;
			if (observer.current) observer.current.disconnect();
			observer.current = new IntersectionObserver((entries) => {
				if (entries[0].isIntersecting && hasMore) {
					loadMore();
				}
			});
			if (node) observer.current.observe(node);
		},
		[loading, hasMore, loadMore],
	);

	const handleMoreClick = (poiId: string) => {
		// Navigation handled by Intercepting Routes
		router.push(`/poi/${poiId}`, { scroll: false });
	};

	// Track active index for preloading using Ref (no re-renders)
	useEffect(() => {
		const options = {
			root: null,
			rootMargin: "0px",
			threshold: 0.6,
		};

		const observer = new IntersectionObserver((entries) => {
			entries.forEach((entry) => {
				if (entry.isIntersecting) {
					const index = Number(entry.target.getAttribute("data-index"));
					if (!isNaN(index)) {
						activeIndexRef.current = index;

						// Preload next image immediately
						if (pois.length > 0 && index < pois.length - 1) {
							const nextPoi = pois[index + 1];
							if (nextPoi.cover_image_url) {
								const img = new Image();
								img.src = nextPoi.cover_image_url;
							}
						}
					}
				}
			});
		}, options);

		const cards = document.querySelectorAll(".poi-card-container");
		cards.forEach((card) => observer.observe(card));

		return () => observer.disconnect();
	}, [pois]); // Re-run when pois change

	// Scroll container ref for soft refresh/scroll-to-top logic
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	// Keyboard navigation support
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				const container = scrollContainerRef.current;
				if (!container) return;

				const scrollAmount = container.clientHeight;
				const currentScroll = container.scrollTop;
				const targetScroll =
					e.key === "ArrowDown"
						? currentScroll + scrollAmount
						: currentScroll - scrollAmount;

				container.scrollTo({
					top: targetScroll,
					behavior: "smooth",
				});
			}
		};

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, []);

	const handleHomeClick = useCallback(async () => {
		const container = scrollContainerRef.current;
		if (!container) return;

		// If scrolled down > 0, smooth scroll to top
		// We use a small threshold (e.g. 5px) to be forgiving
		if (container.scrollTop > 5) {
			container.scrollTo({ top: 0, behavior: "smooth" });
		} else {
			// Already at top (or close enough) -> Soft Refresh
			// Trigger haptic feedback if available (Web API)
			if (window.navigator && window.navigator.vibrate) {
				window.navigator.vibrate(10);
			}

			// Trigger refetch with visual feedback
			await refetch();
		}
	}, [refetch]);

	// Register home click handler with context
	const { registerHomeClickHandler, unregisterHomeClickHandler } =
		useBottomNav();

	useEffect(() => {
		registerHomeClickHandler(handleHomeClick);
		return () => unregisterHomeClickHandler();
	}, [handleHomeClick, registerHomeClickHandler, unregisterHomeClickHandler]);

	// Memoize handlers to prevent TopHeader re-renders
	const handleFiltersChange = useCallback(
		(newFilters: Partial<FilterState>) => {
			Object.entries(newFilters).forEach(([key, value]) => {
				updateFilter(key as keyof FilterState, value);
			});
		},
		[updateFilter],
	);

	const handleReset = useCallback(() => {
		resetFilters();
	}, [resetFilters]);

	return (
		<main className="h-full w-full bg-background overflow-hidden relative">
			<TopHeader
				filters={filters}
				onFiltersChange={handleFiltersChange}
				onApply={() => {
					// The hooks automatically update via queryString
				}}
				onReset={handleReset}
				resultCount={total}
				loading={loading}
			/>

			<PullToRefresh
				ref={scrollContainerRef}
				onRefresh={async () => {
					await refetch();
					// Add a small delay for better UX so user sees the spinner
					await new Promise((resolve) => setTimeout(resolve, 500));
				}}
				className=""
			>
				{pois.length === 0 && loading ? (
					<POICardSkeleton />
				) : error ? (
					<div className="w-full h-full flex items-center justify-center text-destructive">
						{error}
					</div>
				) : pois.length === 0 ? (
					<EmptyState />
				) : (
					<>
						{pois.map((poi, index) => {
							const isLast = pois.length === index + 1;
							// Render separator if this is the first suggested item
							// Check if poi has "isSuggested" flag
							// We cast to POI & { isSuggested?: boolean } to handle the extended property safely
							const isSuggested = (poi as POI & { isSuggested?: boolean })
								.isSuggested;
							const prevWasMatch =
								index > 0 &&
								!(pois[index - 1] as POI & { isSuggested?: boolean })
									.isSuggested;
							const showSeparator =
								isSuggested && (index === 0 || prevWasMatch);

							return (
								<div key={`container-${poi.poi_id}`} className="contents">
									{showSeparator && <FeedSeparator key="separator" />}
									<div
										ref={isLast ? lastPoiElementRef : undefined}
										key={poi.poi_id}
										data-index={index}
										className="h-full w-full snap-start snap-always shrink-0 poi-card-container"
									>
										<POICard
											poi={poi}
											distance="Nearby"
											onMoreClick={() => handleMoreClick(poi.poi_id)}
											isFirstCard={index === 0}
										/>
									</div>
								</div>
							);
						})}
						{loading && (
							<div className="h-full w-full snap-start snap-always shrink-0">
								<POICardSkeleton />
							</div>
						)}
						{!loading && !hasMore && pois.length > 0 && (
							<EndOfFeedCard
								onReset={resetFilters}
								onBackToTop={() => {
									const container = scrollContainerRef.current;
									if (container) {
										container.scrollTo({ top: 0, behavior: "smooth" });
									}
								}}
							/>
						)}
					</>
				)}
			</PullToRefresh>
		</main>
	);
}
