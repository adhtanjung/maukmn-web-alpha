"use client";

import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from "@/components/ui/progress";
import { POI } from "@/app/hooks/usePOIs";
import {
	getWifiPercent,
	getPowerPercent,
	getNoisePercent,
} from "@/app/lib/utils/poi-metrics";

export function WorkProductivityDetails({
	poi,
	workabilityScore,
}: {
	poi: POI;
	workabilityScore: number | null;
}) {
	return (
		<AccordionItem
			value="work"
			className="bg-card rounded-xl border border-border px-0 overflow-hidden"
		>
			<AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-accent/50 transition-colors">
				<div className="flex items-center gap-3">
					<div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
						<span className="material-symbols-outlined text-[20px]">
							laptop_mac
						</span>
					</div>
					<div className="flex flex-col text-left">
						<span className="font-semibold text-foreground">
							Work & Productivity
						</span>
					</div>
				</div>
			</AccordionTrigger>
			<AccordionContent className="px-4 pb-4">
				<div className="bg-background/50 p-5 rounded-2xl border border-border/50 shadow-sm mt-2">
					<div className="flex items-center justify-between mb-5">
						<h3 className="text-foreground font-bold text-base flex items-center gap-2">
							<span className="material-symbols-outlined text-primary text-[20px]">
								verified
							</span>
							Work Ready
						</h3>
						{workabilityScore !== null && workabilityScore > 0 && (
							<span className="bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded border border-primary/20">
								{workabilityScore}/5
							</span>
						)}
					</div>

					<div className="space-y-5">
						{poi.wifi_quality && (
							<DetailProgress
								label="Wi-Fi"
								value={poi.wifi_quality}
								percent={getWifiPercent(poi.wifi_quality)}
							/>
						)}
						{poi.power_outlets && (
							<DetailProgress
								label="Power"
								value={poi.power_outlets}
								percent={getPowerPercent(poi.power_outlets)}
							/>
						)}
						{poi.noise_level && (
							<DetailProgress
								label="Noise"
								value={poi.noise_level}
								percent={getNoisePercent(poi.noise_level)}
								color="bg-yellow-500"
							/>
						)}
					</div>

					<div className="h-px bg-border w-full my-5" />

					<div className="flex flex-wrap gap-2">
						{poi.has_ac && <DetailBadge icon="ac_unit" label="AC Available" />}
						{poi.outdoor_seating && (
							<DetailBadge icon="deck" label="Outdoor Seating" />
						)}
					</div>
				</div>
			</AccordionContent>
		</AccordionItem>
	);
}

function DetailProgress({
	label,
	value,
	percent,
	color = "bg-primary",
}: {
	label: string;
	value: string;
	percent: number;
	color?: string;
}) {
	return (
		<div>
			<div className="flex justify-between items-end mb-2">
				<span className="text-muted-foreground text-xs font-medium uppercase tracking-wide">
					{label}
				</span>
				<span className="text-foreground font-bold text-sm capitalize">
					{value}
				</span>
			</div>
			<Progress value={percent} className="h-2" indicatorColor={color} />
		</div>
	);
}

function DetailBadge({ icon, label }: { icon: string; label: string }) {
	return (
		<span className="text-xs text-foreground bg-accent px-3 py-1.5 rounded-lg border border-border flex items-center gap-1.5">
			<span className="material-symbols-outlined text-[14px] text-primary">
				{icon}
			</span>
			{label}
		</span>
	);
}
