"use client";

import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { POI } from "@/app/hooks/usePOIs";
import { cn } from "@/lib/utils";

export function AtmosphereDetails({ poi }: { poi: POI }) {
	return (
		<AccordionItem
			value="atmosphere"
			className="bg-card rounded-xl border border-border px-0 overflow-hidden"
		>
			<AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-accent/50 transition-colors">
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400">
						<span className="material-symbols-outlined text-[20px]">
							nightlife
						</span>
					</div>
					<span className="font-semibold text-foreground">Atmosphere</span>
				</div>
			</AccordionTrigger>
			<AccordionContent className="px-4 pb-4">
				<div className="mt-4 space-y-3">
					<AtmosphereRow label="Vibe" value={poi.vibes?.[0] || "Chill"} />
					<AtmosphereRow
						label="Noise Level"
						value={poi.noise_level || "Unknown"}
						icon="volume_mute"
						iconColor="text-green-400"
					/>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}

function AtmosphereRow({
	label,
	value,
	icon,
	iconColor,
}: {
	label: string;
	value: string;
	icon?: string;
	iconColor?: string;
}) {
	return (
		<div className="flex items-center justify-between py-2 border-b border-white/5">
			<span className="text-muted-foreground text-sm">{label}</span>
			<div className="flex items-center gap-1">
				{icon && (
					<span
						className={cn("material-symbols-outlined text-[16px]", iconColor)}
					>
						{icon}
					</span>
				)}
				<span className="text-foreground text-sm font-medium capitalize">
					{value}
				</span>
			</div>
		</div>
	);
}
