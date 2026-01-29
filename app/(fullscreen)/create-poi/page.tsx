"use client";

import { useRouter, useSearchParams } from "next/navigation";

import { Suspense } from "react";
import CreatePOIOverlay from "@/app/components/poi-creation/CreatePOIOverlay";
import { POIFormProvider } from "@/app/contexts/POIFormContext";

import CreatePOILoading from "./loading";

export default function CreatePOIPage() {
	return (
		<Suspense fallback={<CreatePOILoading />}>
			<CreatePOIPageContent />
		</Suspense>
	);
}

function CreatePOIPageContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const initialDraftId = searchParams.get("id");
	const mode = searchParams.get("mode") === "edit" ? "edit" : "create";

	const handleClose = () => {
		router.push("/");
	};

	return (
		<POIFormProvider initialDraftId={initialDraftId}>
			<main className="h-full w-full bg-background overflow-hidden relative">
				<CreatePOIOverlay
					onClose={handleClose}
					mode={mode}
					initialTitle={mode === "edit" ? "Edit POI" : "Add New POI"}
					key="create-poi-overlay"
				/>
			</main>
		</POIFormProvider>
	);
}
