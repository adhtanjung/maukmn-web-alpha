import { auth } from "@clerk/nextjs/server";
import POIDetailContent from "./POIDetailContent";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

async function getPOI(id: string) {
	try {
		const { getToken } = await auth();
		const token = await getToken();

		// Ensure we don't cache this request if we want fresh data, or use revalidate
		const res = await fetch(`${API_URL}/api/v1/pois/${id}`, {
			cache: "no-store", // or next: { revalidate: 60 }
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		if (!res.ok) {
			console.error(`Failed to fetch POI ${id}: ${res.statusText}`);
			return null;
		}

		const data = await res.json();

		// Handle standardized response format like the hook did
		let poiData = null;
		if (data.success && data.data) {
			poiData = data.data;
		} else if (data.poi_id) {
			poiData = data;
		} else if (data.data && data.data.poi_id) {
			poiData = data.data;
		}

		if (!poiData || typeof poiData !== "object") {
			console.error(`POI data invalid for ${id}:`, data);
			return null;
		}

		return poiData;
	} catch (error) {
		console.error("Error fetching POI:", error);
		return null;
	}
}

export default async function POIDetailFetcher({ poiId }: { poiId: string }) {
	const poi = await getPOI(poiId);

	if (!poi) {
		return (
			<div className="p-8 text-center text-muted-foreground">
				POI not found or failed to load.
			</div>
		);
	}

	return <POIDetailContent poi={poi} />;
}
