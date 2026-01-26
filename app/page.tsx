import { Suspense } from "react";
import { POI } from "@/app/hooks/usePOIs";
import Feed from "./components/discovery/Feed";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// Loading skeleton component (server-rendered)
function FeedSkeleton() {
	return (
		<main className="h-full w-full bg-background overflow-hidden relative">
			{/* Header skeleton */}
			<div className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3 bg-background/80 backdrop-blur-sm">
				<div className="h-8 w-24 bg-muted rounded animate-pulse" />
				<div className="h-8 w-8 bg-muted rounded-full animate-pulse" />
			</div>

			{/* Card skeleton */}
			<div className="h-full w-full">
				<div className="relative w-full h-full snap-start shrink-0 overflow-hidden bg-card animate-pulse">
					<div className="absolute inset-0 bg-muted" />
					<div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
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
			</div>

			{/* Bottom nav skeleton */}
			<div className="absolute bottom-0 left-0 right-0 h-16 bg-background/90 backdrop-blur-sm" />
		</main>
	);
}

async function FeedWithData() {
	let pois: POI[] = [];
	let total = 0;

	try {
		const response = await fetch(
			`${API_URL}/api/v1/pois?status=approved&limit=50`,
			{
				next: { revalidate: 60 }, // Cache for 60 seconds (ISR)
			},
		);

		if (response.ok) {
			const data = await response.json();

			if (data.success && data.data) {
				if (data.data.data && Array.isArray(data.data.data)) {
					pois = data.data.data;
					total = data.data.total || pois.length;
				} else if (Array.isArray(data.data)) {
					pois = data.data;
					total = pois.length;
				}
			}
		}
	} catch (error) {
		console.error("Error fetching POIs:", error);
	}

	return <Feed initialPOIs={pois} initialTotal={total} />;
}

export default function Home() {
	return (
		<Suspense fallback={<FeedSkeleton />}>
			<FeedWithData />
		</Suspense>
	);
}
