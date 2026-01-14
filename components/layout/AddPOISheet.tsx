"use client";

import {
	Sheet,
	SheetContent,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface AddPOISheetProps {
	children: React.ReactNode;
}

export function AddPOISheet({ children }: AddPOISheetProps) {
	const router = useRouter();
	const [open, setOpen] = useState(false);

	const handlePlantFlag = () => {
		setOpen(false);
		router.push("/flag-planting");
	};

	const handleFullDetails = () => {
		setOpen(false);
		router.push("/create-poi");
	};

	return (
		<Sheet open={open} onOpenChange={setOpen}>
			<SheetTrigger asChild>{children}</SheetTrigger>
			<SheetContent side="bottom" className="rounded-t-2xl pb-8">
				<SheetHeader className="pb-4">
					<SheetTitle className="text-center text-lg font-bold">
						Add a New Spot
					</SheetTitle>
				</SheetHeader>

				<div className="flex flex-col gap-3">
					{/* Plant Flag Option */}
					<Button
						variant="outline"
						className="h-auto py-4 px-5 flex items-center gap-4 justify-start rounded-xl border-2 border-primary/20 hover:border-primary hover:bg-primary/5 transition-all"
						onClick={handlePlantFlag}
					>
						<div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-500/10">
							<span className="material-symbols-outlined text-amber-500 text-2xl">
								flag
							</span>
						</div>
						<div className="flex flex-col items-start">
							<span className="font-bold text-foreground">Plant Flag</span>
							<span className="text-xs text-muted-foreground">
								Quick claim • 30 seconds • Earn XP
							</span>
						</div>
					</Button>

					{/* Full Details Option */}
					<Button
						variant="outline"
						className="h-auto py-4 px-5 flex items-center gap-4 justify-start rounded-xl border-2 border-border hover:border-primary/50 hover:bg-muted/50 transition-all"
						onClick={handleFullDetails}
					>
						<div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
							<span className="material-symbols-outlined text-primary text-2xl">
								edit_note
							</span>
						</div>
						<div className="flex flex-col items-start">
							<span className="font-bold text-foreground">
								Add Full Details
							</span>
							<span className="text-xs text-muted-foreground">
								Comprehensive form • All details
							</span>
						</div>
					</Button>
				</div>
			</SheetContent>
		</Sheet>
	);
}
