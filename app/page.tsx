"use client";

import { useAppUser } from "@/app/hooks/useAppUser";
import { usePOIs } from "@/app/hooks/usePOIs";
import { useRouter } from "next/navigation";
import TopHeader from "./components/discovery/TopHeader";
import POICard from "./components/discovery/POICard";
import BottomNav from "./components/discovery/BottomNav";

// Loading skeleton component
function POICardSkeleton() {
	return (
		<div className="relative w-full h-full snap-start shrink-0 overflow-hidden bg-surface-dark animate-pulse">
			<div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
			<div className="absolute bottom-0 w-full px-5 pb-[110px] z-10 flex flex-col gap-3">
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
			<h2 className="text-xl font-bold text-foreground">No places yet</h2>
			<p className="text-muted-foreground text-sm">
				Be the first to add a place! Tap the + button below to contribute.
			</p>
		</div>
	);
}

export default function Home() {
	const router = useRouter();
	const { isAdmin } = useAppUser();
	const { pois, loading, error } = usePOIs("approved");

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
			<TopHeader />

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
