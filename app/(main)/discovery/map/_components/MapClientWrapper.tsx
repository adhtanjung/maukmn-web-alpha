"use client";

// Client Component wrapper for dynamic import with ssr: false
// Next.js 16 requires ssr: false to be in a Client Component

import dynamic from "next/dynamic";
import MapLoading from "../loading";

// Dynamic import with ssr: false - maplibre-gl requires browser APIs
// This removes ~300KB from the initial bundle
const MapClient = dynamic(() => import("./MapClient"), {
	ssr: false,
	loading: () => <MapLoading />,
});

export default function MapClientWrapper() {
	return <MapClient />;
}
