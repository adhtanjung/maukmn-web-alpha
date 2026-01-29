"use client";

import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { POIFormProvider } from "@/app/contexts/POIFormContext";
import CreatePOIOverlay from "@/app/components/poi-creation/CreatePOIOverlay";
import { POIFormData } from "@/app/lib/schemas/poi-form";
import EditPOILoading from "./loading";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface EditPOIClientProps {
	initialData: POIFormData | null;
	poiId: string;
	error?: string;
}

export default function EditPOIClient({
	initialData,
	poiId,
	error,
}: EditPOIClientProps) {
	const router = useRouter();

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
				<Suspense fallback={<EditPOILoading />}>
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
