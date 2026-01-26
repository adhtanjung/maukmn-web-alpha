// Server Component - NO "use client" directive
// P0 Performance Fix: Split map page into Server wrapper + Client island
// This enables SSR skeleton while maplibre-gl loads lazily

import { Suspense } from "react";
import MapLoading from "./loading";
import MapClientWrapper from "./_components/MapClientWrapper";

export default function DiscoveryMapPage() {
	return (
		// Suspense provides additional fallback for useSearchParams in client component
		<Suspense fallback={<MapLoading />}>
			<MapClientWrapper />
		</Suspense>
	);
}
