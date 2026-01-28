"use client";

import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { POI } from "@/app/hooks/usePOIs";

export function FoodDrinkDetails({ poi }: { poi: POI }) {
	return (
		<AccordionItem
			value="food"
			className="bg-card rounded-xl border border-border px-0 overflow-hidden"
		>
			<AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-accent/50 transition-colors">
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-400">
						<span className="material-symbols-outlined text-[20px]">
							restaurant
						</span>
					</div>
					<span className="font-semibold text-foreground">Food & Drink</span>
				</div>
			</AccordionTrigger>
			<AccordionContent className="px-4 pb-4">
				<div className="mt-4 flex gap-2 flex-wrap">
					{poi.cuisine && <FoodBadge label={poi.cuisine} />}
					{poi.happy_hour_info && (
						<FoodBadge label="Happy Hour" icon="celebration" />
					)}
					{!poi.cuisine && !poi.happy_hour_info && (
						<span className="text-muted-foreground text-sm">
							No specific food info available.
						</span>
					)}
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}

function FoodBadge({
	label,
	icon = "check_circle",
}: {
	label: string;
	icon?: string;
}) {
	return (
		<span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-xs text-foreground border border-border">
			<span className="material-symbols-outlined text-[14px] text-green-400">
				{icon}
			</span>
			{label}
		</span>
	);
}
