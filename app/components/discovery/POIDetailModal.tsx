"use client";

import { useRouter } from "next/navigation";
import { ReactNode, useState } from "react";
import POIDetailSheet from "./POIDetailSheet";
import { POIDetailProvider } from "./POIDetailContext";

interface POIDetailModalProps {
	children: ReactNode;
}

export function POIDetailModal({ children }: POIDetailModalProps) {
	const router = useRouter();
	const [isOpen, setIsOpen] = useState(true);

	const handleClose = (skipNavigation?: boolean) => {
		setIsOpen(false);
		if (!skipNavigation) {
			// Give animation time to start before navigating back
			setTimeout(() => {
				router.back();
			}, 100);
		}
	};

	return (
		<POIDetailProvider onClose={handleClose}>
			<POIDetailSheet
				open={isOpen}
				onOpenChange={setIsOpen}
				onClose={handleClose}
			>
				{children}
			</POIDetailSheet>
		</POIDetailProvider>
	);
}
