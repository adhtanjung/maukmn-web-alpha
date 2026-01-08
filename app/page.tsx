"use client";

import { useAppUser } from "@/app/hooks/useAppUser";
import { useFilteredPOIs } from "@/app/hooks/useFilters";
import { useRouter } from "next/navigation";
import TopHeader from "./components/discovery/TopHeader";
import POICard from "./components/discovery/POICard";
import BottomNav from "./components/discovery/BottomNav";
import { useFilters } from "@/app/hooks/useFilters";

// Loading skeleton component
function POICardSkeleton() {
	return (
		<div className="relative w-full h-full snap-start shrink-0 overflow-hidden bg-surface-dark animate-pulse">
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
		<div className="w-full h-full flex flex-col items-center justify-center gap-4 px-8 text-center">
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
	const router = useRouter();
	const { isAdmin } = useAppUser();

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
	const { pois, loading, error, total } = useFilteredPOIs(queryString);

	const handleCreateClick = () => {
		router.push("/create-poi");
	};

	const handleProfileClick = () => {
		router.push("/profile");
	};

	const handleMoreClick = (poiId: string) => {
		// TODO: Open POI detail sheet
		console.log("Open details for:", poiId);
	};

	return (
		<main className="h-full w-full bg-background-dark overflow-hidden relative">
			<TopHeader
				filters={filters}
				onFiltersChange={(newFilters) => {
					// Batch update filters
					Object.entries(newFilters).forEach(([key, value]) => {
						updateFilter(key as any, value);
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

			<div className="h-full w-full overflow-y-scroll snap-y snap-mandatory no-scrollbar scroll-smooth relative">
				{loading ? (
					<POICardSkeleton />
				) : error ? (
					<div className="w-full h-full flex items-center justify-center text-red-500">
						{error}
					</div>
				) : pois.length === 0 ? (
					<EmptyState />
				) : (
					pois.map((poi) => (
						<POICard
							key={poi.poi_id}
							poi={poi}
							distance="Nearby"
							onMoreClick={() => handleMoreClick(poi.poi_id)}
						/>
					))
				)}
			</div>

			<BottomNav
				onCreateClick={handleCreateClick}
				onProfileClick={handleProfileClick}
			/>
		</main>
	);
}
