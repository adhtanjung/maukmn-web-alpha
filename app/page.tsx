"use client";

import { useRef, useCallback, useEffect } from "react";
import { useFilteredPOIs } from "@/app/hooks/useFilters";
import { POI } from "@/app/hooks/usePOIs";
import TopHeader from "./components/discovery/TopHeader";
import POICard from "./components/discovery/POICard";
import FeedSeparator from "./components/discovery/FeedSeparator";
import EndOfFeedCard from "./components/discovery/EndOfFeedCard";
import BottomNav from "@/components/layout/BottomNav";
import { useFilters } from "@/app/hooks/useFilters";

// Loading skeleton component
function POICardSkeleton() {
	return (
		<div className="relative w-full h-full snap-start shrink-0 overflow-hidden bg-card animate-pulse">
			<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
			<div className="absolute bottom-0 w-full px-5 pb-[100px] z-10 flex flex-col gap-3">
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

export default function Home() {
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

	// Use filtered POIs hook
	const { pois, loading, error, total, loadMore, hasMore } =
		useFilteredPOIs(queryString);

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
		[loading, hasMore, loadMore]
	);

	const handleMoreClick = (poiId: string) => {
		// TODO: Open POI detail sheet
		console.log("Open details for:", poiId);
	};

	// Keyboard navigation support
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "ArrowDown" || e.key === "ArrowUp") {
				e.preventDefault();
				const container = document.querySelector(".snap-y");
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

	return (
		<main className="h-full w-full bg-background overflow-hidden relative">
			<TopHeader
				filters={filters}
				onFiltersChange={(newFilters) => {
					// Batch update filters
					Object.entries(newFilters).forEach(([key, value]) => {
						updateFilter(
							key as keyof import("@/app/hooks/useFilters").FilterState,
							value
						);
					});
				}}
				onApply={() => {
					// The hooks automatically update via queryString, so explicit apply isn't strictly needed for fetching,
					// but can be used for UI feedback or closing drawers if managed here.
				}}
				onReset={resetFilters}
				resultCount={total}
				loading={loading}
			/>

			<div className="h-full w-full overflow-y-scroll snap-y snap-mandatory snap-always no-scrollbar scroll-smooth relative">
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
										className="h-full w-full snap-start snap-always shrink-0"
									>
										<POICard
											poi={poi}
											distance="Nearby"
											onMoreClick={() => handleMoreClick(poi.poi_id)}
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
							<EndOfFeedCard onReset={resetFilters} />
						)}
					</>
				)}
			</div>

			<BottomNav />
		</main>
	);
}
