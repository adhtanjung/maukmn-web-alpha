"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { POIFormProvider } from "@/app/contexts/POIFormContext";
import CreatePOIOverlay from "@/app/components/poi-creation/CreatePOIOverlay";
import { mapApiToFormData } from "@/app/lib/utils/poi-mapper";
import { POIFormData } from "@/app/lib/schemas/poi-form";
import EditPOILoading from "./loading";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export default function EditPOIPage() {
	const params = useParams();
	const router = useRouter();
	const { getToken } = useAuth();
	const poiId = params.id as string;

	const [initialData, setInitialData] = useState<POIFormData | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const fetchPOI = useCallback(async () => {
		if (!poiId) return;

		setLoading(true);
		setError(null);

		try {
			const token = await getToken();
			const response = await fetch(`${API_URL}/api/v1/pois/${poiId}`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			const data = await response.json();
			console.log("[EditPOIPage] Raw API Response:", data);

			if (!response.ok) {
				throw new Error(data.message || "Failed to fetch POI");
			}

			if (data.success && data.data) {
				const formData = mapApiToFormData(data.data);
				console.log("[EditPOIPage] Mapped Form Data:", formData);
				setInitialData(formData);
			} else {
				throw new Error("POI not found");
			}
		} catch (err) {
			console.error("Error fetching POI:", err);
			setError(err instanceof Error ? err.message : "Failed to fetch POI");
		} finally {
			setLoading(false);
		}
	}, [getToken, poiId]);

	useEffect(() => {
		fetchPOI();
	}, [fetchPOI]);

	if (loading) {
		return <EditPOILoading />;
	}

	if (error) {
		return (
			<main className="h-full w-full bg-background flex flex-col items-center justify-center p-4">
				<Alert variant="destructive" className="max-w-md">
					<AlertDescription>{error}</AlertDescription>
				</Alert>
				<Button
					variant="outline"
					className="mt-4"
					onClick={() => router.back()}
				>
					Go Back
				</Button>
			</main>
		);
	}

	if (!initialData) return <EditPOILoading />;

	return (
		<main className="h-full w-full bg-background relative">
			<POIFormProvider initialData={initialData} initialDraftId={poiId}>
				<Suspense fallback={null}>
					<CreatePOIOverlay
						onClose={() => router.back()}
						mode="edit"
						initialTitle="Edit POI"
					/>
				</Suspense>
			</POIFormProvider>
		</main>
	);
}
