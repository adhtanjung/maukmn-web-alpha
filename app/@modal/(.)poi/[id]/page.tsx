import { Suspense } from "react";
import POIDetailFetcher from "@/app/components/discovery/POIDetailFetcher";
import POIDetailSheet from "@/app/components/discovery/POIDetailSheet";
import { POIDetailSkeleton } from "@/app/components/discovery/POIDetailContent";

interface PageProps {
	params: Promise<{ id: string }>;
}

export default async function POIModalPage({ params }: PageProps) {
	const { id } = await params;

	return (
		<POIDetailSheet open={true}>
			<Suspense fallback={<POIDetailSkeleton />}>
				<POIDetailFetcher poiId={id} />
			</Suspense>
		</POIDetailSheet>
	);
}
