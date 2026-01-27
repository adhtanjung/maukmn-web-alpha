"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence } from "motion/react";
import { Suspense } from "react";
import CreatePOIOverlay from "../components/poi-creation/CreatePOIOverlay";
import { POIFormProvider } from "../contexts/POIFormContext";

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
				<AnimatePresence mode="wait">
					<CreatePOIOverlay
						onClose={handleClose}
						mode={mode}
						initialTitle={mode === "edit" ? "Edit POI" : "Add New POI"}
						key="create-poi-overlay"
					/>
				</AnimatePresence>
			</main>
		</POIFormProvider>
	);
}
