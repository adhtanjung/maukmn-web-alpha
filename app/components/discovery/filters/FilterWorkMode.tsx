"use client";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import { WifiCard } from "../WifiCard";
import { NoiseCard } from "../NoiseCard";
import { OutletCard } from "../OutletCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FilterWorkModeProps {
	wifiQuality: string;
	noiseLevel: string;
	powerOutlets: string;
	seatingOptions: string[];
	onWifiChange: (val: string) => void;
	onNoiseChange: (val: string) => void;
	onOutletsChange: (val: string) => void;
	onSeatingToggle: (id: string) => void;
}

export function FilterWorkMode({
	wifiQuality,
	noiseLevel,
	powerOutlets,
	seatingOptions,
	onWifiChange,
	onNoiseChange,
	onOutletsChange,
	onSeatingToggle,
}: FilterWorkModeProps) {
	return (
		<div className="space-y-4">
			<Accordion type="multiple" defaultValue={[]} className="space-y-2.5">
				<AccordionItem
					value="work-mode"
					className="bg-card rounded-xl overflow-hidden border border-border"
				>
					<AccordionTrigger className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50 transition-colors select-none hover:no-underline">
						<span className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] flex items-center gap-2">
							<span className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-primary">
								<span className="material-symbols-outlined text-[16px]!">
									work
								</span>
							</span>
							Work Mode
						</span>
					</AccordionTrigger>
					<AccordionContent className="px-3 pb-4 pt-1 border-t border-border bg-background/50 space-y-4">
						<div className="space-y-2 pt-2">
							<label className="text-xs font-medium text-foreground flex items-center gap-1.5">
								<span className="material-symbols-outlined text-[16px]! text-muted-foreground">
									wifi
								</span>{" "}
								Wifi Quality
							</label>
							<div className="grid grid-cols-5 gap-1.5">
								{[
									{ value: "any", label: "Any" },
									{ value: "slow", label: "Slow" },
									{ value: "moderate", label: "Mid" },
									{ value: "fast", label: "Fast" },
									{ value: "excellent", label: "Best" },
								].map((opt) => (
									<WifiCard
										key={opt.value}
										value={opt.value}
										label={opt.label}
										current={wifiQuality}
										onChange={onWifiChange}
									/>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-xs font-medium text-foreground flex items-center gap-1.5">
								<span className="material-symbols-outlined text-[16px]! text-muted-foreground">
									volume_up
								</span>{" "}
								Noise Level
							</label>
							<div className="grid grid-cols-5 gap-1.5">
								{[
									{ value: "silent", label: "Silent" },
									{ value: "quiet", label: "Quiet" },
									{ value: "moderate", label: "Mid" },
									{ value: "lively", label: "Lively" },
									{ value: "loud", label: "Loud" },
								].map((opt) => (
									<NoiseCard
										key={opt.value}
										value={opt.value}
										label={opt.label}
										current={noiseLevel}
										onChange={onNoiseChange}
									/>
								))}
							</div>
						</div>

						<div className="space-y-2">
							<label className="text-xs font-medium text-foreground flex items-center gap-1.5">
								<span className="material-symbols-outlined text-[16px]! text-muted-foreground">
									power
								</span>{" "}
								Power Outlets
							</label>
							<div className="grid grid-cols-4 gap-1.5">
								{[
									{ value: "any", label: "Any" },
									{ value: "limited", label: "Low" },
									{ value: "moderate", label: "Mid" },
									{ value: "plenty", label: "Many" },
								].map((opt) => (
									<OutletCard
										key={opt.value}
										value={opt.value}
										label={opt.label}
										current={powerOutlets}
										onChange={onOutletsChange}
									/>
								))}
							</div>
						</div>

						<div className="flex flex-wrap gap-1.5 pt-1">
							{[
								{ id: "ergonomic", label: "Ergonomic", icon: "chair" },
								{
									id: "communal",
									label: "Communal",
									icon: "table_restaurant",
								},
								{
									id: "high-tops",
									label: "High-tops",
									icon: "countertops",
								},
								{ id: "outdoor", label: "Outdoor", icon: "deck" },
								{
									id: "private-booths",
									label: "Private Booths",
									icon: "meeting_room",
								},
								{ id: "ac", label: "AC", icon: "ac_unit" },
							].map((facility) => {
								const isSelected = seatingOptions.includes(facility.id);
								return (
									<Button
										key={facility.id}
										variant="outline"
										size="sm"
										onClick={() => onSeatingToggle(facility.id)}
										className={cn(
											"h-auto py-1.5 px-3 rounded-lg text-[11px] font-medium transition-all border",
											isSelected
												? "border-primary bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]"
												: "border-border bg-muted/20 text-muted-foreground hover:bg-muted hover:text-foreground"
										)}
									>
										<span className="material-symbols-outlined text-[16px]! mr-1">
											{facility.icon}
										</span>
										{facility.label}
									</Button>
								);
							})}
						</div>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		</div>
	);
}
