"use client";

import { useRouter } from "next/navigation";
import { AnimatePresence } from "motion/react";
import CreatePOIOverlay from "../components/poi-creation/CreatePOIOverlay";
import { POIFormProvider } from "../contexts/POIFormContext";

export default function CreatePOIPage() {
	const router = useRouter();

	const handleClose = () => {
		router.push("/");
	};

	return (
		<POIFormProvider>
			<main className="h-full w-full bg-background-dark overflow-hidden relative">
				<AnimatePresence mode="wait">
					<CreatePOIOverlay onClose={handleClose} key="create-poi-overlay" />
				</AnimatePresence>
			</main>
		</POIFormProvider>
	);
}
