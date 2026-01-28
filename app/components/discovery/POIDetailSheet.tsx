"use client";

import { ReactNode } from "react";
import {
	Drawer,
	DrawerContent,
	DrawerTitle,
	DrawerDescription,
} from "@/components/ui/drawer";
import { useRouter } from "next/navigation";

interface POIDetailSheetProps {
	children: ReactNode;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
	onClose?: () => void;
}

export default function POIDetailSheet({
	children,
	open = true, // Default to true if used in an intercepted route
	onOpenChange,
	onClose,
}: POIDetailSheetProps) {
	const router = useRouter();

	const handleOpenChange = (isOpen: boolean) => {
		if (onOpenChange) {
			onOpenChange(isOpen);
		}
		if (!isOpen) {
			if (onClose) {
				onClose();
			} else {
				// Default behavior for intercepted routes: go back
				router.back();
			}
		}
	};

	return (
		<Drawer open={open} onOpenChange={handleOpenChange}>
			<DrawerContent className="bg-background border-border h-[94%] max-w-[430px] mx-auto rounded-t-2xl overflow-hidden">
				<DrawerTitle className="sr-only">POI Details</DrawerTitle>
				<DrawerDescription className="sr-only">
					Detailed information about the selected place
				</DrawerDescription>
				{children}
			</DrawerContent>
		</Drawer>
	);
}
